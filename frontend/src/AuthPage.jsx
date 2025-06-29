import React, { useState } from 'react';
import axios from 'axios';

// The address of our backend API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AuthPage = ({ setToken }) => {
  // 'isLoginMode' decides if we show the Login or Signup form
  const [isLoginMode, setIsLoginMode] = useState(true);

  // 'formData' holds what the user types into the form
  const [formData, setFormData] = useState({ displayName: '', email: '', password: '' });
  
  // 'error' will hold any error messages from the server
  const [error, setError] = useState('');

  const { displayName, email, password } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  const onSubmit = async e => {
    e.preventDefault();
    setError(''); // Clear old errors

    const url = isLoginMode ? `${API_URL}/api/auth/login` : `${API_URL}/api/auth/register`;
    const payload = isLoginMode ? { email, password } : { displayName, email, password };
    
    try {
        // Send the form data to the backend API
        const res = await axios.post(url, payload);
        const receivedToken = res.data.token;
        localStorage.setItem('token', receivedToken); // Save token in browser
        setToken(receivedToken); // Update the app's state to log the user in
    } catch (err) {
        // If the server sends an error, display it
        setError(err.response?.data?.msg || 'An unknown error occurred.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>{isLoginMode ? 'Login' : 'Signup'}</h2>

        <form onSubmit={onSubmit}>
          {!isLoginMode && (
            <input type="text" name="displayName" value={displayName} onChange={onChange} placeholder="John Doe" required />
          )}
          <input type="email" name="email" value={email} onChange={onChange} placeholder="john.doe@example.com" required />
          <input type="password" name="password" value={password} onChange={onChange} placeholder="••••••••" required minLength="6" />
          
          {error && <p className="error-message">{error}</p>}
          
          <button type="submit" className="auth-button">
            {isLoginMode ? 'Login' : 'Signup'}
          </button>
        </form>
        
        <div className="divider">OR</div>
        <button onClick={handleGoogleLogin} className="google-button">Sign in with Google</button>
        
        <p className="switcher">
          {isLoginMode ? "Don't have an account?" : "Already have an account?"}
          <span onClick={() => setIsLoginMode(!isLoginMode)}>
            {isLoginMode ? ' Signup' : ' Login'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;