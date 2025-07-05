import React, { useEffect, useState, useCallback } from 'react';
import {
  getTasks,
  createTask,
  deleteTask,
  updateTask,
} from '../services/taskService';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState('');
  const token = localStorage.getItem('token');

  const audio = new Audio('/reminder.mp3');

  const isTimeToRemind = (taskTime) => {
    const now = new Date();
    const [taskHour, taskMinute] = taskTime.split(':').map(Number);
    return (
      now.getHours() === taskHour &&
      now.getMinutes() === taskMinute
    );
  };

  const showReminder = useCallback((taskName) => {
    if (Notification.permission === 'granted') {
      new Notification('🕒 Task Reminder', {
        body: `It's time to do: ${taskName}`,
      });
    }
    audio.play().catch((err) =>
      console.warn('Audio play failed:', err)
    );
  }, [audio]);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const res = await getTasks(token);
        setTasks(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error('❌ Failed to load tasks:', err);
        setTasks([]);
      }
    };
    loadTasks();
  }, [token]);

  // Request Notification permission once
  useEffect(() => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  // Check every 60s for tasks due
  useEffect(() => {
    const interval = setInterval(() => {
      tasks.forEach((task) => {
        if (task.deadline && isTimeToRemind(task.deadline)) {
          showReminder(task.name);
        }
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [tasks, showReminder]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTask.trim() || !newDeadline.trim()) return;

    const taskPayload = {
      name: newTask,
      category: 'health',
      deadline: newDeadline,
    };

    try {
      await createTask(taskPayload, token);
      setNewTask('');
      setNewDeadline('');
      const res = await getTasks(token);
      setTasks(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('❌ Error creating task:', err.response?.data || err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id, token);
      const res = await getTasks(token);
      setTasks(Array.isArray(res) ? res : []);
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
      setTasks(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('❌ Error updating task:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <span className="text-white text-2xl font-bold tracking-tight">TaskMaster Pro</span>
          </div>
        </div>
      </nav>

      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8 text-2xl">
        <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl p-8 border border-gray-100">
          <h2 className="text-4xl font-extrabold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            ✨ Your Task List ✨
          </h2>

          <form className="flex gap-4 mb-10 flex-wrap" onSubmit={handleCreate}>
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-grow px-6 py-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 text-xl shadow-sm"
            />
            <input
              type="time"
              value={newDeadline}
              onChange={(e) => setNewDeadline(e.target.value)}
              className="px-4 py-4 rounded-xl border-2 border-gray-200 text-xl"
              required
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-4 rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg text-xl font-semibold"
            >
              Add Task
            </button>
          </form>

          <ul className="space-y-6">
            {Array.isArray(tasks) && tasks.length > 0 ? (
              tasks.map((task) => (
                <li
                  key={task._id}
                  className="flex items-center justify-between bg-gray-50 px-6 py-5 rounded-xl border-2 border-gray-200 shadow-sm"
                >
                  {editingId === task._id ? (
                    <>
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="flex-grow px-4 py-3 rounded-lg border-2 border-indigo-200 text-xl"
                      />
                      <div className="flex gap-3 ml-4">
                        <button
                          onClick={() => handleUpdate(task._id)}
                          className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-2 rounded-xl text-lg"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="bg-gray-300 text-gray-800 px-6 py-2 rounded-xl text-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col flex-grow text-center">
                        <span className="text-gray-800 text-2xl font-medium">{task.name}</span>
                        <span className="text-gray-500 text-md">🕒 {task.deadline}</span>
                      </div>
                      <div className="flex gap-3 ml-4">
                        <button
                          onClick={() => startEditing(task)}
                          className="bg-gradient-to-r from-amber-400 to-orange-400 text-black px-6 py-2 rounded-xl text-lg"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(task._id)}
                          className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-2 rounded-xl text-lg"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))
            ) : (
              <li className="text-center text-gray-500 italic text-2xl py-10">
                No tasks found. Add one above to get started!
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
