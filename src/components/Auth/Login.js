import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await API.post('/users/login', formData);
      localStorage.setItem('token', res.data.token);
      navigate('/tasks');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      alert('Error: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" 
         style={{
           background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
           fontFamily: "'Poppins', sans-serif"
         }}>
      <div className="relative w-full max-w-md">
        {/* Subtle decorative elements */}
        <div className="absolute -inset-2 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-xl opacity-20 blur-sm"></div>
        
        <form 
          onSubmit={handleSubmit}
          className="relative bg-white/95 p-8 rounded-xl shadow-lg border border-white/20"
        >
          {/* Compact logo/title section */}
          <div className="text-center mb-6">
            
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Welcome Back
            </h2>
            <p className="text-gray-500 text-sm mt-1">Sign in to continue</p>
          </div>
          
          {/* Email Input */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 text-sm transition-all placeholder-gray-400"
              />
      
            </div>
          </div>
          
          {/* Password Input */}
          <div className="mb-5">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 text-sm transition-all placeholder-gray-400"
              />
              
            </div>
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2.5 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 font-medium text-base shadow-sm hover:shadow-md active:scale-[0.98] ${isLoading ? 'opacity-70' : ''}`}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
          
          {/* Footer Links */}
          <div className="mt-5 text-center text-xs text-gray-500">
            <p>Don't have an account? <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">Sign up</a></p>
            <p className="mt-1"><a href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">Forgot password?</a></p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;