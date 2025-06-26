import API from './api'; // ✅ CORRECT


export const getTasks = async (token) => {
  return API.get('/tasks', {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const createTask = async (taskData, token) => {
  return API.post('/tasks', taskData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateTask = async (id, taskData, token) => {
  return API.put(`/tasks/${id}`, taskData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteTask = async (id, token) => {
  return API.delete(`/tasks/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
