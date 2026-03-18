# 🐾 Digital Zoo Management and Animal Monitoring System

## 📌 Overview

The Digital Zoo Management and Animal Monitoring System is a full-stack web application designed to streamline and digitize zoo operations. It provides a centralized platform for managing animal records, monitoring health conditions, tracking medications, and handling administrative activities efficiently. The system reduces dependency on manual processes and ensures organized, secure, and scalable data management.

---

## 🎯 Objectives

* Automate and simplify zoo management processes
* Ensure proper monitoring of animal health and medical records
* Provide centralized control for administrative operations
* Improve efficiency and reduce manual errors

---

## 🚀 Features

### 🐘 Animal Management

* Add, update, and delete animal records
* Store detailed information such as species, age, habitat, and status

### ❤️ Health Monitoring

* Maintain animal health records
* Track diseases, treatments, and medical history

### 💊 Medication Tracking

* Record prescribed medications and treatments
* Monitor ongoing and completed treatments

### 👨‍⚕️ Staff & Veterinary Management

* Manage zoo staff and veterinary roles
* Assign responsibilities and maintain records

### 📊 Dashboard & Analytics

* Display summarized statistics of animals and operations
* Provide insights for better decision-making

### 🔐 Authentication & Authorization

* Secure login using JWT authentication
* Role-based access control (Admin, Staff, Vet)

### 📁 File Upload System

* Upload and manage animal images and reports

---

## 📁 Folder Structure

```bash
digital-zoo-management/
│
├── config/             
├── controllers/        
├── middleware/         
├── models/             
├── routes/             
│
├── public/             
├── views/              
├── uploads/            
│
├── database/           
│
├── .gitignore          
├── package.json        
├── package-lock.json   
├── server.js           
└── README.md           
```

---

## 🏗️ System Architecture

```
Client (Browser)
       ↓
Frontend (HTML, CSS, JS)
       ↓
Backend (Node.js + Express)
       ↓
Database (MySQL)
```

---

## 🛠️ Tech Stack

### 💻 Frontend

* HTML5
* CSS3
* JavaScript

### ⚙️ Backend

* Node.js
* Express.js

### 🗄️ Database

* MySQL

### 🔐 Tools & Libraries

* JWT (Authentication)
* Multer (File Upload Middleware)
* REST APIs

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/priyanshukrgupta/digital-zoo-management.git
cd digital-zoo-management
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Setup Database

```sql
CREATE DATABASE zoo_db;
```

* Import the provided SQL file into MySQL

---

### 4️⃣ Configure Environment Variables

Create a `.env` file:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=zoo_db
JWT_SECRET=your_secret_key
```

---

### 5️⃣ Run the Application

```bash
npm start
```

---

## 🚀 Usage

* Login using valid credentials
* Admin can manage animals, staff, and system data
* Staff/Vet can update animal health and track treatments
* Dashboard provides insights into zoo operations

---

## 📷 Screenshots

![Login](./screenshots/login.png)
![Dashboard](./screenshots/dashboard.png)
![Animals](./screenshots/animals.png)

---

## 🔒 Security Features

* JWT-based authentication
* Role-based authorization
* Protected API routes
* Secure handling of sensitive data

---

## 📈 Future Enhancements

* Integration with IoT sensors for real-time animal monitoring
* Advanced reporting and data visualization dashboard
* Notification system for health alerts and task reminders
* Multi-zoo management support in a single platform

---

## 👨‍💻 Author

**Priyanshu Kumar Gupta**

---

## ⭐ Note

The `uploads` folder contains sample images for demonstration. Actual images can be uploaded dynamically during runtime.
