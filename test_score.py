#!/usr/bin/env python3
import requests
import json

# Test için endpoint'e istek gönder
url = "http://localhost:8003/api/aktiviteler/ogrenci/12/cevapla"
headers = {
    "Content-Type": "application/json",
}

# Test verileri - tüm cevaplar yanlış
data = {
    "student_id": 1,
    "cevaplar": ["a", "a", "a", "a", "a"]
}

try:
    response = requests.post(url, headers=headers, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
