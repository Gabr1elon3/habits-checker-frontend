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
  const [editedName, setEditedName] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const res = await getTasks(token);
        console.log("📥 Loaded tasks from backend:", res.data);
        console.log("🔐 Token:", token);
        setTasks(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error('❌ Failed to load tasks:', err);
        setTasks([]);
      }
    };

    loadTasks();
  }, [token]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const taskPayload = {
      name: newTask,
      category: 'health',
      deadline: '08:00',
    };

    console.log("🚀 Creating task with payload:", taskPayload);
    console.log("🔐 Token:", token);


    try {
      await createTask(taskPayload, token);
      setNewTask('');
      const res = await getTasks(token);
      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('❌ Error creating task:', err.response?.data || err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id, token);
      const res = await getTasks(token);
      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('❌ Error deleting task:', err);
    }
  };

  const startEditing = (task) => {
    setEditingId(task._id);
    setEditedName(task.name);
  };

  const handleUpdate = async (id) => {
    if (!editedName.trim()) return;
    try {
      await updateTask(id, { name: editedName }, token);
      setEditingId(null);
      setEditedName('');
      const res = await getTasks(token);
      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('❌ Error updating task:', err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-center mb-4 text-gray-800">Your Tasks</h2>

      <form className="flex gap-2 mb-6" onSubmit={handleCreate}>
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Enter new task"
          className="flex-grow px-3 py-2 border rounded-md"
        />
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Add
        </button>
      </form>

      <ul className="space-y-2">
        {Array.isArray(tasks) && tasks.length > 0 ? (
          tasks.map((task) => (
            <li
              key={task._id}
              className="flex justify-between items-center border-b pb-2"
            >
              {editingId === task._id ? (
                <>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="flex-grow px-2 py-1 border rounded"
                  />
                  <div className="flex gap-2 ml-2">
                    <button
                      onClick={() => handleUpdate(task._id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-300 text-black px-3 py-1 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span className="text-gray-800 flex-grow">{task.name}</span>
                  <div className="flex gap-2 ml-2">
                    <button
                      onClick={() => startEditing(task)}
                      className="bg-yellow-400 text-black px-3 py-1 rounded hover:bg-yellow-500"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(task._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))
        ) : (
          <li className="text-gray-500 text-center">No tasks found</li>
        )}
      </ul>
    </div>
  );
};

export default Tasks;
