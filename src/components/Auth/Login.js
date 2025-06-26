import React, { useState } from 'react';
import API from '../../services/api';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await API.post('/users/login', formData);
    console.log('Login response:', res.data);  // ✅ Check this in browser console
    alert('Logged in successfully');
    localStorage.setItem('token', res.data.token);  // ✅ This should now work
  } catch (err) {
    console.error('Login failed:', err);  // ✅ See full error in console
    const errorMessage = err.response?.data?.message || err.message || 'Login failed';
    alert('Error: ' + errorMessage);
  }
};


  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
      /><br/>
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        required
      /><br/>
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;
