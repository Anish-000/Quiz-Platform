# ⚡ QuizMaster — Full-Stack Online Quiz Platform
 
![QuizMaster Banner](https://img.shields.io/badge/QuizMaster-Online%20Quiz%20Platform-4f46e5?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=node.js)
![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express)
![MySQL](https://img.shields.io/badge/MySQL-9.6-4479A1?style=for-the-badge&logo=mysql)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript)
 
A powerful, professional full-stack online quiz platform built with **Node.js**, **Express.js**, and **MySQL**. Features role-based authentication, server-controlled timed quizzes, real-time score calculation, admin dashboard for quiz management, and a modern responsive UI.
 
---
 
## 🌐 Live Demo
 
| Service | URL |
|---------|-----|
| 🖥️ Frontend | [quiz-platform.vercel.app](https://quiz-platform-eight-virid.vercel.app/) |
 
---
 
## ✨ Features
 
### 👨‍🎓 Student Features
- 📝 Register & login securely
- 🎯 Browse all available quizzes
- ⏱️ Take server-controlled timed quizzes
- 📊 View instant results with answer review
- 📋 Track personal quiz history & scores
- 🏆 View grades and performance analytics

### 🛠️ Admin Features
- 📊 Admin dashboard with platform statistics
- ➕ Create quizzes with custom time limits
- ❓ Add multiple-choice questions with correct answers
- ✏️ Edit and delete quizzes
- 👥 View all registered students
- 🏆 View and filter all quiz results
- 📈 Top performers leaderboard

### 🔐 Security Features
- JWT-based authentication
- Encrypted passwords with bcryptjs
- Role-based access control (Admin/Student)
- Server-side timer (tamper-proof)
- Protected API routes with middleware
---
 
## 🛠️ Tech Stack
 
| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) |
| **Backend** | Node.js, Express.js |
| **Database** | MySQL |
| **Authentication** | JWT (JSON Web Tokens) |
| **Password Hashing** | bcryptjs |
| **Frontend Hosting** | Vercel |
| **Backend Hosting** | Railway |
| **Database Hosting** | Railway MySQL |
 
---
 
## 📁 Project Structure

```
quiz-platform/
│
├── server/                         
│   ├── config/
│   │   └── db.js                 
│   ├── controllers/
│   │   ├── authController.js      
│   │   ├── quizController.js      
│   │   └── adminController.js     
│   ├── routes/
│   │   ├── authRoutes.js          
│   │   ├── quizRoutes.js          
│   │   └── adminRoutes.js         
│   ├── middleware/
│   │   └── authMiddleware.js      
│   └── server.js                  
│
├── client/                        
│   └── pages/
│       ├── index.html             
│       ├── login.html             
│       ├── register.html          
│       ├── dashboard.html         
│       ├── quizzes.html           
│       ├── quiz.html              
│       ├── results.html           
│       ├── history.html           
│       ├── css/
│       │   └── style.css          
│       └── admin/
│           ├── admin-dashboard.html  
│           ├── quiz-builder.html     
│           ├── manage-quizzes.html   
│           ├── students.html         
│           └── results.html          
│
├── .env                           
├── .env.example                   
├── .gitignore                     
└── package.json                   
```
 
---
 
## 🗄️ Database Schema

```sql
users           → id, name, email, password, role, created_at
quizzes         → id, title, description, time_limit, created_by, is_active
questions       → id, quiz_id, question_text, marks
options         → id, question_id, option_text, is_correct
quiz_attempts   → id, user_id, quiz_id, started_at, submitted_at, is_completed
results         → id, attempt_id, user_id, quiz_id, score, total_marks, percentage, time_taken
answers         → id, attempt_id, question_id, selected_option_id, is_correct
```
 
---
 
## 🚀 Getting Started (Local Setup)
 
### Prerequisites
- Node.js v18+ installed
- MySQL installed and running
- Git installed
### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/quiz-platform.git
cd quiz-platform
```
 
### 2️⃣ Install Dependencies
```bash
npm install
```
 
### 3️⃣ Set Up Environment Variables
Create a `.env` file in the root directory:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=quiz_platform
DB_PORT=3306
JWT_SECRET=your_super_secret_jwt_key
PORT=5000
```
 
### 4️⃣ Set Up the Database
Open MySQL Workbench or terminal and run:
```sql
CREATE DATABASE quiz_platform;
USE quiz_platform;
```
Then run all the table creation SQL from the schema above.
 
### 5️⃣ Start the Development Server
```bash
npm run dev
```
Server runs on `http://localhost:5000`
 
### 6️⃣ Open the Frontend
Navigate to `client/pages/index.html` in your browser or use Live Server in VS Code.
 
---
 
## 📡 API Endpoints
 
### Auth Routes (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT token |
 
### Quiz Routes (`/api/quiz`) — Requires Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/quiz` | Get all active quizzes |
| GET | `/api/quiz/:id` | Get quiz with questions |
| POST | `/api/quiz/:id/start` | Start a quiz attempt |
| POST | `/api/quiz/:id/submit` | Submit quiz answers |
| GET | `/api/quiz/my-results` | Get student's results |
| GET | `/api/quiz/results/:attemptId` | Get single result |
 
### Admin Routes (`/api/admin`) — Requires Admin Role
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Get dashboard stats |
| POST | `/api/admin/quiz` | Create new quiz |
| PUT | `/api/admin/quiz/:id` | Update quiz |
| DELETE | `/api/admin/quiz/:id` | Delete quiz |
| POST | `/api/admin/quiz/:id/question` | Add question |
| GET | `/api/admin/students` | Get all students |
| GET | `/api/admin/results` | Get all results |
 
---
 
## 🚢 Deployment
 
### Backend — Railway
1. Push code to GitHub
2. Create new project on [Railway](https://railway.app)
3. Deploy from GitHub repository
4. Add MySQL database service
5. Set environment variables in Railway dashboard
6. Generate public domain
### Frontend — Vercel
1. Import GitHub repository on [Vercel](https://vercel.com)
2. Set Root Directory to `client/pages`
3. Deploy — no environment variables needed

---

## 👨‍💻 Author
 
**Anish Chattopadhyay**
 
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Anish-000)
 
---
 
> Built with ❤️ using Node.js, Express.js & MySQL