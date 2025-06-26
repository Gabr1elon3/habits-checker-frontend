import React, { useState } from 'react';
import API from '../../services/api';

function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await API.post('/users/register', form);
      alert('User registered! Token: ' + res.data.token);
    } catch (err) {
  console.error(err); //  debugging
  const errorMessage =
    err.response?.data?.message || err.message || 'An error occurred';
  alert('Error: ' + errorMessage);
}
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      <input name="username" placeholder="Username" onChange={handleChange} required />
      <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
      <button type="submit">Register</button>
    </form>
  );
}

export default Register;
