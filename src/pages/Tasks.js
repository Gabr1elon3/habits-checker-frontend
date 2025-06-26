import React, { useEffect, useState } from 'react';
import {
  getTasks,
  createTask,
  deleteTask,
  updateTask,
} from '../services/taskService';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editedTitle, setEditedTitle] = useState('');
  const token = localStorage.getItem('token');

  const loadTasks = async () => {
    try {
      const res = await getTasks(token);
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    try {
      await createTask({ title: newTask }, token);
      setNewTask('');
      loadTasks(); // reload after creating
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id, token);
      loadTasks(); // reload after delete
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const startEditing = (task) => {
    setEditingId(task._id);
    setEditedTitle(task.title);
  };

  const handleUpdate = async (id) => {
    if (!editedTitle.trim()) return;
    try {
      await updateTask(id, { title: editedTitle }, token);
      setEditingId(null);
      setEditedTitle('');
      loadTasks(); // reload after update
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  return (
    <div>
      <h2>Your Tasks</h2>

      <form onSubmit={handleCreate}>
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Enter new task"
        />
        <button type="submit">Add Task</button>
      </form>

      <ul>
        {tasks.map((task) => (
          <li key={task._id}>
            {editingId === task._id ? (
              <>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                />
                <button onClick={() => handleUpdate(task._id)}>Save</button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </>
            ) : (
              <>
                {task.title}
                <button onClick={() => startEditing(task)}>Edit</button>
                <button onClick={() => handleDelete(task._id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Tasks;
