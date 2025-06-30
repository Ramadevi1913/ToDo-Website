# To-Do List Web Application

A full-stack, real-time To-Do List application built for the Katomaran Hackathon. This application allows users to sign up using email/password or Google, manage their tasks, and view updates instantly.

---

## ✨ Live Demo

**Check out the live deployed application here:**

**[https://to-do-website-nu.vercel.app/](https://to-do-website-nu.vercel.app/)**

---

## 🚀 Features

*   **Secure Authentication:** Users can sign up and log in via Email/Password or Google OAuth 2.0.
*   **Full CRUD Operations:** Create, Read, Update (status), and Delete tasks.
*   **Real-Time Updates:** All connected clients see updates instantly using WebSockets (Socket.io).
*   **Task Filtering:** Filter tasks by "All", "Active", and "Completed" status.
*   **Responsive Design:** A clean, modern UI that works on both desktop and mobile.
*   **User-Friendly Interface:** Hover effects, smooth animations, and toast notifications for a great user experience.

---

## 🛠️ Tech Stack

*   **Frontend:** React (Vite), Axios, Socket.io Client, React Router, React Hot Toast
*   **Backend:** Node.js, Express.js, Mongoose
*   **Database:** MongoDB Atlas
*   **Authentication:** Passport.js (Google Strategy), JWT, bcrypt
*   **Real-Time Engine:** Socket.IO
*   **Deployment:**
    *   Backend on **Render**
    *   Frontend on **Vercel**

---

## 🏗️ Project Architecture

The application follows a standard client-server model:

*   The **React Frontend**, hosted on Vercel, serves the user interface.
*   The **Node.js/Express Backend**, hosted on Render, provides a RESTful API for all data operations.
*   **MongoDB Atlas** serves as the cloud-hosted NoSQL database.
*   **Socket.IO** establishes a persistent WebSocket connection between the client and server for real-time communication.

*(Here you would embed your architecture diagram image after you create and upload it)*

`![Architecture Diagram](link_to_your_diagram.png)`


---

## 🎬 Loom Demo Video

A walkthrough of the application's features and functionality:

*(Paste the link to your Loom video here once you record it)*

`[https://www.loom.com/share/your_video_id](https://www.loom.com/share/your_video_id)`

---

## ⚙️ Running Locally

1.  Clone the repository:
    `git clone https://github.com/Ramadevi1913/ToDo-Website.git`
2.  **Backend Setup:**
    ```bash
    cd backend
    npm install
    # Create a .env file based on the .env.example
    npm start
    ```
3.  **Frontend Setup:**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

---

This project is a part of a hackathon run by https://www.katomaran.com