import Player from '../models/Player.js';
import User from '../models/User.js';
import TrainingSession from '../models/TrainingSession.js';
import Evaluation from '../models/Evaluation.js';
import Attendance from '../models/Attendance.js';

// @desc    Get comprehensive manager academy overview
// @route   GET /api/stats/overview
// @access  Private
export const getAcademyOverview = async (req, res) => {
  const activePlayersCount = await Player.countDocuments({ status: 'active' });
  const totalPlayersCount = await Player.countDocuments();
  const activeCoachesCount = await User.countDocuments({ role: 'coach', status: 'active' });

  const now = new Date();
  const upcomingSessionsCount = await TrainingSession.countDocuments({
    date: { $gte: new Date(now.setHours(0, 0, 0, 0)) },
    status: { $ne: 'cancelled' },
  });

  const completedSessionsCount = await TrainingSession.countDocuments({
    status: 'completed',
  });

  // Attendance stats
  const totalAttendance = await Attendance.countDocuments();
  const presentAttendance = await Attendance.countDocuments({ status: 'present' });
  const attendanceRate = totalAttendance > 0 ? Math.round((presentAttendance / totalAttendance) * 100) : 100;

  // Recent 5 evaluations
  const recentEvaluations = await Evaluation.find()
    .populate('player', 'firstName lastName primaryPosition ageCategory photoUrl')
    .populate('coach', 'name')
    .sort({ date: -1 })
    .limit(5);

  // Players needing evaluation update (no evaluation OR last evaluation > 30 days ago)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const allActivePlayers = await Player.find({ status: 'active' }).populate('assignedCoaches', 'name');

  const playersNeedingUpdate = [];
  for (const player of allActivePlayers) {
    const lastEval = await Evaluation.findOne({ player: player._id }).sort({ date: -1 });
    if (!lastEval) {
      playersNeedingUpdate.push({
        player,
        lastEvaluationDate: null,
        daysSinceEvaluation: null,
        status: 'Never Evaluated',
      });
    } else if (new Date(lastEval.date) < thirtyDaysAgo) {
      const daysSince = Math.round((Date.now() - new Date(lastEval.date)) / (1000 * 60 * 60 * 24));
      playersNeedingUpdate.push({
        player,
        lastEvaluationDate: lastEval.date,
        daysSinceEvaluation: daysSince,
        status: `${daysSince} days ago`,
      });
    }
  }

  // Age group breakdown
  const ageGroupDistribution = await Player.aggregate([
    { $match: { status: 'active' } },
    { $group: { _id: '$ageCategory', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  // Position distribution
  const positionDistribution = await Player.aggregate([
    { $match: { status: 'active' } },
    { $group: { _id: '$primaryPosition', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  res.json({
    metrics: {
      activePlayersCount,
      totalPlayersCount,
      activeCoachesCount,
      upcomingSessionsCount,
      completedSessionsCount,
      attendanceRate,
      playersNeedingUpdateCount: playersNeedingUpdate.length,
    },
    recentEvaluations,
    playersNeedingUpdate: playersNeedingUpdate.slice(0, 8),
    ageGroupDistribution,
    positionDistribution,
  });
};

// @desc    Get coach-specific dashboard overview
// @route   GET /api/stats/coach-overview
// @access  Private (Coach)
export const getCoachOverview = async (req, res) => {
  const coachId = req.user._id;

  const assignedPlayers = await Player.find({ assignedCoaches: coachId, status: 'active' });
  const assignedPlayerIds = assignedPlayers.map((p) => p._id);

  const now = new Date();
  const upcomingSessions = await TrainingSession.find({
    coach: coachId,
    date: { $gte: new Date(now.setHours(0, 0, 0, 0)) },
    status: { $ne: 'cancelled' },
  })
    .sort({ date: 1 })
    .limit(5);

  const recentEvaluations = await Evaluation.find({ coach: coachId })
    .populate('player', 'firstName lastName ageCategory primaryPosition photoUrl')
    .sort({ date: -1 })
    .limit(5);

  const totalSessionsCount = await TrainingSession.countDocuments({ coach: coachId });

  res.json({
    assignedPlayersCount: assignedPlayers.length,
    upcomingSessions,
    recentEvaluations,
    totalSessionsCount,
    assignedPlayers: assignedPlayers.slice(0, 6),
  });
};
