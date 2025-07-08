import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {

  getTasks,
  createTask,
  deleteTask,
  updateTask,
} from '../services/taskService';
import { motion, AnimatePresence } from 'framer-motion';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [remindedTasks, setRemindedTasks] = useState(new Set());
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const audioRef = useRef(null);

  useEffect(() => {
    // Create audio object once
    audioRef.current = new Audio('/reminder.mp3');
    audioRef.current.loop = true;
  }, []);

  const isTimeToRemind = (taskTime) => {
    const now = new Date();
    const [taskHour, taskMinute] = taskTime.split(':').map(Number);
    return now.getHours() === taskHour && now.getMinutes() === taskMinute;
  };

  const showReminder = useCallback(
    (task) => {
      if (Notification.permission === 'granted') {
        new Notification('🕒 Task Reminder', {
          body: `It's time to do: ${task.name}`,
        });
      }

      if (audioRef.current) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => console.warn('Audio play failed:', err));
      }
    },
    []
  );
  const recordResponse = (type) => {
  const stats = JSON.parse(localStorage.getItem('taskStats')) || { yes: [], no: [] };
  stats[type].push(new Date().toISOString());
  localStorage.setItem('taskStats', JSON.stringify(stats));
};


  const stopAudio = (response) => {
  if (audioRef.current) {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);

    // Log the response
    recordResponse(response); // <-- this is what was missing

    console.log(`User responded: ${response === 'yes' ? '✅ Will do the task' : '❌ Will not do the task'}`);
  }
};


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

  useEffect(() => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      tasks.forEach((task) => {
        if (
          task.deadline &&
          isTimeToRemind(task.deadline) &&
          !remindedTasks.has(task._id)
        ) {
          showReminder(task);
          setRemindedTasks((prev) => new Set(prev).add(task._id));
        }
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [tasks, remindedTasks, showReminder]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTask.trim() || !newDeadline.trim()) return;

    try {
      await createTask(
        {
          name: newTask,
          category: 'health',
          deadline: newDeadline,
        },
        token
      );
      setNewTask('');
      setNewDeadline('');
      const res = await getTasks(token);
      setTasks(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('❌ Error creating task:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id, token);
      setRemindedTasks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
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
            <span className="text-white text-2xl font-bold tracking-tight">
              TaskMaster Pro
            </span>
          </div>
        </div>
      </nav>

      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8 text-2xl">
        <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl p-8 border border-gray-100">
          <h2 className="text-4xl font-extrabold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            ✨ Your Task List ✨
          </h2>
          <div className="flex justify-end mb-4">
  <button
    onClick={() => navigate('/mystats')}
    className="bg-indigo-500 text-white px-6 py-3 rounded-xl text-lg font-semibold hover:bg-indigo-600 transition"
  >
    📊 My Stats
  </button>
</div>


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

          {isPlaying && (
  <div className="flex justify-center gap-4 mb-6">
    <button
      onClick={() => stopAudio('yes')}
      className="bg-green-600 text-white px-6 py-3 rounded-xl text-xl font-semibold hover:bg-green-700 transition"
    >
      ✅ I'll do the task
    </button>
    <button
      onClick={() => stopAudio('no')}
      className="bg-red-600 text-white px-6 py-3 rounded-xl text-xl font-semibold hover:bg-red-700 transition"
    >
      ❌ I won't do the task
    </button>
  </div>
)}

          <ul className="space-y-6">
            <AnimatePresence>
              {Array.isArray(tasks) && tasks.length > 0 ? (
                tasks.map((task) => (
                  <motion.li
                    key={task._id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ duration: 0.3 }}
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
                          <span className="text-gray-800 text-2xl font-medium">
                            {task.name}
                          </span>
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
                  </motion.li>
                ))
              ) : (
                <motion.li
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-gray-500 italic text-2xl py-10"
                >
                  No tasks found. Add one above to get started!
                </motion.li>
              )}
            </AnimatePresence>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
