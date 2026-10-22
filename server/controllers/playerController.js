import Player from '../models/Player.js';
import Evaluation from '../models/Evaluation.js';
import Attendance from '../models/Attendance.js';
import DevelopmentGoal from '../models/DevelopmentGoal.js';
import AIAnalysis from '../models/AIAnalysis.js';

// @desc    Get all players (with optional filters)
// @route   GET /api/players
// @access  Private
export const getPlayers = async (req, res) => {
  const { ageCategory, position, status, coachId, search } = req.query;

  const query = {};

  // If role is coach and specific assignment rule is desired, or query filters
  if (coachId) {
    query.assignedCoaches = coachId;
  }

  if (ageCategory && ageCategory !== 'all') {
    query.ageCategory = ageCategory;
  }

  if (position && position !== 'all') {
    query.primaryPosition = position;
  }

  if (status && status !== 'all') {
    query.status = status;
  } else if (!status) {
    // Default to active unless explicitly asked
    query.status = { $ne: 'archived' };
  }

  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { primaryPosition: { $regex: search, $options: 'i' } },
    ];
  }

  const players = await Player.find(query)
    .populate('assignedCoaches', 'name email specialization')
    .sort({ lastName: 1, firstName: 1 });

  // Attach latest evaluation summary and attendance rate
  const enrichedPlayers = await Promise.all(
    players.map(async (player) => {
      const latestEval = await Evaluation.findOne({ player: player._id })
        .sort({ date: -1 })
        .select('overallScore date');

      const totalAttendance = await Attendance.countDocuments({ player: player._id });
      const presentCount = await Attendance.countDocuments({
        player: player._id,
        status: 'present',
      });

      const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 100;

      return {
        ...player.toObject(),
        latestEvaluation: latestEval || null,
        attendanceRate,
      };
    })
  );

  res.json(enrichedPlayers);
};

// @desc    Get single player by ID with complete profile data
// @route   GET /api/players/:id
// @access  Private
export const getPlayerById = async (req, res) => {
  const player = await Player.findById(req.params.id).populate('assignedCoaches', 'name email specialization avatar phone');

  if (!player) {
    return res.status(404).json({ message: 'Player not found' });
  }

  // Fetch all associated records
  const evaluations = await Evaluation.find({ player: player._id })
    .populate('coach', 'name email')
    .sort({ date: -1 });

  const attendanceRecords = await Attendance.find({ player: player._id })
    .populate('trainingSession', 'title date startTime focusTopics location')
    .populate('recordedBy', 'name')
    .sort({ date: -1 });

  const goals = await DevelopmentGoal.find({ player: player._id })
    .populate('coach', 'name')
    .sort({ deadline: 1 });

  const latestAIAnalysis = await AIAnalysis.findOne({ player: player._id })
    .populate('requestedBy', 'name')
    .sort({ date: -1 });

  // Calculate attendance statistics
  const totalSessions = attendanceRecords.length;
  const presentSessions = attendanceRecords.filter((a) => a.status === 'present').length;
  const absentSessions = attendanceRecords.filter((a) => a.status === 'absent').length;
  const excusedSessions = attendanceRecords.filter((a) => a.status === 'excused').length;
  const attendanceRate = totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 100;

  res.json({
    player,
    evaluations,
    attendanceRecords,
    attendanceStats: {
      totalSessions,
      presentSessions,
      absentSessions,
      excusedSessions,
      attendanceRate,
    },
    goals,
    latestAIAnalysis,
  });
};

// @desc    Create new player
// @route   POST /api/players
// @access  Private
export const createPlayer = async (req, res) => {
  const {
    firstName,
    lastName,
    dateOfBirth,
    gender,
    primaryPosition,
    secondaryPosition,
    jerseyNumber,
    dominantFoot,
    ageCategory,
    trainingGroup,
    assignedCoaches,
    photoUrl,
    heightCm,
    weightKg,
    emergencyContact,
    notes,
  } = req.body;

  const player = await Player.create({
    firstName,
    lastName,
    dateOfBirth,
    gender: gender || 'Male',
    primaryPosition,
    secondaryPosition: secondaryPosition || '',
    jerseyNumber: jerseyNumber || 10,
    dominantFoot: dominantFoot || 'Right',
    ageCategory: ageCategory || 'U-15',
    trainingGroup: trainingGroup || 'Group A',
    assignedCoaches: assignedCoaches || (req.user.role === 'coach' ? [req.user._id] : []),
    photoUrl: photoUrl || '',
    heightCm: heightCm || 165,
    weightKg: weightKg || 55,
    emergencyContact: emergencyContact || {},
    notes: notes || '',
  });

  const populated = await Player.findById(player._id).populate('assignedCoaches', 'name email');
  res.status(201).json(populated);
};

// @desc    Update player profile
// @route   PUT /api/players/:id
// @access  Private
export const updatePlayer = async (req, res) => {
  const player = await Player.findById(req.params.id);

  if (!player) {
    return res.status(404).json({ message: 'Player not found' });
  }

  // Update fields
  const fields = [
    'firstName',
    'lastName',
    'dateOfBirth',
    'gender',
    'primaryPosition',
    'secondaryPosition',
    'jerseyNumber',
    'dominantFoot',
    'ageCategory',
    'trainingGroup',
    'assignedCoaches',
    'status',
    'photoUrl',
    'heightCm',
    'weightKg',
    'emergencyContact',
    'notes',
  ];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      player[field] = req.body[field];
    }
  });

  const updatedPlayer = await player.save();
  const populated = await Player.findById(updatedPlayer._id).populate('assignedCoaches', 'name email');
  res.json(populated);
};

// @desc    Archive player (soft delete to keep historical records)
// @route   PUT /api/players/:id/archive
// @access  Private
export const archivePlayer = async (req, res) => {
  const player = await Player.findById(req.params.id);

  if (!player) {
    return res.status(404).json({ message: 'Player not found' });
  }

  player.status = player.status === 'archived' ? 'active' : 'archived';
  await player.save();

  res.json({ message: `Player status updated to ${player.status}`, player });
};

// @desc    Delete player permanently (Manager only)
// @route   DELETE /api/players/:id
// @access  Private (Academy Manager)
export const deletePlayer = async (req, res) => {
  const player = await Player.findById(req.params.id);

  if (!player) {
    return res.status(404).json({ message: 'Player not found' });
  }

  // Clean up associated evaluations, attendances, goals, aiAnalyses
  await Evaluation.deleteMany({ player: player._id });
  await Attendance.deleteMany({ player: player._id });
  await DevelopmentGoal.deleteMany({ player: player._id });
  await AIAnalysis.deleteMany({ player: player._id });
  await player.deleteOne();

  res.json({ message: 'Player and all associated records permanently removed' });
};
