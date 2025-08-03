
from sqlalchemy.orm import Session
from ..models.models import Activity

# AI tabanlı metin sadeleştirme servisi
# Google Gemini API entegrasyonu
import os
import google.generativeai as genai

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def simplify_text_with_gemini(raw_text: str, target_level: int) -> str:
    """
    Google Gemini 2.5 Flash API ile metni sadeleştirir.
    """
    if not GEMINI_API_KEY:
        # API anahtarı yoksa hata döndür
        raise Exception("GEMINI_API_KEY tanımlı değil.")

    prompt = f"""
    Aşağıdaki metni disleksi öğrencisi için {target_level} zorluk seviyesinde sadeleştir:
    Metin: {raw_text}
    Sadece sadeleştirilmiş metni döndür.
    """
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        # Metindeki \n karakterlerini boşlukla değiştir, \\" veya \\ → " ve kaçışlı çift tırnakları düzelt
        temiz_metin = response.text.strip().replace("\n", " ")
        # Önce \" → " çevir, sonra kalan \\ → " çevir
        temiz_metin = temiz_metin.replace('\\"', '"').replace('\\', '"')
        return temiz_metin
    except Exception as e:
        # Hata olursa orijinal metni döndür, aynı temizlik işlemleriyle
        temiz_metin = raw_text.replace("\n", " ")
        temiz_metin = temiz_metin.replace('\\"', '"').replace('\\', '"')
        return temiz_metin

def simplify_text(raw_text: str, target_level: int) -> dict:
    simplified = simplify_text_with_gemini(raw_text, target_level)
    return {
        "simplified_text": simplified,
        "level": target_level
    }


# Gemini ile kategoriye göre kısa ve sade metin üretme servisi
def generate_text_with_gemini(category: str) -> str:
    """
    Google Gemini 2.5 Flash API ile kategoriye uygun kısa ve sade metin üretir.
    """
    if not GEMINI_API_KEY:
        raise Exception("GEMINI_API_KEY tanımlı değil.")

    prompt = f"""
    7–12 yaş arası disleksi öğrencileri için, ‘{category}’ kategorisinde sade, kısa bir okuma metni üret.
    Sadece metni döndür.
    """
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        # Metindeki \n karakterlerini boşlukla değiştir, \\" veya \\ → " ve kaçışlı çift tırnakları düzelt
        temiz_metin = response.text.strip().replace("\n", " ")
        temiz_metin = temiz_metin.replace('\\"', '"').replace('\\', '"')
        return temiz_metin
    except Exception as e:
        return "Metin üretilemedi."


def generate_text(category: str) -> dict:
    text = generate_text_with_gemini(category)
    return {
        "uretilen_metin": text,
        "kategori": category
    }

# Gemini ile anlamaya yönelik 5 soru ve cevabı üretme servisi
def generate_comprehension_questions_with_gemini(db: Session, activity_id: int) -> list[dict]:
    """
    Belirli bir aktivitenin content alanına göre 5 anlamaya yönelik soru ve cevabı üretir, doğru cevapları kaydeder.
    """
    if not GEMINI_API_KEY:
        raise Exception("GEMINI_API_KEY tanımlı değil.")

    # Aktiviteyi bul
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise Exception("Aktivite bulunamadı.")

    prompt = f"""
    Aşağıdaki okuma metnine göre, disleksi çocukları için anlamaya yönelik 5 kısa soru üret. Her soru için doğru cevabı da ver. Format: [{{"question_text": "soru metni", "correct_answer": "doğru cevap"}}]
    Metin: {activity.content}
    Sadece JSON formatında yanıt ver.
    """
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        import json
        # Temizle ve JSON'a çevir
        text = response.text.strip().replace("\n", " ")
        text = text.replace('\\"', '"').replace('\\', '"')
        # JSON array'i bulmaya çalış
        start = text.find('[')
        end = text.rfind(']')
        if start != -1 and end != -1:
            text = text[start:end+1]
        sorular = json.loads(text)
        
        # Yeni format: Soruların tamamını obje olarak kaydet
        activity.questions = json.dumps(sorular, ensure_ascii=False)
        # Doğru cevapları ayrı olarak da kaydet (backward compatibility için)
        correct_answers_only = [item.get("correct_answer", "") for item in sorular if "correct_answer" in item]
        activity.correct_answers = json.dumps(correct_answers_only, ensure_ascii=False)
        db.commit()
        return sorular
    except Exception as e:
        raise Exception(f"Soru üretilemedi: {str(e)}")
    
# Yardım botu için AI chatbot açıklama servisi
def yardim_bot_cevabi_uret(soru: str) -> str:
    """
    AI, çocuklara uygun, kısa ve sade bir açıklama döner.
    """
    if not GEMINI_API_KEY:
        raise Exception("GEMINI_API_KEY tanımlı değil.")
    prompt = f"""
    Aşağıdaki soruyu 7-12 yaş arası bir çocuğa açıklama yapar gibi, kısa, açık ve basit bir dille açıkla. Teknik terim veya karmaşık açıklama kullanma. Sadece açıklamayı döndür.Fazla uzatmadan yanıtla.
    Soru: {soru}
    """
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        yanit = response.text.strip().replace("\n", " ")
        yanit = yanit.replace('\"', '"').replace('\\', '"')
        return yanit
    except Exception as e:
        return "Açıklama üretilemedi."