# 🌐 AI-Powered Multilingual Ticket Translator

An enterprise-grade full-stack customer support platform that accepts tickets in **any language**, automatically detects the language, translates to English for the support team, analyses with AI, and translates engineer replies back to the customer's original language.

---

## 🚀 Live Demo

| | URL |
|--|--|
| 🌐 **Frontend** | https://profound-raindrop-b65e86.netlify.app |
| ⚙️ **Backend API** | https://multilingual-ticket-translator-kq9m.onrender.com |
| 📚 **API Docs** | https://multilingual-ticket-translator-kq9m.onrender.com/docs |

---

## 🔑 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@mtt.com | admin123 |
| Client | client@mtt.com | client123 |

> ⚠️ Note: Backend is hosted on Render free tier — it may take **30-60 seconds** to wake up on first visit. Open the backend URL first before demo.

---

## ✨ Features

### Client Side
- 📝 Submit tickets in **any language** — no language selection required
- 🔍 Auto language detection using Unicode script map + langdetect
- 📎 File attachments — upload `.txt`, `.pdf`, `.docx` files
- 📄 Automatic text extraction and translation from uploaded files
- 📊 View all submitted tickets with status tracking
- 💬 Receive admin replies translated back to your language

### Admin Side
- 📊 Live KPI Dashboard — Total, Pending, Resolved, Awaiting Translation
- 🌍 View tickets with automatic English translation
- 🤖 AI-powered response suggestions
- ✅ Accept / Reject / Resolve ticket status management
- 💬 Reply in English — auto-translated to customer's language
- 📁 File content extraction and translation

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js, Axios, React Router, React Icons |
| Backend | Python 3, FastAPI, Uvicorn |
| Database | PostgreSQL (Production) / SQLite (Dev) |
| ORM | SQLAlchemy |
| AI Model | Google Gemini 1.5 Flash + rule-based fallback |
| Translation | deep-translator (Google Translate) |
| Language Detection | Unicode Script Map + langdetect |
| Authentication | JWT (python-jose) + bcrypt |
| File Processing | PyPDF2, python-docx, Pillow |
| Deployment | Netlify (frontend) + Render (backend) |

---

## 🌍 Supported Languages

### Indian Languages (Detected Offline via Unicode Script Map)
Tamil, Hindi, Malayalam, Telugu, Kannada, Bengali, Gujarati, Punjabi, Odia, Marathi, Urdu

### International Languages
French, German, Spanish, Arabic, Chinese, Japanese, Korean, Portuguese, Russian, Italian, Turkish and 20+ more

---

## 🔄 System Workflow

---

## 📋 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | — | Register new user |
| POST | /api/auth/login | — | Login, returns JWT |
| GET | /api/auth/me | User | Get current user info |
| POST | /api/tickets/ | Client | Submit new ticket |
| GET | /api/tickets/ | User | Get tickets |
| GET | /api/tickets/{id} | User | Get ticket by ID |
| PUT | /api/tickets/{id}/status | Admin | Update ticket status |
| GET | /api/admin/kpi | Admin | Get KPI statistics |
| GET | /api/admin/tickets | Admin | Get all tickets |
| GET | /api/admin/tickets/{id}/suggestion | Admin | Get AI suggestion |
| POST | /api/admin/tickets/{id}/respond | Admin | Send response |
| POST | /api/translation/detect | User | Detect language |
| POST | /api/translation/translate | User | Translate text |
| GET | /api/translation/languages | User | Get supported languages |

---

## 💻 Local Setup

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 5000
```

### Frontend
```bash
cd frontend
npm install
npm start
```

---

## 🔐 Security Features

- JWT authentication with 24-hour token expiry
- PBKDF2-SHA256 password hashing (bcrypt)
- Role-based access control (client / admin)
- CORS configured for specific origins
- File type and size validation
- SQL injection prevention via SQLAlchemy ORM

---

## ⚠️ Known Limitations

- Render free tier sleeps after 15 min inactivity — open backend URL first
- PostgreSQL free tier expires after 90 days
- Gemini free tier — 15 requests/minute
- Image files (.png, .jpg) — text extraction requires OCR (not implemented)

---

## 👥 Team Members

See Team members details folder for more information.

---

## 📄 License

MIT License
