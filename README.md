# To-Do List Web Application

A full-stack, real-time task management application built for the Katomaran Hackathon. It features a modern UI, secure user authentication, and real-time data synchronization.

[![Live App](https://img.shields.io/badge/Live_Demo-Vercel-brightgreen?style=for-the-badge&logo=vercel)](https://to-do-website-nu.vercel.app/)

---

## ✨ Key Features

- **Dual Authentication**: Secure sign-up/login with both **Email/Password** and **Google OAuth 2.0**.
- **Real-Time Task Management**: Create, read, update, and delete tasks with changes instantly reflected across all clients using **Socket.IO**.
- **Dynamic Task Status**: Cycle tasks through `To Do`, `In Progress`, and `Completed` states.
- **Task Filtering**: Instantly filter the task list to view `All`, `Active`, or `Completed` items.
- **Responsive & Modern UI**: A clean, professional interface built with React that works seamlessly on desktop and mobile devices.
- **Enhanced User Experience**: Features subtle animations, hover effects, and toast notifications for a polished feel.

---

## 🛠️ Tech Stack

| Category      | Technology                                    |
| ------------- | --------------------------------------------- |
| **Frontend**  | React (Vite), React Router, Axios, Socket.IO Client |
| **Backend**   | Node.js, Express.js                           |
| **Database**  | MongoDB Atlas                                 |
| **Auth**      | JWT, Passport.js, Google OAuth, bcrypt.js     |
| **Deployment**| Vercel (Frontend), Render (Backend)           |

---

## 🏗️ Architecture

This application utilizes a robust client-server architecture:
- **Frontend**: A dynamic single-page application built with React and hosted on Vercel.
- **Backend**: A RESTful API built with Node.js/Express and hosted on Render, handling all business logic and database interactions.
- **Database**: A NoSQL MongoDB cluster hosted on Atlas for scalable and flexible data storage.
- **Real-Time Layer**: A persistent WebSocket connection managed by Socket.IO ensures immediate data synchronization.

*(Your Architecture Diagram PNG can be added here)*

---

## 🚀 Live Demo & Links

- **Live Application**: **[https://to-do-website-nu.vercel.app](https://to-do-website-nu.vercel.app)**
- **GitHub Repository**: **[https://github.com/Ramadevi1913/ToDo-Website](https://github.com/Ramadevi1913/ToDo-Website)**
- **Loom Demo**: *(Replace with your Loom video link)*

---

This project is a part of a hackathon run by https://www.katomaran.com
