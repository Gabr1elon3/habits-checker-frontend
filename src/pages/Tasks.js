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
    audioRef.current = new Audio('/reminder.mp3');
    audioRef.current.loop = true;
  }, []);

  const isTimeToRemind = (taskTime) => {
    const now = new Date();
    const [taskHour, taskMinute] = taskTime.split(':').map(Number);
    return now.getHours() === taskHour && now.getMinutes() === taskMinute;
  };

  const showReminder = useCallback((task) => {
    if (Notification.permission === 'granted') {
      new Notification('🕒 Task Reminder', {
        body: `It's time to do: ${task.name}`,
      });
    }

    if (audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch((err) => console.warn('Audio play failed:', err));
    }
  }, []);

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
      recordResponse(response);
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
        if (task.deadline && isTimeToRemind(task.deadline) && !remindedTasks.has(task._id)) {
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
      await createTask({ name: newTask, category: 'health', deadline: newDeadline }, token);
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
    <div className="min-vh-100" style={{
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      fontFamily: "'Poppins', sans-serif"
    }}>
      <nav className="navbar navbar-expand-lg navbar-dark mb-4" style={{
        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div className="container">
          <span className="navbar-brand h1" style={{ fontWeight: '600', letterSpacing: '1px' }}>
            TaskMaster Pro
          </span>
        </div>
      </nav>

      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="card shadow-lg border-0" style={{
          borderRadius: '15px',
          overflow: 'hidden',
          border: 'none',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)'
        }}>
          <div className="card-body p-4">
            <h2 className="text-center mb-4" style={{
              color: '#4a4a4a',
              fontWeight: '600',
              fontSize: '2rem',
              letterSpacing: '0.5px'
            }}>
              ✨ Your Task List ✨
            </h2>
            
            <div className="text-center mb-4">
              <button 
                className="btn btn-primary" 
                onClick={() => navigate('/mystats')}
                style={{
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: '50px',
                  fontWeight: '500',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                📊 My Stats
              </button>
            </div>

            <form className="row g-3 mb-4" onSubmit={handleCreate}>
              <div className="col-md-6">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="What needs to be done?"
                  className="form-control"
                  style={{
                    borderRadius: '50px',
                    padding: '12px 20px',
                    border: '1px solid #e0e0e0',
                    boxShadow: 'none',
                    fontSize: '0.95rem'
                  }}
                />
              </div>
              <div className="col-md-3">
                <input
                  type="time"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="form-control"
                  required
                  style={{
                    borderRadius: '50px',
                    padding: '12px 20px',
                    border: '1px solid #e0e0e0',
                    boxShadow: 'none',
                    fontSize: '0.95rem'
                  }}
                />
              </div>
              <div className="col-md-3">
                <button 
                  type="submit" 
                  className="btn w-100"
                  style={{
                    background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '50px',
                    fontWeight: '500',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  Add Task
                </button>
              </div>
            </form>

            {isPlaying && (
              <div className="text-center mb-4">
                <button 
                  className="btn me-3" 
                  onClick={() => stopAudio('yes')}
                  style={{
                    background: 'linear-gradient(90deg, #56ab2f 0%, #a8e063 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '10px 25px',
                    borderRadius: '50px',
                    fontWeight: '500',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  ✅ I'll do the task
                </button>
                <button 
                  className="btn" 
                  onClick={() => stopAudio('no')}
                  style={{
                    background: 'linear-gradient(90deg, #ff416c 0%, #ff4b2b 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '10px 25px',
                    borderRadius: '50px',
                    fontWeight: '500',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  ❌ I won't do the task
                </button>
              </div>
            )}

            <ul className="list-group" style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <AnimatePresence>
                {Array.isArray(tasks) && tasks.length > 0 ? (
                  tasks.map((task) => (
                    <motion.li
                      key={task._id}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      transition={{ duration: 0.3 }}
                      className="list-group-item d-flex justify-content-between align-items-center"
                      style={{
                        border: 'none',
                        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                        padding: '16px 20px',
                        background: 'rgba(255, 255, 255, 0.7)'
                      }}
                    >
                      {editingId === task._id ? (
                        <>
                          <input
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="form-control me-3"
                            style={{
                              borderRadius: '8px',
                              padding: '8px 15px',
                              border: '1px solid #e0e0e0',
                              boxShadow: 'none'
                            }}
                          />
                          <div>
                            <button 
                              className="btn me-2" 
                              onClick={() => handleUpdate(task._id)}
                              style={{
                                background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '6px 15px',
                                borderRadius: '8px',
                                fontWeight: '500',
                                fontSize: '0.9rem'
                              }}
                            >
                              Save
                            </button>
                            <button 
                              className="btn" 
                              onClick={() => setEditingId(null)}
                              style={{
                                background: 'linear-gradient(90deg, #bdc3c7 0%, #2c3e50 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '6px 15px',
                                borderRadius: '8px',
                                fontWeight: '500',
                                fontSize: '0.9rem'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <strong style={{ color: '#4a4a4a', fontSize: '1.1rem' }}>{task.name}</strong> <br />
                            <small className="text-muted" style={{ fontSize: '0.85rem' }}>
                              <i className="bi bi-clock me-1"></i> {task.deadline}
                            </small>
                          </div>
                          <div>
                            <button 
                              className="btn me-2" 
                              onClick={() => startEditing(task)}
                              style={{
                                background: 'linear-gradient(90deg, #f09819 0%, #edde5d 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '6px 15px',
                                borderRadius: '8px',
                                fontWeight: '500',
                                fontSize: '0.9rem'
                              }}
                            >
                              Edit
                            </button>
                            <button 
                              className="btn" 
                              onClick={() => handleDelete(task._id)}
                              style={{
                                background: 'linear-gradient(90deg, #ff416c 0%, #ff4b2b 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '6px 15px',
                                borderRadius: '8px',
                                fontWeight: '500',
                                fontSize: '0.9rem'
                              }}
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
                    className="list-group-item text-center text-muted py-4"
                    style={{
                      border: 'none',
                      background: 'rgba(255, 255, 255, 0.7)'
                    }}
                  >
                    <i className="bi bi-clipboard-check" style={{ fontSize: '2rem', opacity: '0.5' }}></i>
                    <p className="mt-2 mb-0">No tasks found. Add one above to get started!</p>
                  </motion.li>
                )}
              </AnimatePresence>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks;