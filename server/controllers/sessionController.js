import TrainingSession from '../models/TrainingSession.js';
import Attendance from '../models/Attendance.js';
import Player from '../models/Player.js';

// @desc    Get training sessions (filtered by status, ageGroup, coach, date)
// @route   GET /api/sessions
// @access  Private
export const getSessions = async (req, res) => {
  const { status, ageGroup, coachId, upcoming, past } = req.query;

  const query = {};

  if (status && status !== 'all') {
    query.status = status;
  }

  if (ageGroup && ageGroup !== 'all') {
    query.ageGroup = ageGroup;
  }

  if (coachId) {
    query.coach = coachId;
  }

  const now = new Date();
  if (upcoming === 'true') {
    query.date = { $gte: new Date(now.setHours(0, 0, 0, 0)) };
    query.status = { $ne: 'cancelled' };
  } else if (past === 'true') {
    query.date = { $lt: new Date(now.setHours(0, 0, 0, 0)) };
  }

  const sessions = await TrainingSession.find(query)
    .populate('coach', 'name email specialization')
    .populate('assignedPlayers', 'firstName lastName jerseyNumber primaryPosition photoUrl')
    .sort({ date: upcoming === 'true' ? 1 : -1 });

  // Attach attendance summary for each session
  const enrichedSessions = await Promise.all(
    sessions.map(async (session) => {
      const attendanceCount = await Attendance.countDocuments({ trainingSession: session._id });
      const presentCount = await Attendance.countDocuments({
        trainingSession: session._id,
        status: 'present',
      });
      return {
        ...session.toObject(),
        attendanceRecorded: attendanceCount > 0,
        attendeeCount: presentCount,
      };
    })
  );

  res.json(enrichedSessions);
};

// @desc    Get single session with attendance list
// @route   GET /api/sessions/:id
// @access  Private
export const getSessionById = async (req, res) => {
  const session = await TrainingSession.findById(req.params.id)
    .populate('coach', 'name email phone specialization')
    .populate('assignedPlayers', 'firstName lastName jerseyNumber primaryPosition ageCategory photoUrl');

  if (!session) {
    return res.status(404).json({ message: 'Training session not found' });
  }

  const attendanceRecords = await Attendance.find({ trainingSession: session._id })
    .populate('player', 'firstName lastName jerseyNumber primaryPosition photoUrl')
    .populate('recordedBy', 'name');

  res.json({
    session,
    attendanceRecords,
  });
};

// @desc    Create new training session
// @route   POST /api/sessions
// @access  Private
export const createSession = async (req, res) => {
  const {
    title,
    date,
    startTime,
    endTime,
    location,
    ageGroup,
    focusTopics,
    description,
    coach,
    assignedPlayers,
    intensity,
  } = req.body;

  // If assignedPlayers not provided, auto-assign active players in that ageGroup
  let targetPlayers = assignedPlayers;
  if (!targetPlayers || targetPlayers.length === 0) {
    const defaultPlayers = await Player.find({
      status: 'active',
      ...(ageGroup && ageGroup !== 'All Academy' ? { ageCategory: ageGroup } : {}),
    }).select('_id');
    targetPlayers = defaultPlayers.map((p) => p._id);
  }

  const session = await TrainingSession.create({
    title,
    date,
    startTime: startTime || '16:00',
    endTime: endTime || '18:00',
    location: location || 'Main Pitch A',
    ageGroup: ageGroup || 'U-15',
    focusTopics: focusTopics || ['tactical awareness', 'passing'],
    description: description || '',
    coach: coach || req.user._id,
    assignedPlayers: targetPlayers,
    intensity: intensity || 'medium',
    status: 'scheduled',
  });

  const populated = await TrainingSession.findById(session._id)
    .populate('coach', 'name email')
    .populate('assignedPlayers', 'firstName lastName jerseyNumber primaryPosition');

  res.status(201).json(populated);
};

// @desc    Update training session
// @route   PUT /api/sessions/:id
// @access  Private
export const updateSession = async (req, res) => {
  const session = await TrainingSession.findById(req.params.id);

  if (!session) {
    return res.status(404).json({ message: 'Training session not found' });
  }

  const fields = [
    'title',
    'date',
    'startTime',
    'endTime',
    'location',
    'ageGroup',
    'focusTopics',
    'description',
    'coach',
    'assignedPlayers',
    'status',
    'intensity',
    'postSessionNotes',
  ];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      session[field] = req.body[field];
    }
  });

  const updatedSession = await session.save();
  const populated = await TrainingSession.findById(updatedSession._id)
    .populate('coach', 'name email')
    .populate('assignedPlayers', 'firstName lastName jerseyNumber primaryPosition');

  res.json(populated);
};

// @desc    Delete training session
// @route   DELETE /api/sessions/:id
// @access  Private
export const deleteSession = async (req, res) => {
  const session = await TrainingSession.findById(req.params.id);

  if (!session) {
    return res.status(404).json({ message: 'Training session not found' });
  }

  await Attendance.deleteMany({ trainingSession: session._id });
  await session.deleteOne();

  res.json({ message: 'Training session and attendance records deleted' });
};
