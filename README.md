🐾 Digital Zoo Management and Animal Monitoring System
📌 Overview

The Digital Zoo Management and Animal Monitoring System is a full-stack web application designed to streamline and digitize zoo operations. It provides a centralized platform to manage animal records, monitor health conditions, track medications, and handle administrative tasks efficiently. The system replaces manual record-keeping with a structured, secure, and scalable solution.

🎯 Objectives

Automate zoo management processes

Ensure proper monitoring of animal health

Provide centralized administrative control

Reduce manual errors and improve efficiency

🚀 Features
🐘 Animal Management

Add, update, and delete animal records

Maintain details such as species, age, habitat, and status

❤️ Health Monitoring

Track animal health conditions

Maintain medical history and reports

💊 Medication Tracking

Record treatments and medications

Monitor ongoing and past treatments

👨‍⚕️ Staff & Veterinary Management

Manage zoo staff and veterinary roles

Assign and manage responsibilities

📊 Dashboard & Analytics

View summarized statistics and reports

Monitor zoo operations efficiently

🔐 Authentication & Security

Secure login system using JWT

Role-based access control (Admin, Staff, Vet)

📁 File Upload

Upload animal images and medical reports

📁 Folder Structure
digital-zoo-management/
│
├── controllers/        # Business logic
├── routes/             # API endpoints
├── middleware/         # Authentication & authorization
├── models/             # Database operations
├── config/             # Database configuration
│
├── public/             # Static files (CSS, JS, images)
├── views/              # Frontend UI pages
├── uploads/            # Uploaded files
│
├── database/           # SQL files
│
├── .env                # Environment variables
├── .gitignore          # Ignored files
├── package.json        # Dependencies
├── package-lock.json
├── server.js           # Entry point
└── README.md
🏗️ System Architecture
Client (Browser)
       ↓
Frontend (HTML, CSS, JS)
       ↓
Backend (Node.js + Express)
       ↓
Database (MySQL)
🛠️ Tech Stack
💻 Frontend

HTML5

CSS3

JavaScript

⚙️ Backend

Node.js

Express.js

🗄️ Database

MySQL

🔐 Tools & Libraries

JWT (Authentication)

Multer (File Upload)

REST APIs

⚙️ Installation & Setup
1️⃣ Clone Repository
git clone <your-repo-link>
cd digital-zoo-management
2️⃣ Install Dependencies
npm install
3️⃣ Setup Database

Open MySQL

Create database:

CREATE DATABASE zoo_db;

Import the provided .sql file

4️⃣ Configure Environment Variables

Create a .env file:

PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=zoo_db
JWT_SECRET=your_secret_key
5️⃣ Run the Application
npm start
🚀 Usage

Login using credentials

Admin can:

Manage animals

Manage staff

View analytics

Staff/Vet can:

Update animal health

Track medications

🔒 Security Features

JWT-based authentication

Role-based authorization

Protected API routes

Secure data handling

📷 Screenshots

Add your project screenshots here for better presentation

📈 Future Enhancements

📱 Mobile application (APK support)

🤖 AI-based animal health prediction

📡 IoT-based real-time monitoring

🎟️ Online ticket booking system

📊 Advanced analytics dashboard

👨‍💻 Author

Priyanshu Kumar Gupta
