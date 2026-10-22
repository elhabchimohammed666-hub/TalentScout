import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Academy from '../models/Academy.js';
import Player from '../models/Player.js';
import TrainingSession from '../models/TrainingSession.js';
import Attendance from '../models/Attendance.js';
import Evaluation from '../models/Evaluation.js';
import DevelopmentGoal from '../models/DevelopmentGoal.js';
import AIAnalysis from '../models/AIAnalysis.js';
import { generatePlayerAnalysis } from '../services/aiService.js';

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/talentscout';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB for seeding...');

    // Clean existing database
    await User.deleteMany({});
    await Academy.deleteMany({});
    await Player.deleteMany({});
    await TrainingSession.deleteMany({});
    await Attendance.deleteMany({});
    await Evaluation.deleteMany({});
    await DevelopmentGoal.deleteMany({});
    await AIAnalysis.deleteMany({});

    console.log('[Seed] Cleared existing data.');

    // 1. Create Academy
    const academy = await Academy.create({
      name: 'TalentScout Elite Football Academy',
      motto: 'Forging Elite Character, Technique, and Football Intelligence',
      address: '45 Camp Nou Boulevard, Football Valley',
      email: 'contact@talentscout.fc',
      phone: '+1 (555) 782-9012',
      foundedYear: 2019,
      philosophy: 'A modern pedagogical methodology combining European youth academy rigor, technical ball mastery, tactical cognitive scanning, and data-assisted individual development.',
      logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=150&auto=format&fit=crop&q=80',
    });
    console.log('[Seed] Academy profile created.');

    // 2. Create Users (Manager and Coaches)
    const manager = await User.create({
      name: 'Carlos Mendes',
      email: 'manager@talentscout.fc',
      password: 'password123',
      role: 'academy_manager',
      phone: '+1 (555) 001-9988',
      bio: 'UEFA Pro License Director with over 15 years experience directing European and North American youth football academies.',
      specialization: 'Academy Technical Direction & Scouting Operations',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      status: 'active',
    });

    const coachMarcus = await User.create({
      name: 'Marcus Vance',
      email: 'coach.marcus@talentscout.fc',
      password: 'password123',
      role: 'coach',
      phone: '+1 (555) 002-3344',
      bio: 'Former professional midfielder, UEFA A certified coach specializing in positional play, scanning, and midfield tactical mechanics.',
      specialization: 'Midfield Play & Tactical Game Reading',
      assignedAgeGroups: ['U-15', 'U-17'],
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      status: 'active',
    });

    const coachSarah = await User.create({
      name: 'Sarah Jenkins',
      email: 'coach.sarah@talentscout.fc',
      password: 'password123',
      role: 'coach',
      phone: '+1 (555) 003-7722',
      bio: 'Ex-national team player and youth conditioning expert focused on acceleration mechanics, ball mastery, and high-tempo transitional pressing.',
      specialization: 'Speed Mechanics, First Touch & Finishing',
      assignedAgeGroups: ['U-13', 'U-15'],
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      status: 'active',
    });

    console.log('[Seed] Manager & Coach accounts created.');

    // 3. Create Players (Scenario 1: Adam, 14-year-old midfielder, plus teammates)
    const adamDob = new Date('2012-04-15'); // 14 years old in 2026
    const playerAdam = await Player.create({
      firstName: 'Adam',
      lastName: 'Belkacem',
      dateOfBirth: adamDob,
      gender: 'Male',
      primaryPosition: 'Central Midfielder (CM)',
      secondaryPosition: 'Attacking Midfielder (CAM)',
      jerseyNumber: 8,
      dominantFoot: 'Right',
      ageCategory: 'U-15',
      trainingGroup: 'Group A - Midfield Unit',
      assignedCoaches: [coachMarcus._id, coachSarah._id],
      registrationDate: new Date('2025-09-01'),
      status: 'active',
      heightCm: 168,
      weightKg: 58,
      photoUrl: 'https://images.unsplash.com/photo-1546512565-39d4dc75e556?w=200&auto=format&fit=crop&q=80',
      emergencyContact: {
        name: 'Karim Belkacem',
        relation: 'Father',
        phone: '+1 (555) 431-9012',
      },
      notes: 'Exceptional aerobic engine and natural work rate. Very coachable player with strong hunger to improve his passing range.',
    });

    const playerLucas = await Player.create({
      firstName: 'Lucas',
      lastName: 'Moretti',
      dateOfBirth: new Date('2011-08-20'),
      gender: 'Male',
      primaryPosition: 'Striker (ST/CF)',
      secondaryPosition: 'Winger (LW/RW)',
      jerseyNumber: 9,
      dominantFoot: 'Right',
      ageCategory: 'U-15',
      trainingGroup: 'Group A - Attackers',
      assignedCoaches: [coachSarah._id],
      registrationDate: new Date('2025-09-01'),
      status: 'active',
      heightCm: 174,
      weightKg: 64,
      photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
      emergencyContact: { name: 'Elena Moretti', relation: 'Mother', phone: '+1 (555) 762-1199' },
      notes: 'Instinctive box finisher. Needs to develop back-to-goal hold-up play.',
    });

    const playerMateo = await Player.create({
      firstName: 'Mateo',
      lastName: 'Silva',
      dateOfBirth: new Date('2011-11-05'),
      gender: 'Male',
      primaryPosition: 'Center Back',
      secondaryPosition: 'Defensive Midfielder (CDM)',
      jerseyNumber: 4,
      dominantFoot: 'Left',
      ageCategory: 'U-15',
      trainingGroup: 'Group A - Defensive Unit',
      assignedCoaches: [coachMarcus._id],
      registrationDate: new Date('2025-09-10'),
      status: 'active',
      heightCm: 178,
      weightKg: 67,
      photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
      emergencyContact: { name: 'Ricardo Silva', relation: 'Father', phone: '+1 (555) 881-2244' },
      notes: 'Tall, composed left-footed defender with strong aerial presence.',
    });

    const playerNoah = await Player.create({
      firstName: 'Noah',
      lastName: 'Dubois',
      dateOfBirth: new Date('2013-03-12'),
      gender: 'Male',
      primaryPosition: 'Winger (LW/RW)',
      secondaryPosition: 'Attacking Midfielder (CAM)',
      jerseyNumber: 7,
      dominantFoot: 'Both',
      ageCategory: 'U-13',
      trainingGroup: 'Junior Academy',
      assignedCoaches: [coachSarah._id],
      registrationDate: new Date('2025-10-01'),
      status: 'active',
      heightCm: 154,
      weightKg: 44,
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      emergencyContact: { name: 'Claire Dubois', relation: 'Mother', phone: '+1 (555) 334-9988' },
      notes: 'Terrific burst of acceleration and low center of gravity.',
    });

    const playerGabriel = await Player.create({
      firstName: 'Gabriel',
      lastName: 'Santos',
      dateOfBirth: new Date('2010-02-18'),
      gender: 'Male',
      primaryPosition: 'Goalkeeper',
      secondaryPosition: '',
      jerseyNumber: 1,
      dominantFoot: 'Right',
      ageCategory: 'U-17',
      trainingGroup: 'Goalkeepers Elite',
      assignedCoaches: [coachMarcus._id],
      registrationDate: new Date('2025-08-15'),
      status: 'active',
      heightCm: 186,
      weightKg: 76,
      photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
      emergencyContact: { name: 'Antonio Santos', relation: 'Father', phone: '+1 (555) 901-4455' },
      notes: 'Commanding in the 18-yard box, excellent shot-stopping reflex.',
    });

    const playerSami = await Player.create({
      firstName: 'Sami',
      lastName: 'Haddad',
      dateOfBirth: new Date('2011-06-22'),
      gender: 'Male',
      primaryPosition: 'Defensive Midfielder (CDM)',
      secondaryPosition: 'Center Back',
      jerseyNumber: 6,
      dominantFoot: 'Right',
      ageCategory: 'U-15',
      trainingGroup: 'Group A - Midfield Unit',
      assignedCoaches: [coachMarcus._id],
      registrationDate: new Date('2025-09-01'),
      status: 'active',
      heightCm: 172,
      weightKg: 63,
      photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80',
      emergencyContact: { name: 'Nadia Haddad', relation: 'Mother', phone: '+1 (555) 554-1122' },
      notes: 'Aggressive ball winner with strong tactical discipline.',
    });

    console.log('[Seed] Players registered.');

    // 4. Create Training Sessions
    const datePast2Weeks = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000);
    const datePast1Week = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dateToday = new Date();
    const dateNextWeek = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

    const session1 = await TrainingSession.create({
      title: 'U-15 Tactical Passing & High Press Recovery',
      date: datePast2Weeks,
      startTime: '16:30',
      endTime: '18:30',
      location: 'Pitch 1 (Full Turf)',
      ageGroup: 'U-15',
      focusTopics: ['passing', 'tactical awareness', 'endurance'],
      description: 'Focusing on transition from defensive block to rapid counter-attack with 2-touch passing gates.',
      coach: coachMarcus._id,
      assignedPlayers: [playerAdam._id, playerLucas._id, playerMateo._id, playerSami._id],
      status: 'completed',
      intensity: 'high',
      postSessionNotes: 'High physical output observed across the group. Adam completed full running distances without fatigue.',
    });

    const session2 = await TrainingSession.create({
      title: 'Passing Under Defensive Pressure & Tight Spaces',
      date: datePast1Week,
      startTime: '17:00',
      endTime: '19:00',
      location: 'Pitch 2 (Small Sided Enclosure)',
      ageGroup: 'U-15',
      focusTopics: ['passing', 'ball control', 'decision-making'],
      description: 'Tight 4v2 rondos and 3-team transition squares simulating high-press opposition.',
      coach: coachMarcus._id,
      assignedPlayers: [playerAdam._id, playerLucas._id, playerMateo._id, playerSami._id],
      status: 'completed',
      intensity: 'medium',
      postSessionNotes: 'Adam showed marked improvements in early body opening before receiving passes under press.',
    });

    const sessionUpcoming = await TrainingSession.create({
      title: 'U-15 Tactical Positioning & Final Third Combination Play',
      date: dateNextWeek,
      startTime: '16:30',
      endTime: '18:30',
      location: 'Pitch 1 (Full Turf)',
      ageGroup: 'U-15',
      focusTopics: ['tactical awareness', 'finishing', 'passing'],
      description: 'Pattern play through central midfielders into striker run channels.',
      coach: coachMarcus._id,
      assignedPlayers: [playerAdam._id, playerLucas._id, playerMateo._id, playerSami._id],
      status: 'scheduled',
      intensity: 'high',
    });

    console.log('[Seed] Training sessions created.');

    // 5. Create Attendance Records
    await Attendance.create({
      trainingSession: session1._id,
      player: playerAdam._id,
      status: 'present',
      date: session1.date,
      arrivalTime: '16:20',
      notes: 'Arrived early and completed warm-up routines enthusiastically.',
      recordedBy: coachMarcus._id,
    });
    await Attendance.create({
      trainingSession: session1._id,
      player: playerLucas._id,
      status: 'present',
      date: session1.date,
      arrivalTime: '16:28',
      notes: '',
      recordedBy: coachMarcus._id,
    });
    await Attendance.create({
      trainingSession: session1._id,
      player: playerMateo._id,
      status: 'present',
      date: session1.date,
      arrivalTime: '16:25',
      notes: '',
      recordedBy: coachMarcus._id,
    });
    await Attendance.create({
      trainingSession: session1._id,
      player: playerSami._id,
      status: 'excused',
      date: session1.date,
      notes: 'School examination conflict notified in advance.',
      recordedBy: coachMarcus._id,
    });

    await Attendance.create({
      trainingSession: session2._id,
      player: playerAdam._id,
      status: 'present',
      date: session2.date,
      arrivalTime: '16:55',
      notes: 'Punctual and focused.',
      recordedBy: coachMarcus._id,
    });
    await Attendance.create({
      trainingSession: session2._id,
      player: playerLucas._id,
      status: 'present',
      date: session2.date,
      arrivalTime: '17:00',
      notes: '',
      recordedBy: coachMarcus._id,
    });
    await Attendance.create({
      trainingSession: session2._id,
      player: playerMateo._id,
      status: 'present',
      date: session2.date,
      arrivalTime: '16:50',
      notes: '',
      recordedBy: coachMarcus._id,
    });
    await Attendance.create({
      trainingSession: session2._id,
      player: playerSami._id,
      status: 'present',
      date: session2.date,
      arrivalTime: '16:52',
      notes: '',
      recordedBy: coachMarcus._id,
    });

    console.log('[Seed] Attendance records created.');

    // 6. Create Historical Evaluations for Adam (Exact Scenario from PDF page 10)
    // Step 4 & 5: Initial Player Evaluation:
    // "After the session, the coach evaluates Adam, a 14-year-old midfielder, by assigning performance ratings
    // for passing, endurance, agility, and tactical awareness.
    // Observation: Adam demonstrates good stamina but sometimes struggles with accurate passes under pressure."
    const eval1 = await Evaluation.create({
      player: playerAdam._id,
      coach: coachMarcus._id,
      trainingSession: session1._id,
      date: datePast2Weeks,
      physicalAbilities: {
        speed: 7.2,
        endurance: 8.8,
        agility: 7.5,
        strength: 6.8,
      },
      technicalSkills: {
        passing: 5.4,
        shooting: 6.0,
        dribbling: 6.8,
        ballControl: 6.5,
      },
      tacticalAbilities: {
        positioning: 6.8,
        decisionMaking: 5.8,
        gameAwareness: 6.6,
      },
      personalDevelopment: {
        discipline: 8.5,
        teamwork: 8.0,
        motivation: 9.0,
      },
      strengths: ['High aerobic stamina and sustained work rate', 'Committed training discipline'],
      areasForImprovement: ['Passing accuracy under immediate defensive pressure', 'Body orientation prior to receiving'],
      coachObservations: 'Adam demonstrates excellent stamina and positive attitude, but sometimes struggles with accurate passes under pressure when defenders close down rapidly.',
    });

    // Step 6: Follow-up Evaluation several weeks later:
    // Coach records another evaluation showing progress in passing after targeted drill practice
    const eval2 = await Evaluation.create({
      player: playerAdam._id,
      coach: coachMarcus._id,
      trainingSession: session2._id,
      date: datePast1Week,
      physicalAbilities: {
        speed: 7.4,
        endurance: 8.9,
        agility: 7.8,
        strength: 7.0,
      },
      technicalSkills: {
        passing: 6.9, // Significant improvement from 5.4!
        shooting: 6.2,
        dribbling: 7.1,
        ballControl: 7.2,
      },
      tacticalAbilities: {
        positioning: 7.2,
        decisionMaking: 6.8,
        gameAwareness: 7.0,
      },
      personalDevelopment: {
        discipline: 8.8,
        teamwork: 8.4,
        motivation: 9.2,
      },
      strengths: ['Continuous high stamina and defensive tracking', 'Marked improvement in composure on tight 1-2 passing exchanges'],
      areasForImprovement: ['Long diagonal switch passes', 'Weak foot distribution under balance displacement'],
      coachObservations: 'Following targeted rondo practices, Adam showed noticeable improvement in pass accuracy and body opening under pressure. Stamina remains among top in squad.',
    });

    // Evaluations for other players
    await Evaluation.create({
      player: playerLucas._id,
      coach: coachSarah._id,
      date: datePast1Week,
      physicalAbilities: { speed: 8.6, endurance: 6.8, agility: 7.9, strength: 7.4 },
      technicalSkills: { passing: 6.2, shooting: 8.8, dribbling: 7.5, ballControl: 7.8 },
      tacticalAbilities: { positioning: 8.0, decisionMaking: 7.4, gameAwareness: 7.2 },
      personalDevelopment: { discipline: 7.8, teamwork: 7.2, motivation: 8.8 },
      strengths: ['Instinctive penalty box movement', 'First-time shot accuracy on both feet'],
      areasForImprovement: ['Aerobic stamina in closing 20 minutes', 'Defensive counter-pressing participation'],
      coachObservations: 'Lethal inside the box. Needs to increase off-the-ball pressing commitment.',
    });

    await Evaluation.create({
      player: playerMateo._id,
      coach: coachMarcus._id,
      date: datePast2Weeks,
      physicalAbilities: { speed: 6.8, endurance: 7.5, agility: 6.5, strength: 8.6 },
      technicalSkills: { passing: 7.2, shooting: 5.0, dribbling: 5.8, ballControl: 7.0 },
      tacticalAbilities: { positioning: 8.2, decisionMaking: 7.8, gameAwareness: 8.0 },
      personalDevelopment: { discipline: 8.8, teamwork: 8.6, motivation: 8.4 },
      strengths: ['Defensive aerial duels', 'Composed left-foot line-breaking passes'],
      areasForImprovement: ['Lateral agility against quick agile wingers'],
      coachObservations: 'Dominant in central defense. Reading of play compensates for slight deficit in lateral foot speed.',
    });

    console.log('[Seed] Evaluations created.');

    // 7. Create Development Goals for Adam
    await DevelopmentGoal.create({
      player: playerAdam._id,
      coach: coachMarcus._id,
      title: 'Elevate Passing Under Pressure Rating to 7.5/10',
      category: 'Technical',
      targetMetric: 'passing',
      currentValue: 6.9,
      targetValue: 7.5,
      unit: '/10 rating',
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      status: 'in_progress',
      notes: 'Master 1-touch directional wall passes during high intensity 4v2 overload drills.',
    });

    await DevelopmentGoal.create({
      player: playerAdam._id,
      coach: coachSarah._id,
      title: 'Maintain 90-Minute Match Aerobic Capacity',
      category: 'Physical',
      targetMetric: 'endurance',
      currentValue: 8.9,
      targetValue: 9.2,
      unit: '/10 rating',
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      status: 'in_progress',
      notes: 'Sustain box-to-box transitional recoveries during scrimmage matches.',
    });

    console.log('[Seed] Development goals created.');

    // 8. Generate Initial AI Analysis for Adam (Scenario Step 7)
    const aiAnalysisResult = await generatePlayerAnalysis({
      player: playerAdam,
      evaluations: [eval1, eval2],
      attendanceStats: { totalAttendance: 2, presentCount: 2, attendanceRate: 100 },
      developmentGoals: [],
    });

    await AIAnalysis.create({
      player: playerAdam._id,
      requestedBy: coachMarcus._id,
      date: new Date(),
      summary: aiAnalysisResult.summary,
      demonstratedStrengths: aiAnalysisResult.demonstratedStrengths,
      areasRequiringImprovement: aiAnalysisResult.areasRequiringImprovement,
      historicalComparison: aiAnalysisResult.historicalComparison,
      trainingRecommendations: aiAnalysisResult.trainingRecommendations,
      coachObservationsAcknowledged: aiAnalysisResult.coachObservationsAcknowledged,
      dataSufficiencyNotice: aiAnalysisResult.dataSufficiencyNotice,
      modelUsed: aiAnalysisResult.modelUsed,
    });

    console.log('[Seed] AI Analysis generated and saved for Adam Belkacem.');

    console.log('\n======================================================');
    console.log('✅ TalentScout Database Seeding Completed Successfully!');
    console.log('======================================================');
    console.log('Demonstration Credentials:');
    console.log('Academy Manager:  manager@talentscout.fc       / password123');
    console.log('Tactical Coach:   coach.marcus@talentscout.fc  / password123');
    console.log('Condition Coach:  coach.sarah@talentscout.fc   / password123');
    console.log('Featured Player:  Adam Belkacem (14yo Midfielder with 2 evaluations & AI report)');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
    process.exit(1);
  }
};

seedData();
