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
        # Yanıtı sadeleştirilmiş metin olarak döndür
        return response.text.strip()
    except Exception as e:
        # Hata olursa orijinal metni döndür
        return raw_text

def simplify_text(raw_text: str, target_level: int) -> dict:
    simplified = simplify_text_with_gemini(raw_text, target_level)
    return {
        "simplified_text": simplified,
        "level": target_level
    }
