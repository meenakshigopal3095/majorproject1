# TrustLensAI — AI-Powered Fake Review Detection & Trust Analytics

A full-stack major project for detecting suspicious/fake product reviews using Machine Learning.

## Project Scope

TrustLensAI is designed as a practical review-authenticity platform rather than a simple classifier. It combines:

- User signup/login authentication
- Review submission and AI analysis
- Fake/genuine probability score
- Explanation signals behind a prediction
- User review history
- Product-level review analytics
- Admin-only predefined login
- Admin dashboard with platform statistics
- Review moderation and status management
- SQLite database
- Trainable TF-IDF + Logistic Regression ML pipeline
- REST API architecture
- Responsive UI with collapsible sidebar
- Lucida Sans typography
- Capitalized UI text
- Hover effects and modern cards

## Technology Stack

### Frontend
- React
- Vite
- React Router
- Axios
- Lucida Sans

### Backend
- Python
- Flask
- Flask-CORS
- SQLAlchemy
- Werkzeug password hashing
- JWT authentication

### Machine Learning
- scikit-learn
- TF-IDF Vectorizer
- Logistic Regression
- Optional custom CSV training data

### Database
- SQLite
- SQLAlchemy ORM

## Default Admin Login

Username: admin
Password: Admin@12345

Change these values in `backend/.env` before production deployment.

## Project Structure

```text
FakeReviewShield/
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── models.py
│   ├── auth.py
│   ├── detector.py
│   ├── seed.py
│   ├── train_model.py
│   ├── requirements.txt
│   ├── .env.example
│   └── data/
│       └── reviews.csv
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── api.js
│       ├── styles.css
│       ├── components/
│       └── pages/
└── README.md
```


# Single-Go Execution Steps

## Terminal 1 — Backend

From the project root:

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python train_model.py
python seed.py
python app.py
```

Keep this terminal open.

## Terminal 2 — Frontend

Open a new terminal from the same project root:

```powershell
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## First-Time Setup Only

After the first successful setup, you normally only need:

### Terminal 1

```powershell
cd backend
venv\Scripts\activate
python app.py
```

### Terminal 2

```powershell
cd frontend
npm run dev
```

## Login

### User

Create an account through:

```text
http://localhost:5173/signup
```

### Admin

```text
Username: admin
Password: Admin@12345
```

Admin signup is intentionally disabled.

## Database

After running `python seed.py`, SQLite data is stored by Flask-SQLAlchemy in the backend instance directory:

```text
backend/instance/fake_review_shield.db
```

Open this file with DB Browser for SQLite to inspect the `user` and `review` tables.


# Simple Setup

## 1. Backend

Open terminal:

```bash
cd backend
python -m venv venv
```

Windows:

```bash
venv\Scripts\activate
```

Install packages:

```bash
pip install -r requirements.txt
```

Create environment file:

```bash
copy .env.example .env
```

Train the starter model:

```bash
python train_model.py
```

Create database and seed demo data:

```bash
python seed.py
```

Start backend:

```bash
python app.py
```

Backend runs at:

```text
http://127.0.0.1:5000
```

## 2. Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the displayed Vite URL, normally:

```text
http://localhost:5173
```

# User Flow

1. Create account.
2. Login.
3. Open Analyze Review.
4. Enter product name, rating and review text.
5. Click Analyze Review.
6. AI predicts Genuine or Suspicious.
7. View probability, signals and recommendation.
8. Review is stored in database.
9. Open History to view previous analyses.
10. Open Products to inspect product-level review signals.

# Admin Flow

Use:

```text
Username: admin
Password: Admin@12345
```

Admin can:

- View platform statistics
- View recent reviews
- Filter suspicious reviews
- Search reviews
- Change moderation status
- Inspect review analysis signals
- Monitor users and products

Admin has a completely different navigation and dashboard layout from normal users.

# ML Training

The included starter dataset is intentionally small so the project can run immediately.

For a stronger academic project, replace:

```text
backend/data/reviews.csv
```

with a larger labeled dataset containing:

```text
review,label
"The product arrived on time and worked well",0
"BEST PRODUCT EVER!!! BUY NOW!!!",1
```

Recommended label convention:

```text
0 = genuine
1 = fake/suspicious
```

Then run:

```bash
python train_model.py
```

The trained model is saved under:

```text
backend/ml_models/
```

# Major Project Extension Ideas

The architecture is intentionally ready for additional research modules:

- Transformer/BERT comparison model
- Reviewer behavior anomaly detection
- Duplicate review detection
- Burst-review detection
- Sentiment consistency analysis
- Rating-text mismatch detection
- Product-level risk scoring
- Explainable AI
- Admin moderation queue
- Email verification
- Password reset
- PostgreSQL deployment
- Docker deployment
- Cloud deployment
- Graph-based reviewer/product relationship analysis
- Real marketplace API integration where permitted

# Academic Project Title

## AI-DRIVEN FAKE REVIEW DETECTION AND REVIEW TRUST ANALYTICS PLATFORM

Alternative:

## TrustLensAI: An Explainable AI Platform for Detecting Fraudulent Online Reviews

# Important Note

The classifier is a decision-support system. "Suspicious" does not prove that a review is fraudulent. In a production system, moderation should combine model output with additional evidence.


# Admin Management

The Admin Console now supports full management operations:

## Users
- View all registered users
- Search users
- Edit name and email
- Delete users
- Deleting a user also deletes their stored reviews

## Reviews
- View all reviews
- Search and filter reviews
- Edit product, rating, text and moderation status
- Mark Reviewed
- Escalate
- Delete reviews

These operations are implemented in both the React frontend and Flask backend with admin-only JWT authorization.
