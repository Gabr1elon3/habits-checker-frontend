import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav
      className="navbar navbar-expand-lg fixed-top shadow-sm"
      style={{
        background: 'linear-gradient(to right, #667eea, #764ba2)',
        minHeight: '160px', // Increased height
      }}
    >
      <div className="container h-400 d-flex align-items-center justify-content-between">
        <Link 
          className="navbar-brand fw-bold fs-4 text-white" 
          to="/"
          style={{ letterSpacing: '0.5px' }}
        >
          🌈 Habits Checker
        </Link>

        <div className="d-flex align-items-center gap-3 h-100">
          {token ? (
            <>
              <Link 
                className="btn btn-link text-white fw-semibold px-3 py-2"
                to="/tasks"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  height: '38px'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.25)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.15)'}
              >
                Tasks
              </Link>
              <button
                onClick={handleLogout}
                className="btn fw-semibold shadow-sm"
                style={{
                  background: 'linear-gradient(to right, #ff416c, #ff4b2b)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  height: '38px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                className="btn fw-semibold shadow-sm"
                to="/login"
                style={{
                  background: 'linear-gradient(to right, #4facfe, #00f2fe)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  height: '88px',
                  transition: 'all 0.3s ease',
                  marginLeft: '500px'
                }}
                onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                Login
              </Link>
              <Link 
                className="btn fw-semibold shadow-sm"
                to="/register"
                style={{
                  background: 'linear-gradient(to right, #43e97b, #38f9d7)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  height: '38px',
                  transition: 'all 0.3s ease',
                  marginRight: '400px',
                  moveDown: '90px'
                }}
                onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;