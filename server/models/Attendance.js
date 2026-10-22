import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    trainingSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TrainingSession',
      required: true,
    },
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'excused'],
      default: 'present',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    arrivalTime: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique index so a player has only one attendance record per session
attendanceSchema.index({ trainingSession: 1, player: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
