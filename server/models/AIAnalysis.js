import mongoose from 'mongoose';

const aiAnalysisSchema = new mongoose.Schema(
  {
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    summary: {
      type: String,
      required: true,
    },
    demonstratedStrengths: [
      {
        type: String,
      },
    ],
    areasRequiringImprovement: [
      {
        type: String,
      },
    ],
    historicalComparison: {
      status: {
        type: String,
        enum: ['insufficient_data', 'progressing', 'regressing', 'stable', 'fluctuating'],
        default: 'insufficient_data',
      },
      explanation: {
        type: String,
        default: '',
      },
      metricComparisons: [
        {
          metric: String,
          category: String,
          previous: Number,
          current: Number,
          delta: Number,
          trend: String,
        },
      ],
    },
    trainingRecommendations: [
      {
        targetedSkill: { type: String, required: true },
        exerciseName: { type: String, required: true },
        objective: { type: String, required: true },
        durationOrReps: { type: String, required: true },
        suitableAge: { type: String, default: 'U-15' },
        evaluationEvidence: { type: String, required: true },
      },
    ],
    coachObservationsAcknowledged: {
      type: String,
      default: '',
    },
    dataSufficiencyNotice: {
      type: String,
      default: '',
    },
    modelUsed: {
      type: String,
      default: 'TalentScout Football AI Engine',
    },
  },
  {
    timestamps: true,
  }
);

const AIAnalysis = mongoose.model('AIAnalysis', aiAnalysisSchema);
export default AIAnalysis;
