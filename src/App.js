import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Tasks from './pages/Tasks'; // ⬅️ You'll create this soon

function App() {
  // Optional: protect routes using a fake auth check
  const isLoggedIn = !!localStorage.getItem('token'); // or however you're storing the token

  return (
    <Router>
      <div className="App">
        <h1>Habit Tracker</h1>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/tasks"
            element={isLoggedIn ? <Tasks /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
