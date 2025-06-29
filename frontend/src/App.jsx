// frontend/src/App.jsx
// This is the COMPLETE, FINAL version with all features and enhancements.

import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import axios from 'axios';
import io from 'socket.io-client';

// Icon Imports
import { FaRegCircle, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import { BsCardChecklist } from "react-icons/bs";

// Toast Notification Imports
import { Toaster, toast } from 'react-hot-toast';

// Component & Styling Imports
import AuthPage from './AuthPage';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const socket = io(API_URL);

// --- Main App Component ---
function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    toast.success("Logged out successfully!");
  }, []);
  
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        if (jwtDecode(storedToken).exp * 1000 < Date.now()) handleLogout();
        else setToken(storedToken);
      } catch { handleLogout(); }
    }
  }, [handleLogout]);
  
  useEffect(() => {
    if(token) {
       axios.get(`${API_URL}/api/user/me`, { headers: { 'Authorization': `Bearer ${token}` }})
         .then(res => setUser(res.data))
         .catch(() => handleLogout());
    } else { setUser(null); }
  }, [token, handleLogout]);

  function PrivateRoute({ children }) {
    return token ? children : <Navigate to="/login" />;
  }
  
  function LoginPageWrapper() {
    return token ? <Navigate to="/dashboard" /> : <AuthPage setToken={setToken} />;
  }

  return (
    <Router>
      <Toaster position="bottom-right" toastOptions={{
          className: 'toast-style',
          duration: 4000,
          style: { background: '#363636', color: '#fff' }
      }}/>
      <div className="App">
        <header className="app-header">
            <div className="header-title">
                <BsCardChecklist />
                <h1>To-Do List</h1>
            </div>
            {user && (
              <div className='user-info'>
                <img src={user.image} alt={user.displayName} />
                <span>{user.displayName}</span>
                <button onClick={handleLogout} className='logout-button btn'>Logout</button>
              </div>)}
        </header>
        <main>
          <Routes>
            <Route path="/login" element={<LoginPageWrapper />} />
            <Route path="/dashboard" element={<PrivateRoute><DashboardPage token={token} /></PrivateRoute>} />
            <Route path="/login/success" element={<LoginSuccessHandler setToken={setToken} />} />
            <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}


// --- Dashboard Component ---
const DashboardPage = ({ token }) => {
    const [tasks, setTasks] = useState([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [filter, setFilter] = useState('all');

    const fetchTasks = useCallback(async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${API_URL}/api/tasks`, { headers: { 'Authorization': `Bearer ${token}` } });
        setTasks(res.data);
      } catch (err) { console.error("Could not fetch tasks:", err); }
    }, [token]);
  
    useEffect(() => {
      fetchTasks();
      socket.on('tasks_updated', fetchTasks);
      return () => { socket.off('tasks_updated', fetchTasks); };
    }, [fetchTasks]);
  
    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) {
            return toast.error('Task title cannot be empty.');
        }
        
        // Use toast.promise for clean loading/success/error states
        const promise = axios.post(`${API_URL}/api/tasks`, { title: newTaskTitle }, { headers: { 'Authorization': `Bearer ${token}` }});
        toast.promise(promise, {
            loading: 'Adding task...',
            success: () => {
                setNewTaskTitle(''); // Clear input only on success
                return 'Task added successfully!';
            },
            error: 'Failed to add task.',
        });
    };

    const handleDeleteTask = async (id) => { 
        const promise = axios.delete(`${API_URL}/api/tasks/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
        toast.promise(promise, {
            loading: 'Removing task...',
            success: 'Task removed!',
            error: 'Failed to remove task.',
        });
    };

    const handleStatusChange = async (task) => {
        const statusCycle = { todo: 'inprogress', inprogress: 'done', done: 'todo' };
        const newStatus = statusCycle[task.status];
        
        // Optimistically update UI for a faster feel, then send request
        const originalTasks = [...tasks];
        setTasks(prevTasks => prevTasks.map(t => t._id === task._id ? {...t, status: newStatus} : t));

        try {
            await axios.put(`${API_URL}/api/tasks/${task._id}`, { status: newStatus }, { headers: { 'Authorization': `Bearer ${token}` }});
        } catch (err) {
            toast.error('Update failed. Reverting.');
            setTasks(originalTasks); // Revert UI if the API call fails
            console.error("Failed to update status", err);
        }
    };

    const filteredTasks = tasks.filter(task => {
        if (filter === 'completed') return task.status === 'done';
        if (filter === 'active') return task.status === 'todo' || task.status === 'inprogress';
        return true;
    });

    const StatusIcon = ({ status }) => {
        if (status === 'done') return <FaCheckCircle className="status-icon done" />;
        if (status === 'inprogress') return <FaSpinner className="status-icon inprogress" />;
        return <FaRegCircle className="status-icon todo" />;
    };
  
    return (
      <div className="dashboard">
        <div className="task-form-container">
            <form onSubmit={handleAddTask} className="task-form">
                <input type="text" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} placeholder="What's your next great idea?" />
                <button type="submit" className="btn add-task-btn">Add Task</button>
            </form>
        </div>
        <div className="filter-controls">
            <button onClick={() => setFilter('all')} className={`filter-btn ${filter === 'all' ? 'active' : ''}`}>All</button>
            <button onClick={() => setFilter('active')} className={`filter-btn ${filter === 'active' ? 'active' : ''}`}>Active</button>
            <button onClick={() => setFilter('completed')} className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}>Completed</button>
        </div>
        <ul className="task-list">
            {filteredTasks.length > 0 ? (
                filteredTasks.map(task => (
                    <li key={task._id} className={`task-item ${task.status}`}>
                        <button className="status-button" onClick={() => handleStatusChange(task)}> <StatusIcon status={task.status} /> </button>
                        <span className="task-title">{task.title}</span>
                        <button onClick={() => handleDeleteTask(task._id)} className="delete-button">✖</button>
                    </li>
                ))
            ) : ( <li className="no-tasks">
                    {filter === 'completed' ? "No completed tasks yet." : 
                     filter === 'active' ? "You're all caught up!" : 
                     "Your task list is empty. Add a new task to get started!"}
                </li> )}
        </ul>
      </div> ); };

// --- Login Success Handler Component ---
const LoginSuccessHandler = ({ setToken }) => {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const tokenFromUrl = new URLSearchParams(location.search).get('token');
    if (tokenFromUrl) { 
        localStorage.setItem('token', tokenFromUrl); 
        setToken(tokenFromUrl); 
        navigate('/dashboard');
    } else { navigate('/login'); }
  }, [navigate, setToken, location]);
  return <div>Logging you in...</div>;
};

export default App;