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
