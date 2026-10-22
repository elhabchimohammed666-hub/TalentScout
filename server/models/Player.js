import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      default: 'Male',
    },
    primaryPosition: {
      type: String,
      required: [true, 'Primary position is required'],
      enum: [
        'Goalkeeper',
        'Center Back',
        'Fullback (LB/RB)',
        'Defensive Midfielder (CDM)',
        'Central Midfielder (CM)',
        'Attacking Midfielder (CAM)',
        'Winger (LW/RW)',
        'Striker (ST/CF)',
      ],
    },
    secondaryPosition: {
      type: String,
      default: '',
    },
    jerseyNumber: {
      type: Number,
      default: 10,
    },
    dominantFoot: {
      type: String,
      enum: ['Right', 'Left', 'Both'],
      default: 'Right',
    },
    ageCategory: {
      type: String,
      enum: ['U-11', 'U-13', 'U-15', 'U-17', 'U-19', 'Senior'],
      default: 'U-15',
    },
    trainingGroup: {
      type: String,
      default: 'Group A',
    },
    assignedCoaches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    registrationDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'injured', 'inactive'],
      default: 'active',
    },
    photoUrl: {
      type: String,
      default: '',
    },
    heightCm: {
      type: Number,
      default: 165,
    },
    weightKg: {
      type: Number,
      default: 55,
    },
    emergencyContact: {
      name: { type: String, default: '' },
      relation: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for full name
playerSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for calculated age
playerSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  const diffMs = Date.now() - new Date(this.dateOfBirth).getTime();
  const ageDate = new Date(diffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
});

const Player = mongoose.model('Player', playerSchema);
export default Player;
