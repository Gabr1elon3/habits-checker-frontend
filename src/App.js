import React, { useState } from 'react';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';

function App() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="App">
      <h1>Habit Tracker</h1>
      <button onClick={() => setShowLogin(!showLogin)}>
        Switch to {showLogin ? 'Register' : 'Login'}
      </button>
      {showLogin ? <Login /> : <Register />}
    </div>
  );
}

export default App;
