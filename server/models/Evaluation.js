import mongoose from 'mongoose';

const evaluationSchema = new mongoose.Schema(
  {
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
    },
    coach: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    trainingSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TrainingSession',
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    physicalAbilities: {
      speed: { type: Number, min: 1, max: 10, required: true, default: 5 },
      endurance: { type: Number, min: 1, max: 10, required: true, default: 5 },
      agility: { type: Number, min: 1, max: 10, required: true, default: 5 },
      strength: { type: Number, min: 1, max: 10, required: true, default: 5 },
    },
    technicalSkills: {
      passing: { type: Number, min: 1, max: 10, required: true, default: 5 },
      shooting: { type: Number, min: 1, max: 10, required: true, default: 5 },
      dribbling: { type: Number, min: 1, max: 10, required: true, default: 5 },
      ballControl: { type: Number, min: 1, max: 10, required: true, default: 5 },
    },
    tacticalAbilities: {
      positioning: { type: Number, min: 1, max: 10, required: true, default: 5 },
      decisionMaking: { type: Number, min: 1, max: 10, required: true, default: 5 },
      gameAwareness: { type: Number, min: 1, max: 10, required: true, default: 5 },
    },
    personalDevelopment: {
      discipline: { type: Number, min: 1, max: 10, required: true, default: 5 },
      teamwork: { type: Number, min: 1, max: 10, required: true, default: 5 },
      motivation: { type: Number, min: 1, max: 10, required: true, default: 5 },
    },
    overallScore: {
      type: Number,
      min: 1,
      max: 10,
    },
    strengths: {
      type: [String],
      default: [],
    },
    areasForImprovement: {
      type: [String],
      default: [],
    },
    coachObservations: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate overallScore automatically
evaluationSchema.pre('save', function (next) {
  const p = this.physicalAbilities;
  const t = this.technicalSkills;
  const tac = this.tacticalAbilities;
  const pd = this.personalDevelopment;

  const physicalAvg = (p.speed + p.endurance + p.agility + p.strength) / 4;
  const technicalAvg = (t.passing + t.shooting + t.dribbling + t.ballControl) / 4;
  const tacticalAvg = (tac.positioning + tac.decisionMaking + tac.gameAwareness) / 3;
  const personalAvg = (pd.discipline + pd.teamwork + pd.motivation) / 3;

  const totalAvg = (physicalAvg + technicalAvg + tacticalAvg + personalAvg) / 4;
  this.overallScore = parseFloat(totalAvg.toFixed(1));
  next();
});

const Evaluation = mongoose.model('Evaluation', evaluationSchema);
export default Evaluation;
