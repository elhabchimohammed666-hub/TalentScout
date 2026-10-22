import mongoose from 'mongoose';

const trainingSessionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Session title is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Session date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      default: '16:00',
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      default: '18:00',
    },
    location: {
      type: String,
      default: 'Main Training Pitch A',
    },
    ageGroup: {
      type: String,
      enum: ['U-11', 'U-13', 'U-15', 'U-17', 'U-19', 'All Academy'],
      default: 'U-15',
    },
    focusTopics: {
      type: [String],
      default: ['passing', 'ball control', 'endurance'],
    },
    description: {
      type: String,
      default: '',
    },
    coach: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedPlayers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
      },
    ],
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    intensity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    postSessionNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const TrainingSession = mongoose.model('TrainingSession', trainingSessionSchema);
export default TrainingSession;
