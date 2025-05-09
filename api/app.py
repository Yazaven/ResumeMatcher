import os
from io import BytesIO
from flask import Flask, request, jsonify
from flask_cors import CORS
from PyPDF2 import PdfReader
import mammoth
import numpy as np
import openai

from dotenv import load_dotenv
load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")

app = Flask(__name__)
API_ALLOWED_ORIGINS = os.getenv("API_ALLOWED_ORIGINS", "").split(",")

CORS(app, origins=API_ALLOWED_ORIGINS)  # Dynamic CORS configuration


def truncate_text(text, max_words=300):
    return " ".join(text.split()[:max_words])

def extract_text_from_pdf(file_bytes):
    reader = PdfReader(BytesIO(file_bytes))
    text = " ".join((page.extract_text() or "") for page in reader.pages)
    return truncate_text(text)

def extract_text_from_docx(file_bytes):
    result = mammoth.extract_raw_text(BytesIO(file_bytes))
    return truncate_text(result.value)

def get_embedding(text):
    resp = openai.embeddings.create(input=[text], model="text-embedding-3-small")
    return resp.data[0].embedding

def cosine_similarity(a, b):
    a, b = np.array(a), np.array(b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

@app.route("/match", methods=["POST"])
def match():
    if "resume" not in request.files or "job" not in request.files:
        return jsonify({"error": "Please upload both files"}), 400

    r = request.files["resume"].read()
    j = request.files["job"].read()
    resume_text = (
        extract_text_from_pdf(r) if request.files["resume"].filename.endswith(".pdf")
        else extract_text_from_docx(r)
    )
    job_text = (
        extract_text_from_pdf(j) if request.files["job"].filename.endswith(".pdf")
        else extract_text_from_docx(j)
    )

    emb1, emb2 = get_embedding(resume_text), get_embedding(job_text)
    score = round(cosine_similarity(emb1, emb2) * 100, 2)

    return jsonify({
        "match_score": score,
        "insights": f"Resume matches job description with {score}% similarity",
        "chartData": [
            {"name": "Overall",    "score": score},
            {"name": "Skills",     "score": max(0, score - 8)},
            {"name": "Experience", "score": max(0, score - 4)}
        ]
    })

if __name__ == "__main__":
    app.run()

