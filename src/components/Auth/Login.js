import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate(); // 👈 for redirecting after login

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/users/login', formData);
      localStorage.setItem('token', res.data.token);
      alert('Logged in successfully');
      navigate('/tasks'); // 👈 redirect after login
    } catch (err) {
      console.error('Login failed:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      alert('Error: ' + errorMessage);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <form 
        onSubmit={handleSubmit}
        className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-md border border-gray-100"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
          Login to TaskMaster Pro
        </h2>
        
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full mb-4 px-5 py-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-indigo-200 text-lg"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full mb-6 px-5 py-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-indigo-200 text-lg"
        />
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-5 py-3 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all text-xl font-semibold"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
