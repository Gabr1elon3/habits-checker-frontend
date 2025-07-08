import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Link } from 'react-router-dom';

const MyStats = () => {
  const [stats, setStats] = useState({ yes: 0, no: 0 });

  useEffect(() => {
    const raw = JSON.parse(localStorage.getItem('taskStats')) || { yes: [], no: [] };

    const filterThisMonth = (dates) =>
      dates.filter((dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      });

    const yesCount = filterThisMonth(raw.yes).length;
    const noCount = filterThisMonth(raw.no).length;

    setStats({ yes: yesCount, no: noCount });
  }, []);

  const chartData = [
    { name: 'Did the task ✅', value: stats.yes },
    { name: "Didn't do ❌", value: stats.no },
  ];

  const colors = ['#10B981', '#EF4444']; // Green and Red

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
