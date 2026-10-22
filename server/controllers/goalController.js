import DevelopmentGoal from '../models/DevelopmentGoal.js';
import Player from '../models/Player.js';

// @desc    Get all goals for a player
// @route   GET /api/goals/player/:playerId
// @access  Private
export const getPlayerGoals = async (req, res) => {
  const { playerId } = req.params;

  const goals = await DevelopmentGoal.find({ player: playerId })
    .populate('coach', 'name email')
    .sort({ deadline: 1 });

  res.json(goals);
};

// @desc    Create development goal
// @route   POST /api/goals
// @access  Private
export const createGoal = async (req, res) => {
  const { player, title, category, targetMetric, targetValue, currentValue, deadline, notes, unit } = req.body;

  const targetPlayer = await Player.findById(player);
  if (!targetPlayer) {
    return res.status(404).json({ message: 'Player not found' });
  }

  const goal = await DevelopmentGoal.create({
    player,
    coach: req.user._id,
    title,
    category: category || 'Technical',
    targetMetric: targetMetric || 'passing',
    targetValue: targetValue || 8,
    currentValue: currentValue || 5,
    unit: unit || '/10 rating',
    deadline,
    notes: notes || '',
    status: 'in_progress',
  });

  const populated = await DevelopmentGoal.findById(goal._id).populate('coach', 'name email');
  res.status(201).json(populated);
};

// @desc    Update development goal
// @route   PUT /api/goals/:id
// @access  Private
export const updateGoal = async (req, res) => {
  const goal = await DevelopmentGoal.findById(req.params.id);

  if (!goal) {
    return res.status(404).json({ message: 'Goal not found' });
  }

  const fields = ['title', 'category', 'targetMetric', 'targetValue', 'currentValue', 'deadline', 'status', 'notes', 'unit'];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      goal[field] = req.body[field];
    }
  });

  const updatedGoal = await goal.save();
  const populated = await DevelopmentGoal.findById(updatedGoal._id).populate('coach', 'name email');
  res.json(populated);
};

// @desc    Delete development goal
// @route   DELETE /api/goals/:id
// @access  Private
export const deleteGoal = async (req, res) => {
  const goal = await DevelopmentGoal.findById(req.params.id);

  if (!goal) {
    return res.status(404).json({ message: 'Goal not found' });
  }

  await goal.deleteOne();
  res.json({ message: 'Goal removed successfully' });
};
