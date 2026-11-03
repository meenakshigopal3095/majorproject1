import os
import re
import json
import joblib

BASE = os.path.dirname(__file__)
MODEL_DIR = os.path.join(BASE, "ml_models")
MODEL_PATH = os.path.join(MODEL_DIR, "review_model.joblib")

def heuristic_signals(text, rating):
    t = text.strip()
    signals = []

    if len(t) < 35:
        signals.append("Very short review text")
    if len(t) > 700:
        signals.append("Unusually long review")
    if re.search(r"(.)\1{4,}", t.lower()):
        signals.append("Repeated-character pattern")
    if t.count("!") >= 3:
        signals.append("Excessive exclamation marks")
    if len(re.findall(r"\b(best|amazing|perfect|awesome|must buy|buy now)\b", t.lower())) >= 2:
        signals.append("Promotional language")
    if rating == 5 and len(t) < 45:
        signals.append("High rating with limited detail")
    if sum(c.isupper() for c in t) > max(10, len(t) * 0.25):
        signals.append("Unusually high uppercase usage")

    return signals

def predict(text, rating):
    signals = heuristic_signals(text, rating)

    if os.path.exists(MODEL_PATH):
        bundle = joblib.load(MODEL_PATH)
        model = bundle["model"]
        vectorizer = bundle["vectorizer"]
        x = vectorizer.transform([text])
        probs = model.predict_proba(x)[0]
        classes = list(model.classes_)
        fake_index = classes.index(1) if 1 in classes else 0
        fake_probability = float(probs[fake_index])
    else:
        # Safe fallback before the model is trained.
        fake_probability = min(
            0.95,
            0.12 + len(signals) * 0.13
        )

    # Add interpretable rules without replacing the ML model.
    fake_probability = min(0.98, fake_probability + min(0.22, len(signals) * 0.025))

    prediction = "Suspicious" if fake_probability >= 0.50 else "Genuine"
    confidence = abs(fake_probability - 0.50) * 2

    if not signals and prediction == "Genuine":
        signals.append("No strong rule-based risk signals detected")

    recommendation = (
        "Review manually before trusting this review."
        if prediction == "Suspicious"
        else "Review appears low-risk based on current signals."
    )

    return {
        "prediction": prediction,
        "fake_probability": round(fake_probability * 100, 2),
        "genuine_probability": round((1 - fake_probability) * 100, 2),
        "confidence": round(confidence * 100, 2),
        "signals": signals,
        "recommendation": recommendation
    }
