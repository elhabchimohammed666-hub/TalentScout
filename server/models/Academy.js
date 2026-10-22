import mongoose from 'mongoose';

const academySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: 'TalentScout Elite Football Academy',
      trim: true,
    },
    motto: {
      type: String,
      default: 'Developing the Football Stars of Tomorrow',
    },
    address: {
      type: String,
      default: '100 Stadium Way, Football City',
    },
    email: {
      type: String,
      default: 'contact@talentscout.fc',
    },
    phone: {
      type: String,
      default: '+1 (555) 019-2834',
    },
    foundedYear: {
      type: Number,
      default: 2018,
    },
    philosophy: {
      type: String,
      default: 'Holistic player development emphasizing technical mastery, game intelligence, physical resilience, and high sportsmanship.',
    },
    logo: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Academy = mongoose.model('Academy', academySchema);
export default Academy;
