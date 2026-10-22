import User from '../models/User.js';
import TrainingSession from '../models/TrainingSession.js';
import Player from '../models/Player.js';

// @desc    Get all coaches
// @route   GET /api/coaches
// @access  Private
export const getCoaches = async (req, res) => {
  const coaches = await User.find({ role: 'coach' }).sort({ createdAt: -1 });

  // Attach active sessions count & assigned players count
  const enhancedCoaches = await Promise.all(
    coaches.map(async (coach) => {
      const activeSessionsCount = await TrainingSession.countDocuments({
        coach: coach._id,
        status: 'scheduled',
      });
      const assignedPlayersCount = await Player.countDocuments({
        assignedCoaches: coach._id,
        status: 'active',
      });

      return {
        ...coach.toObject(),
        activeSessionsCount,
        assignedPlayersCount,
      };
    })
  );

  res.json(enhancedCoaches);
};

// @desc    Get coach by ID
// @route   GET /api/coaches/:id
// @access  Private
export const getCoachById = async (req, res) => {
  const coach = await User.findOne({ _id: req.params.id, role: 'coach' });

  if (!coach) {
    return res.status(404).json({ message: 'Coach not found' });
  }

  const assignedPlayers = await Player.find({ assignedCoaches: coach._id, status: 'active' });
  const recentSessions = await TrainingSession.find({ coach: coach._id })
    .sort({ date: -1 })
    .limit(5);

  res.json({
    ...coach.toObject(),
    assignedPlayers,
    recentSessions,
  });
};

// @desc    Create a new coach account (Manager only)
// @route   POST /api/coaches
// @access  Private (Academy Manager)
export const createCoach = async (req, res) => {
  const { name, email, password, specialization, assignedAgeGroups, phone, bio } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'A user with this email already exists' });
  }

  const coach = await User.create({
    name,
    email,
    password: password || 'coach123456',
    role: 'coach',
    specialization: specialization || 'Youth Development Coach',
    assignedAgeGroups: assignedAgeGroups || ['U-15'],
    phone: phone || '',
    bio: bio || '',
    status: 'active',
  });

  res.status(201).json({
    _id: coach._id,
    name: coach.name,
    email: coach.email,
    role: coach.role,
    specialization: coach.specialization,
    assignedAgeGroups: coach.assignedAgeGroups,
    phone: coach.phone,
    status: coach.status,
  });
};

// @desc    Update coach details
// @route   PUT /api/coaches/:id
// @access  Private (Academy Manager)
export const updateCoach = async (req, res) => {
  const coach = await User.findOne({ _id: req.params.id, role: 'coach' });

  if (!coach) {
    return res.status(404).json({ message: 'Coach not found' });
  }

  coach.name = req.body.name || coach.name;
  coach.email = req.body.email || coach.email;
  coach.specialization = req.body.specialization || coach.specialization;
  coach.assignedAgeGroups = req.body.assignedAgeGroups || coach.assignedAgeGroups;
  coach.phone = req.body.phone !== undefined ? req.body.phone : coach.phone;
  coach.bio = req.body.bio !== undefined ? req.body.bio : coach.bio;
  coach.status = req.body.status || coach.status;

  if (req.body.password) {
    coach.password = req.body.password;
  }

  const updatedCoach = await coach.save();
  res.json(updatedCoach);
};

// @desc    Delete/Deactivate coach
// @route   DELETE /api/coaches/:id
// @access  Private (Academy Manager)
export const deleteCoach = async (req, res) => {
  const coach = await User.findOne({ _id: req.params.id, role: 'coach' });

  if (!coach) {
    return res.status(404).json({ message: 'Coach not found' });
  }

  // Soft delete / deactivate
  coach.status = 'inactive';
  await coach.save();

  res.json({ message: 'Coach account deactivated successfully' });
};
