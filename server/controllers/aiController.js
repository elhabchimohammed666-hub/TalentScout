import AIAnalysis from '../models/AIAnalysis.js';
import Player from '../models/Player.js';
import Evaluation from '../models/Evaluation.js';
import Attendance from '../models/Attendance.js';
import DevelopmentGoal from '../models/DevelopmentGoal.js';
import { generatePlayerAnalysis } from '../services/aiService.js';

// @desc    Generate new AI Analysis for a player
// @route   POST /api/ai/analyze/:playerId
// @access  Private
export const requestPlayerAnalysis = async (req, res) => {
  const { playerId } = req.params;

  const player = await Player.findById(playerId);
  if (!player) {
    return res.status(404).json({ message: 'Player not found' });
  }

  // Retrieve player evaluations sorted by date
  const evaluations = await Evaluation.find({ player: playerId }).sort({ date: 1 });

  // Retrieve attendance stats
  const totalAttendance = await Attendance.countDocuments({ player: playerId });
  const presentCount = await Attendance.countDocuments({ player: playerId, status: 'present' });
  const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 100;

  // Retrieve development goals
  const developmentGoals = await DevelopmentGoal.find({ player: playerId });

  // Generate analysis through AI service
  const analysisResult = await generatePlayerAnalysis({
    player,
    evaluations,
    attendanceStats: { totalAttendance, presentCount, attendanceRate },
    developmentGoals,
  });

  // Store in database
  const aiRecord = await AIAnalysis.create({
    player: playerId,
    requestedBy: req.user._id,
    date: new Date(),
    summary: analysisResult.summary,
    demonstratedStrengths: analysisResult.demonstratedStrengths,
    areasRequiringImprovement: analysisResult.areasRequiringImprovement,
    historicalComparison: analysisResult.historicalComparison,
    trainingRecommendations: analysisResult.trainingRecommendations,
    coachObservationsAcknowledged: analysisResult.coachObservationsAcknowledged,
    dataSufficiencyNotice: analysisResult.dataSufficiencyNotice,
    modelUsed: analysisResult.modelUsed,
  });

  const populated = await AIAnalysis.findById(aiRecord._id)
    .populate('requestedBy', 'name email role')
    .populate('player', 'firstName lastName primaryPosition ageCategory');

  res.status(201).json(populated);
};

// @desc    Get all AI analyses for a player
// @route   GET /api/ai/player/:playerId
// @access  Private
export const getPlayerAnalysisHistory = async (req, res) => {
  const { playerId } = req.params;

  const analyses = await AIAnalysis.find({ player: playerId })
    .populate('requestedBy', 'name email')
    .sort({ date: -1 });

  res.json(analyses);
};

// @desc    Get single AI analysis by ID
// @route   GET /api/ai/:id
// @access  Private
export const getAnalysisById = async (req, res) => {
  const analysis = await AIAnalysis.findById(req.params.id)
    .populate('requestedBy', 'name email')
    .populate('player', 'firstName lastName ageCategory primaryPosition jerseyNumber');

  if (!analysis) {
    return res.status(404).json({ message: 'Analysis not found' });
  }

  res.json(analysis);
};
