import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function ProgressLineChart({ evaluations }) {
  const [selectedMetrics, setSelectedMetrics] = useState(['overallScore', 'passing', 'endurance']);

  if (!evaluations || evaluations.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm italic">
        No evaluation history available yet
      </div>
    );
  }

  // Sort ascending by date
  const sorted = [...evaluations].sort((a, b) => new Date(a.date) - new Date(b.date));

  const labels = sorted.map((e) =>
    new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  );

  const availableMetrics = [
    { key: 'overallScore', label: 'Overall Rating', color: '#10b981' },
    { key: 'passing', label: 'Passing', color: '#3b82f6' },
    { key: 'endurance', label: 'Endurance', color: '#f59e0b' },
    { key: 'speed', label: 'Speed', color: '#8b5cf6' },
    { key: 'ballControl', label: 'Ball Control', color: '#ec4899' },
    { key: 'positioning', label: 'Positioning', color: '#06b6d4' },
    { key: 'discipline', label: 'Discipline', color: '#14b8a6' },
  ];

  const getMetricValue = (ev, key) => {
    if (key === 'overallScore') return ev.overallScore || 0;
    if (ev.physicalAbilities && ev.physicalAbilities[key] !== undefined) return ev.physicalAbilities[key];
    if (ev.technicalSkills && ev.technicalSkills[key] !== undefined) return ev.technicalSkills[key];
    if (ev.tacticalAbilities && ev.tacticalAbilities[key] !== undefined) return ev.tacticalAbilities[key];
    if (ev.personalDevelopment && ev.personalDevelopment[key] !== undefined) return ev.personalDevelopment[key];
    return 0;
  };

  const datasets = selectedMetrics.map((key) => {
    const meta = availableMetrics.find((m) => m.key === key) || { label: key, color: '#64748b' };
    return {
      label: meta.label,
      data: sorted.map((e) => getMetricValue(e, key)),
      borderColor: meta.color,
      backgroundColor: meta.color,
      tension: 0.3,
      pointRadius: 5,
      pointHoverRadius: 7,
      borderWidth: 2.5,
    };
  });

  const data = { labels, datasets };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 1,
        max: 10,
        ticks: { stepSize: 1, font: { family: 'Plus Jakarta Sans' } },
        grid: { color: 'rgba(241, 245, 249, 1)' },
      },
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Plus Jakarta Sans' } },
      },
    },
    plugins: {
      legend: {
        position: 'top',
        labels: { font: { family: 'Plus Jakarta Sans', weight: '600' }, boxWidth: 12 },
      },
    },
  };

  const toggleMetric = (key) => {
    if (selectedMetrics.includes(key)) {
      if (selectedMetrics.length > 1) {
        setSelectedMetrics(selectedMetrics.filter((k) => k !== key));
      }
    } else {
      setSelectedMetrics([...selectedMetrics, key]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Metric Selector Chips */}
      <div className="flex flex-wrap gap-2">
        {availableMetrics.map((m) => {
          const isSelected = selectedMetrics.includes(m.key);
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => toggleMetric(m.key)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span
                className="inline-block w-2 h-2 rounded-full mr-1.5"
                style={{ backgroundColor: m.color }}
              />
              {m.label}
            </button>
          );
        })}
      </div>

      <div className="w-full h-72">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
