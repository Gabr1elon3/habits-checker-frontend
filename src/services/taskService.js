import axios from 'axios';
import API from '../services/api'; 

const API_URL = 'http://localhost:5000/api/tasks';

// Get tasks with Authorization header
export const getTasks = async () => {
  const token = localStorage.getItem('token');

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const res = await API.get('/tasks', config);
  return res.data;
};

// Create a new task
export const createTask = async (taskData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return await axios.post(API_URL, taskData, config);
};

// Update a task
export const updateTask = async (id, taskData, token) => {
  return axios.put(`${API_URL}/${id}`, taskData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Delete a task
export const deleteTask = async (id, token) => {
  return axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
