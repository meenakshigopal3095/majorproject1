import os
import pandas as pd
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

BASE = os.path.dirname(__file__)
DATA = os.path.join(BASE, "data", "reviews.csv")
OUT = os.path.join(BASE, "ml_models")
os.makedirs(OUT, exist_ok=True)

df = pd.read_csv(DATA).dropna(subset=["review", "label"])
df["label"] = df["label"].astype(int)

if df["label"].nunique() < 2:
    raise ValueError("Training data must contain both labels 0 and 1.")

vectorizer = TfidfVectorizer(
    lowercase=True,
    stop_words="english",
    ngram_range=(1, 2),
    min_df=1,
    max_features=12000
)

x = vectorizer.fit_transform(df["review"].astype(str))
y = df["label"]

model = LogisticRegression(max_iter=1200, class_weight="balanced")
model.fit(x, y)

joblib.dump(
    {"model": model, "vectorizer": vectorizer},
    os.path.join(OUT, "review_model.joblib")
)

print("Model trained successfully.")
print(f"Rows used: {len(df)}")
print("Saved to:", os.path.join(OUT, "review_model.joblib"))
