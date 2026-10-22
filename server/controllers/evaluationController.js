import Evaluation from '../models/Evaluation.js';
import Player from '../models/Player.js';

// @desc    Get all evaluations (with filters)
// @route   GET /api/evaluations
// @access  Private
export const getEvaluations = async (req, res) => {
  const { playerId, coachId, ageCategory } = req.query;

  const query = {};
  if (playerId) query.player = playerId;
  if (coachId) query.coach = coachId;

  let evaluations = await Evaluation.find(query)
    .populate('player', 'firstName lastName ageCategory primaryPosition jerseyNumber photoUrl')
    .populate('coach', 'name email specialization')
    .sort({ date: -1 });

  if (ageCategory && ageCategory !== 'all') {
    evaluations = evaluations.filter((e) => e.player && e.player.ageCategory === ageCategory);
  }

  res.json(evaluations);
};

// @desc    Get single evaluation by ID
// @route   GET /api/evaluations/:id
// @access  Private
export const getEvaluationById = async (req, res) => {
  const evaluation = await Evaluation.findById(req.params.id)
    .populate('player')
    .populate('coach', 'name email specialization')
    .populate('trainingSession', 'title date');

  if (!evaluation) {
    return res.status(404).json({ message: 'Evaluation not found' });
  }

  res.json(evaluation);
};

// @desc    Create new evaluation
// @route   POST /api/evaluations
// @access  Private
export const createEvaluation = async (req, res) => {
  const {
    player,
    trainingSession,
    date,
    physicalAbilities,
    technicalSkills,
    tacticalAbilities,
    personalDevelopment,
    strengths,
    areasForImprovement,
    coachObservations,
  } = req.body;

  const targetPlayer = await Player.findById(player);
  if (!targetPlayer) {
    return res.status(404).json({ message: 'Player not found' });
  }

  const evaluation = new Evaluation({
    player,
    coach: req.user._id,
    trainingSession: trainingSession || undefined,
    date: date || new Date(),
    physicalAbilities,
    technicalSkills,
    tacticalAbilities,
    personalDevelopment,
    strengths: strengths || [],
    areasForImprovement: areasForImprovement || [],
    coachObservations: coachObservations || '',
  });

  const savedEval = await evaluation.save();
  const populated = await Evaluation.findById(savedEval._id)
    .populate('player', 'firstName lastName primaryPosition ageCategory')
    .populate('coach', 'name email');

  res.status(201).json(populated);
};

// @desc    Update evaluation
// @route   PUT /api/evaluations/:id
// @access  Private
export const updateEvaluation = async (req, res) => {
  const evaluation = await Evaluation.findById(req.params.id);

  if (!evaluation) {
    return res.status(404).json({ message: 'Evaluation not found' });
  }

  const fields = [
    'date',
    'physicalAbilities',
    'technicalSkills',
    'tacticalAbilities',
    'personalDevelopment',
    'strengths',
    'areasForImprovement',
    'coachObservations',
    'trainingSession',
  ];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      evaluation[field] = req.body[field];
    }
  });

  const updatedEval = await evaluation.save();
  const populated = await Evaluation.findById(updatedEval._id)
    .populate('player', 'firstName lastName primaryPosition ageCategory')
    .populate('coach', 'name email');

  res.json(populated);
};

// @desc    Delete evaluation
// @route   DELETE /api/evaluations/:id
// @access  Private
export const deleteEvaluation = async (req, res) => {
  const evaluation = await Evaluation.findById(req.params.id);

  if (!evaluation) {
    return res.status(404).json({ message: 'Evaluation not found' });
  }

  await evaluation.deleteOne();
  res.json({ message: 'Evaluation removed successfully' });
};

// @desc    Compare two evaluations for a player or compare two players
// @route   POST /api/evaluations/compare
// @access  Private
export const compareEvaluations = async (req, res) => {
  const { evaluationId1, evaluationId2, playerId1, playerId2 } = req.body;

  let eval1, eval2;

  if (evaluationId1 && evaluationId2) {
    eval1 = await Evaluation.findById(evaluationId1).populate('player').populate('coach', 'name');
    eval2 = await Evaluation.findById(evaluationId2).populate('player').populate('coach', 'name');
  } else if (playerId1 && playerId2) {
    // Latest evaluation for each player
    eval1 = await Evaluation.findOne({ player: playerId1 }).sort({ date: -1 }).populate('player').populate('coach', 'name');
    eval2 = await Evaluation.findOne({ player: playerId2 }).sort({ date: -1 }).populate('player').populate('coach', 'name');
  }

  if (!eval1 || !eval2) {
    return res.status(404).json({ message: 'Could not find two valid evaluations to compare' });
  }

  // Ensure chronological order if same player
  if (eval1.player._id.toString() === eval2.player._id.toString()) {
    if (new Date(eval1.date) > new Date(eval2.date)) {
      const temp = eval1;
      eval1 = eval2;
      eval2 = temp;
    }
  }

  const metricsList = [
    { key: 'speed', name: 'Speed', category: 'Physical' },
    { key: 'endurance', name: 'Endurance', category: 'Physical' },
    { key: 'agility', name: 'Agility', category: 'Physical' },
    { key: 'strength', name: 'Strength', category: 'Physical' },
    { key: 'passing', name: 'Passing', category: 'Technical' },
    { key: 'shooting', name: 'Shooting', category: 'Technical' },
    { key: 'dribbling', name: 'Dribbling', category: 'Technical' },
    { key: 'ballControl', name: 'Ball Control', category: 'Technical' },
    { key: 'positioning', name: 'Positioning', category: 'Tactical' },
    { key: 'decisionMaking', name: 'Decision Making', category: 'Tactical' },
    { key: 'gameAwareness', name: 'Game Awareness', category: 'Tactical' },
    { key: 'discipline', name: 'Discipline', category: 'Personal' },
    { key: 'teamwork', name: 'Teamwork', category: 'Personal' },
    { key: 'motivation', name: 'Motivation', category: 'Personal' },
  ];

  const comparisons = [];
  const improved = [];
  const declined = [];
  const stable = [];

  const getVal = (ev, key, cat) => {
    if (cat === 'Physical') return ev.physicalAbilities?.[key] || 5;
    if (cat === 'Technical') return ev.technicalSkills?.[key] || 5;
    if (cat === 'Tactical') return ev.tacticalAbilities?.[key] || 5;
    if (cat === 'Personal') return ev.personalDevelopment?.[key] || 5;
    return 5;
  };

  metricsList.forEach(({ key, name, category }) => {
    const v1 = getVal(eval1, key, category);
    const v2 = getVal(eval2, key, category);
    const delta = parseFloat((v2 - v1).toFixed(1));

    let status = 'stable';
    if (delta > 0.3) {
      status = 'improved';
      improved.push({ name, delta, category });
    } else if (delta < -0.3) {
      status = 'declined';
      declined.push({ name, delta, category });
    } else {
      stable.push({ name, delta, category });
    }

    comparisons.push({
      key,
      name,
      category,
      eval1Value: v1,
      eval2Value: v2,
      delta,
      status,
    });
  });

  res.json({
    eval1,
    eval2,
    scoreDiff: parseFloat(((eval2.overallScore || 0) - (eval1.overallScore || 0)).toFixed(1)),
    comparisons,
    improved,
    declined,
    stable,
    daysBetween: Math.round(
      Math.abs(new Date(eval2.date) - new Date(eval1.date)) / (1000 * 60 * 60 * 24)
    ),
  });
};
