import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function RadarSkillChart({ evaluation, previousEvaluation, label1 = 'Current', label2 = 'Previous' }) {
  if (!evaluation) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm italic">
        No evaluation data available to plot radar
      </div>
    );
  }

  const labels = [
    'Speed',
    'Endurance',
    'Agility',
    'Passing',
    'Shooting',
    'Dribbling',
    'Ball Control',
    'Positioning',
    'Decision',
    'Awareness',
    'Discipline',
    'Motivation',
  ];

  const currentValues = [
    evaluation.physicalAbilities?.speed || 5,
    evaluation.physicalAbilities?.endurance || 5,
    evaluation.physicalAbilities?.agility || 5,
    evaluation.technicalSkills?.passing || 5,
    evaluation.technicalSkills?.shooting || 5,
    evaluation.technicalSkills?.dribbling || 5,
    evaluation.technicalSkills?.ballControl || 5,
    evaluation.tacticalAbilities?.positioning || 5,
    evaluation.tacticalAbilities?.decisionMaking || 5,
    evaluation.tacticalAbilities?.gameAwareness || 5,
    evaluation.personalDevelopment?.discipline || 5,
    evaluation.personalDevelopment?.motivation || 5,
  ];

  const datasets = [
    {
      label: label1,
      data: currentValues,
      backgroundColor: 'rgba(16, 185, 129, 0.25)', // emerald
      borderColor: 'rgba(16, 185, 129, 1)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(16, 185, 129, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(16, 185, 129, 1)',
    },
  ];

  if (previousEvaluation) {
    const prevValues = [
      previousEvaluation.physicalAbilities?.speed || 5,
      previousEvaluation.physicalAbilities?.endurance || 5,
      previousEvaluation.physicalAbilities?.agility || 5,
      previousEvaluation.technicalSkills?.passing || 5,
      previousEvaluation.technicalSkills?.shooting || 5,
      previousEvaluation.technicalSkills?.dribbling || 5,
      previousEvaluation.technicalSkills?.ballControl || 5,
      previousEvaluation.tacticalAbilities?.positioning || 5,
      previousEvaluation.tacticalAbilities?.decisionMaking || 5,
      previousEvaluation.tacticalAbilities?.gameAwareness || 5,
      previousEvaluation.personalDevelopment?.discipline || 5,
      previousEvaluation.personalDevelopment?.motivation || 5,
    ];

    datasets.push({
      label: label2,
      data: prevValues,
      backgroundColor: 'rgba(148, 163, 184, 0.2)', // slate
      borderColor: 'rgba(148, 163, 184, 0.8)',
      borderWidth: 1.5,
      borderDash: [4, 4],
      pointBackgroundColor: 'rgba(148, 163, 184, 1)',
      pointBorderColor: '#fff',
    });
  }

  const data = { labels, datasets };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { color: 'rgba(226, 232, 240, 0.8)' },
        grid: { color: 'rgba(226, 232, 240, 0.8)' },
        suggestedMin: 2,
        suggestedMax: 10,
        ticks: {
          stepSize: 2,
          display: false,
        },
        pointLabels: {
          font: { size: 11, weight: '600', family: 'Plus Jakarta Sans' },
          color: '#475569',
        },
      },
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { family: 'Plus Jakarta Sans', weight: '600' },
          boxWidth: 12,
          padding: 16,
        },
      },
    },
  };

  return (
    <div className="w-full h-80">
      <Radar data={data} options={options} />
    </div>
  );
}
