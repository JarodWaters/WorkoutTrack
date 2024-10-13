import React, { useState } from 'react';
import axios from 'axios';

function Login({ setUserId }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send login credentials to backend
      const response = await axios.post('http://localhost:5000/api/login', {
        username,
        password,
      });

      // If login is successful, set the userId in the parent component
      setUserId(response.data.userId);
      console.log("Logged in userId:", response.data.userId);
    } catch (error) {
      console.error('Error logging in:', error);
      setError('Invalid username or password');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full"
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full"
          />
        </div>
        {error && <p className="text-red-600">{error}</p>}
        <button type="submit" className="p-2 bg-blue-600 text-white rounded">
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
