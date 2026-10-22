import mongoose from 'mongoose';

const developmentGoalSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Physical', 'Technical', 'Tactical', 'Personal Development'],
      default: 'Technical',
    },
    targetMetric: {
      type: String,
      default: 'passing',
    },
    currentValue: {
      type: Number,
      default: 5,
    },
    targetValue: {
      type: Number,
      required: true,
      default: 8,
    },
    unit: {
      type: String,
      default: '/10 rating',
    },
    deadline: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'achieved', 'abandoned'],
      default: 'in_progress',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const DevelopmentGoal = mongoose.model('DevelopmentGoal', developmentGoalSchema);
export default DevelopmentGoal;
