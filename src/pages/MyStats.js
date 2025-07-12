import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import axios from 'axios';

const MyStats = () => {
  const [stats, setStats] = useState({ yes: 0, no: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Token in frontend:', token);
        const response = await axios.get('/api/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Map backend response to your existing frontend structure
        setStats({ 
          yes: response.data.completed || 1, 
          no: response.data.overdue || 0 
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setError('Failed to load statistics');
        // Fallback to localStorage if API fails
        const raw = JSON.parse(localStorage.getItem('taskStats')) || { yes: [], no: [] };
        const now = new Date();
        const yesCount = raw.yes.filter(dateStr => {
          const date = new Date(dateStr);
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length;
        const noCount = raw.no.filter(dateStr => {
          const date = new Date(dateStr);
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length;
        setStats({ yes: yesCount, no: noCount });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const chartData = [
    { name: 'Completed ✅', value: stats.yes },
    { name: "Overdue ❌", value: stats.no },
  ];

  const colors = ['#10B981', '#EF4444']; // Green and Red

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-2xl text-indigo-600">Loading statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-2xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
      <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-6">
        📊 My Stats – This Month
      </h1>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 30, bottom: 30 }}>
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 text-gray-600">
        Showing data for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
      </div>

      <Link
        to="/tasks"
        className="mt-10 text-indigo-600 hover:text-indigo-800 underline text-lg"
      >
        ← Back to Tasks
      </Link>
    </div>
  );
};

export default MyStats;