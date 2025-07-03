import React, { useState } from 'react';
import api from '../api';
import '../css/LoginPage.css';

// Dev
// const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setMessage('Logging in....');
    api.post('/userRoutes/login', JSON.stringify({ username, password }))
      .then(res => res.data)
      .then(async data => {
        if (data.success) {
          console.log(data);
          setMessage(`Welcome ${data.username}`);
          // Redirect to Firm Selection
          window.location.href = '/select-firm';
        } else {
          setMessage(data.message || 'Failed to login');
        }
      })
      .catch(err => {
        if (err.response) {
          // The request was made and the server responded with a status code that falls out of the range of 2xx
          console.error('Login error:', err);
          setMessage(`Error: ${err.response.message}` || 'Login failed');
        } else if (err.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an http.ClientRequest in node.js
          console.error("No response received:", err.request);
          setMessage('Error connecting to server');
        } else {
          console.error("Error message:", err.message);
          setMessage('Error connecting to server');
        }
      });
  };

  return (
    <div className='login-container'>
      <div className='login-card'>
      <h2>Login</h2>
      <form className='login-form' onSubmit={handleSubmit}>
        <div className='.login-input'>
          <label>Username: 
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
        </div>
        <div className='.login-input'>
          <label>Password: 
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
        </div>
        <button className='.login-button' type="submit">Login</button>
      </form>
      {message && <p className='.login-message'>{message}</p>}
      </div>
    </div>
  );
}