import Attendance from '../models/Attendance.js';
import TrainingSession from '../models/TrainingSession.js';
import Player from '../models/Player.js';

// @desc    Record/Batch update attendance for a session
// @route   POST /api/attendance/session/:sessionId
// @access  Private
export const recordSessionAttendance = async (req, res) => {
  const { sessionId } = req.params;
  const { records } = req.body; // Array of { playerId, status, arrivalTime, notes }

  if (!records || !Array.isArray(records)) {
    return res.status(400).json({ message: 'Records array is required' });
  }

  const session = await TrainingSession.findById(sessionId);
  if (!session) {
    return res.status(404).json({ message: 'Training session not found' });
  }

  const results = [];
  for (const item of records) {
    const { playerId, status, arrivalTime, notes } = item;

    const record = await Attendance.findOneAndUpdate(
      { trainingSession: sessionId, player: playerId },
      {
        trainingSession: sessionId,
        player: playerId,
        status: status || 'present',
        date: session.date,
        arrivalTime: arrivalTime || '',
        notes: notes || '',
        recordedBy: req.user._id,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    results.push(record);
  }

  // If session status was 'scheduled', update to 'completed' if past or today
  if (session.status === 'scheduled') {
    session.status = 'completed';
    await session.save();
  }

  res.json({
    message: `Attendance updated for ${results.length} players`,
    records: results,
  });
};

// @desc    Get attendance for a specific session
// @route   GET /api/attendance/session/:sessionId
// @access  Private
export const getSessionAttendance = async (req, res) => {
  const { sessionId } = req.params;

  const session = await TrainingSession.findById(sessionId).populate('assignedPlayers');
  if (!session) {
    return res.status(404).json({ message: 'Training session not found' });
  }

  const recordedAttendance = await Attendance.find({ trainingSession: sessionId })
    .populate('player', 'firstName lastName jerseyNumber primaryPosition ageCategory photoUrl')
    .populate('recordedBy', 'name');

  // Map each assigned player to their attendance or mark unrecorded
  const recordedPlayerMap = new Map();
  recordedAttendance.forEach((rec) => {
    if (rec.player) {
      recordedPlayerMap.set(rec.player._id.toString(), rec);
    }
  });

  const fullAttendanceList = session.assignedPlayers.map((player) => {
    const existing = recordedPlayerMap.get(player._id.toString());
    if (existing) {
      return existing;
    }
    return {
      trainingSession: sessionId,
      player,
      status: 'unrecorded',
      arrivalTime: '',
      notes: '',
      recordedBy: null,
    };
  });

  res.json({
    session,
    attendance: fullAttendanceList,
  });
};

// @desc    Get player attendance history
// @route   GET /api/attendance/player/:playerId
// @access  Private
export const getPlayerAttendanceHistory = async (req, res) => {
  const { playerId } = req.params;

  const records = await Attendance.find({ player: playerId })
    .populate('trainingSession', 'title date startTime focusTopics location intensity')
    .populate('recordedBy', 'name')
    .sort({ date: -1 });

  const total = records.length;
  const present = records.filter((r) => r.status === 'present').length;
  const absent = records.filter((r) => r.status === 'absent').length;
  const excused = records.filter((r) => r.status === 'excused').length;
  const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 100;

  res.json({
    records,
    stats: {
      total,
      present,
      absent,
      excused,
      attendanceRate,
    },
  });
};

// @desc    Get global attendance stats & insights
// @route   GET /api/attendance/stats
// @access  Private
export const getAttendanceStats = async (req, res) => {
  const totalRecords = await Attendance.countDocuments();
  const presentRecords = await Attendance.countDocuments({ status: 'present' });
  const absentRecords = await Attendance.countDocuments({ status: 'absent' });
  const excusedRecords = await Attendance.countDocuments({ status: 'excused' });

  const globalRate = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 100;

  // Monthly breakdown for trend charts
  const monthlyAgg = await Attendance.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
        total: { $sum: 1 },
        present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Find players with recurring absences (>2 absences)
  const recurringAbsences = await Attendance.aggregate([
    { $match: { status: 'absent' } },
    { $group: { _id: '$player', count: { $sum: 1 } } },
    { $match: { count: { $gte: 2 } } },
    { $lookup: { from: 'players', localField: '_id', foreignField: '_id', as: 'player' } },
    { $unwind: '$player' },
    { $project: { _id: 1, count: 1, 'player.firstName': 1, 'player.lastName': 1, 'player.primaryPosition': 1, 'player.ageCategory': 1 } },
  ]);

  res.json({
    totalRecords,
    presentRecords,
    absentRecords,
    excusedRecords,
    globalRate,
    monthlyTrend: monthlyAgg,
    recurringAbsences,
  });
};
