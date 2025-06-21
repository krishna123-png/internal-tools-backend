# AI-Powered Internal Tools Platform – Backend

This is the backend service for the AI-Powered Internal Tools Platform, a full-stack SaaS-style application offering a suite of productivity tools including an AI Assistant, Code Generator, Document Summarizer, and Resume Analyzer.

## 🚀 Features

- 🔐 **User Authentication**
  - Register / Login
  - JWT-based token system
  - Role-based access control (Admin/User)

- 🤖 **AI Tool APIs**
  - General Chat Assistant
  - Code Generator & Debugger
  - Document Summarizer
  - Resume Analyzer

- 📊 **Usage Logging**
  - Track API usage per user and tool
  - Admin analytics

- 📦 **RESTful API**
  - Modular controllers and routes
  - Follows clean architecture principles

---

## 📁 Project Structure
/controllers
/models
/routes
/middlewares
/utils
server.js
.env


---

## ⚙️ Technologies Used

- Node.js
- Express.js
- MongoDB (via Mongoose)
- OpenAI / Claude APIs
- JWT (jsonwebtoken)
- dotenv, bcrypt, cors


📬 API Endpoints
Method	Endpoint	Description
POST	/api/auth/register	Register new user
POST	/api/auth/login	Login user
GET	/api/tools/assistant	Ask general AI assistant
POST	/api/tools/codegen	Generate/fix code
POST	/api/tools/summarize	Summarize uploaded document
POST	/api/tools/resume-review	Analyze uploaded resume
GET	/api/usage/logs	Admin-only usage analytics

