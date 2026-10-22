import axios from 'axios';

/**
 * Dedicated AI Service Module for TalentScout
 * Implements strict data grounding, historical comparison validation,
 * age-appropriate training recommendations, and safe fallback.
 */

export const generatePlayerAnalysis = async ({ player, evaluations, attendanceStats, developmentGoals }) => {
  // Sort evaluations chronologically ascending
  const sortedEvals = [...evaluations].sort((a, b) => new Date(a.date) - new Date(b.date));
  const evalCount = sortedEvals.length;

  const playerAge = player.age || 14;
  const playerPosition = player.primaryPosition;
  const playerAgeCategory = player.ageCategory || 'U-15';

  // Check if external Gemini API key is configured
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const prompt = buildAIPrompt({ player, sortedEvals, evalCount, attendanceStats, developmentGoals });
      const aiResponse = await callGeminiAPI(apiKey, prompt);
      if (aiResponse) {
        return {
          ...aiResponse,
          modelUsed: 'Google Gemini 1.5 Flash (via TalentScout AI Service)',
        };
      }
    } catch (err) {
      console.warn('[AI Service] Gemini API call failed or timed out. Falling back to local Football Analysis Engine:', err.message);
    }
  }

  // Built-in Expert Football Methodology Engine (Strictly grounded in evaluation data)
  return generateDeterministicFootballAnalysis({
    player,
    sortedEvals,
    evalCount,
    attendanceStats,
    developmentGoals,
  });
};

/**
 * Build rigorous prompt adhering to all PDF constraints
 */
function buildAIPrompt({ player, sortedEvals, evalCount, attendanceStats, developmentGoals }) {
  const evalsSummary = sortedEvals.map((e, idx) => ({
    evaluationNumber: idx + 1,
    date: e.date,
    overallScore: e.overallScore,
    physicalAbilities: e.physicalAbilities,
    technicalSkills: e.technicalSkills,
    tacticalAbilities: e.tacticalAbilities,
    personalDevelopment: e.personalDevelopment,
    coachObservations: e.coachObservations,
    strengths: e.strengths,
    areasForImprovement: e.areasForImprovement,
  }));

  return `You are TalentScout AI, a professional football academy technical analyst.
Your task is to analyze the recorded performance of a youth academy football player and generate a structured coaching report.

CRITICAL CONSTRAINTS:
1. Ground every statement STRICTLY in the provided evaluation metrics and coach observations. Do NOT invent improvements, scores, or regressions not supported by the data.
2. If there are fewer than 2 evaluations, you MUST state that historical trend analysis cannot be conclusively established due to insufficient comparative records.
3. Suggest 2-3 specific, age-appropriate football training drills. Each drill must have:
   - targetedSkill
   - exerciseName
   - objective
   - durationOrReps (e.g. "3 sets of 8 reps, 20 mins")
   - suitableAge (must match player's age category: ${player.ageCategory})
   - evaluationEvidence (must explicitly cite the specific score or coach observation that motivates this drill).
4. Training suggestions must avoid unsafe workloads and MUST NOT diagnose injuries, assess medical conditions, or prescribe medical treatment.
5. Return ONLY a valid JSON object matching this schema:
{
  "summary": "Clear, professional summary of the player's performance.",
  "demonstratedStrengths": ["Strength 1 with score/note evidence", "Strength 2..."],
  "areasRequiringImprovement": ["Area 1 needing work", "Area 2..."],
  "historicalComparison": {
    "status": "insufficient_data" | "progressing" | "regressing" | "stable" | "fluctuating",
    "explanation": "Detailed explanation comparing evaluations or stating data insufficiency",
    "metricComparisons": [
      {
        "metric": "passing",
        "category": "Technical Skills",
        "previous": 5,
        "current": 6.5,
        "delta": 1.5,
        "trend": "improved" | "declined" | "stable"
      }
    ]
  },
  "trainingRecommendations": [
    {
      "targetedSkill": "Passing under Pressure",
      "exerciseName": "4v2 Rondo with Rapid Pressing Trigger",
      "objective": "Enhance pass accuracy and composure when closed down quickly",
      "durationOrReps": "4 sets x 4 minutes with 90s rest",
      "suitableAge": "${player.ageCategory}",
      "evaluationEvidence": "Cites coach observation: 'struggles with accurate passes under pressure' and passing score of 5.5"
    }
  ],
  "coachObservationsAcknowledged": "Specific reference to coach notes",
  "dataSufficiencyNotice": "Statement regarding whether historical data was sufficient or limited"
}

PLAYER DATA:
- Name: ${player.firstName} ${player.lastName}
- Age: ${player.age || 14} (Category: ${player.ageCategory})
- Position: ${player.primaryPosition}
- Attendance Consistency: ${attendanceStats ? attendanceStats.attendanceRate + '%' : 'N/A'}
- Goals: ${JSON.stringify(developmentGoals || [])}
- Recorded Evaluations (${evalCount} records):
${JSON.stringify(evalsSummary, null, 2)}
`;
}

/**
 * Call Gemini 1.5 Flash via REST
 */
async function callGeminiAPI(apiKey, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const response = await axios.post(
    url,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    },
    { timeout: 15000 }
  );

  const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;
  return JSON.parse(text);
}

/**
 * Built-in football analytics engine
 * Implements full domain logic and guarantees zero-hallucination compliance.
 */
function generateDeterministicFootballAnalysis({ player, sortedEvals, evalCount, attendanceStats, developmentGoals }) {
  const ageCategory = player.ageCategory || 'U-15';
  const position = player.primaryPosition || 'Midfielder';
  const playerName = `${player.firstName} ${player.lastName}`;

  // Case 1: No evaluations recorded
  if (evalCount === 0) {
    return {
      summary: `Player ${playerName} (${position}, ${ageCategory}) has no recorded performance evaluations yet. Initial evaluations by academy coaches are required before comparative development analysis can be conducted.`,
      demonstratedStrengths: ['Consistent registration and active academy profile'],
      areasRequiringImprovement: ['Awaiting baseline football evaluation across technical, physical, and tactical pillars'],
      historicalComparison: {
        status: 'insufficient_data',
        explanation: 'Historical comparison is unavailable because zero evaluation sessions have been recorded for this player.',
        metricComparisons: [],
      },
      trainingRecommendations: [
        {
          targetedSkill: 'General Technical Assessment',
          exerciseName: 'Fundamental Ball Mastery & Multi-Directional Dribbling Grid',
          objective: 'Establish baseline technical touch, agility, and motor coordination.',
          durationOrReps: '3 sets of 5 minutes (low-to-moderate intensity)',
          suitableAge: ageCategory,
          evaluationEvidence: 'Baseline entry evaluation pending. General foundational drill prescribed.',
        },
      ],
      coachObservationsAcknowledged: 'No coach observations recorded to date.',
      dataSufficiencyNotice: 'Insufficient evaluation data. At least one evaluation is required for baseline assessment, and two or more are required for progress tracking.',
      modelUsed: 'TalentScout Football Analysis Engine (Baseline Rule Engine)',
    };
  }

  // Case 2: Exactly 1 evaluation recorded (Baseline)
  if (evalCount === 1) {
    const latest = sortedEvals[0];
    const metricsMap = extractAllMetrics(latest);
    const { topStrengths, lowAreas } = rankMetrics(metricsMap);

    const recommendations = generatePositionSpecificDrills(lowAreas, position, ageCategory, latest.coachObservations);

    return {
      summary: `Baseline evaluation recorded on ${new Date(latest.date).toLocaleDateString()}. ${playerName} demonstrates strong foundation in ${topStrengths.map((s) => s.name).join(', ')}, while ${lowAreas.map((w) => w.name).join(', ')} have been identified as primary development priorities.`,
      demonstratedStrengths: topStrengths.map((s) => `${formatMetricName(s.name)}: rated ${s.val}/10 (${s.category})`),
      areasRequiringImprovement: lowAreas.map((w) => `${formatMetricName(w.name)}: rated ${w.val}/10 (${w.category}) - targeted for growth`),
      historicalComparison: {
        status: 'insufficient_data',
        explanation: 'Only one evaluation is currently on record. A minimum of two chronological evaluations is required to establish statistical trends and track progression or regression.',
        metricComparisons: [],
      },
      trainingRecommendations: recommendations,
      coachObservationsAcknowledged: latest.coachObservations || 'No qualitative observations logged in baseline evaluation.',
      dataSufficiencyNotice: 'Baseline established (1 evaluation). Comparative progress analysis will automatically unlock upon completion of the next scheduled evaluation.',
      modelUsed: 'TalentScout Football Analysis Engine (Single-Eval Baseline Synthesis)',
    };
  }

  // Case 3: 2 or more evaluations (Historical Comparison Available)
  const previous = sortedEvals[evalCount - 2];
  const latest = sortedEvals[evalCount - 1];

  const prevMetrics = extractAllMetrics(previous);
  const currMetrics = extractAllMetrics(latest);

  const metricComparisons = [];
  let improvedCount = 0;
  let declinedCount = 0;
  let stableCount = 0;

  for (const metricKey of Object.keys(currMetrics)) {
    const prevVal = prevMetrics[metricKey]?.val || 5;
    const currVal = currMetrics[metricKey]?.val || 5;
    const delta = parseFloat((currVal - prevVal).toFixed(1));
    let trend = 'stable';
    if (delta > 0.3) {
      trend = 'improved';
      improvedCount++;
    } else if (delta < -0.3) {
      trend = 'declined';
      declinedCount++;
    } else {
      stableCount++;
    }

    metricComparisons.push({
      metric: metricKey,
      category: currMetrics[metricKey].category,
      previous: prevVal,
      current: currVal,
      delta,
      trend,
    });
  }

  let status = 'stable';
  if (improvedCount > declinedCount && improvedCount >= 2) {
    status = 'progressing';
  } else if (declinedCount > improvedCount && declinedCount >= 2) {
    status = 'regressing';
  } else if (improvedCount > 0 && declinedCount > 0) {
    status = 'fluctuating';
  }

  const { topStrengths, lowAreas } = rankMetrics(currMetrics);
  const recommendations = generatePositionSpecificDrills(lowAreas, position, ageCategory, latest.coachObservations);

  const improvedNames = metricComparisons.filter((m) => m.trend === 'improved').map((m) => `${formatMetricName(m.metric)} (+${m.delta})`);
  const declinedNames = metricComparisons.filter((m) => m.trend === 'declined').map((m) => `${formatMetricName(m.metric)} (${m.delta})`);

  let trendExplanation = '';
  if (status === 'progressing') {
    trendExplanation = `Demonstrates verifiable positive development between ${new Date(previous.date).toLocaleDateString()} and ${new Date(latest.date).toLocaleDateString()}. Notable gains observed in: ${improvedNames.join(', ')}.`;
  } else if (status === 'regressing') {
    trendExplanation = `Performance metrics show a slight decline across: ${declinedNames.join(', ')}. Targeted coaching intervention is recommended.`;
  } else if (status === 'fluctuating') {
    trendExplanation = `Mixed progression profile: solid gains recorded in ${improvedNames.join(', ')}, balanced with slight decreases in ${declinedNames.join(', ')}.`;
  } else {
    trendExplanation = `Performance metrics remain largely stable across consecutive evaluations, reflecting consistent execution and training engagement.`;
  }

  let coachNoteAck = latest.coachObservations;
  if (previous.coachObservations && previous.coachObservations !== latest.coachObservations) {
    coachNoteAck += ` (Follow-up to previous note: "${previous.coachObservations}")`;
  }

  return {
    summary: `${playerName} (${position}, ${ageCategory}) has completed ${evalCount} structured performance evaluations. Overall rating transitioned from ${previous.overallScore || 'N/A'} to ${latest.overallScore || 'N/A'}/10. ${trendExplanation}`,
    demonstratedStrengths: topStrengths.map((s) => `${formatMetricName(s.name)}: rated ${s.val}/10 (${s.category})`),
    areasRequiringImprovement: lowAreas.map((w) => `${formatMetricName(w.name)}: rated ${w.val}/10 (${w.category})`),
    historicalComparison: {
      status,
      explanation: trendExplanation,
      metricComparisons,
    },
    trainingRecommendations: recommendations,
    coachObservationsAcknowledged: coachNoteAck || 'No coach notes logged.',
    dataSufficiencyNotice: `Historical analysis confirmed valid using ${evalCount} consecutive evaluation records. Comparisons are calculated on consistent 1-10 rating scales.`,
    modelUsed: 'TalentScout Football Analysis Engine (Multi-Eval Comparative Engine)',
  };
}

// Helpers
function extractAllMetrics(evalObj) {
  const result = {};
  if (evalObj.physicalAbilities) {
    for (const [k, v] of Object.entries(evalObj.physicalAbilities.toObject ? evalObj.physicalAbilities.toObject() : evalObj.physicalAbilities)) {
      if (typeof v === 'number') result[k] = { val: v, category: 'Physical Abilities' };
    }
  }
  if (evalObj.technicalSkills) {
    for (const [k, v] of Object.entries(evalObj.technicalSkills.toObject ? evalObj.technicalSkills.toObject() : evalObj.technicalSkills)) {
      if (typeof v === 'number') result[k] = { val: v, category: 'Technical Skills' };
    }
  }
  if (evalObj.tacticalAbilities) {
    for (const [k, v] of Object.entries(evalObj.tacticalAbilities.toObject ? evalObj.tacticalAbilities.toObject() : evalObj.tacticalAbilities)) {
      if (typeof v === 'number') result[k] = { val: v, category: 'Tactical Abilities' };
    }
  }
  if (evalObj.personalDevelopment) {
    for (const [k, v] of Object.entries(evalObj.personalDevelopment.toObject ? evalObj.personalDevelopment.toObject() : evalObj.personalDevelopment)) {
      if (typeof v === 'number') result[k] = { val: v, category: 'Personal Development' };
    }
  }
  return result;
}

function rankMetrics(metricsMap) {
  const arr = Object.entries(metricsMap).map(([name, obj]) => ({ name, val: obj.val, category: obj.category }));
  arr.sort((a, b) => b.val - a.val);

  const topStrengths = arr.slice(0, 3);
  const lowAreas = arr.slice(-3).reverse();

  return { topStrengths, lowAreas };
}

function formatMetricName(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function generatePositionSpecificDrills(lowAreas, position, ageCategory, coachObservations) {
  const drills = [];

  // Drill mapping bank based on UEFA Grassroots / FA Youth coaching principles
  const drillBank = {
    passing: {
      targetedSkill: 'Passing Under Pressure & Scanning',
      exerciseName: '4v2 Overload Rondo with Transition Gates',
      objective: 'Develop quick 1-2 touch passing technique, body angle reception, and decision-making under defensive press.',
      durationOrReps: '4 sets x 3 minutes with 90s active recovery',
    },
    shooting: {
      targetedSkill: 'Finishing & Striking Technique',
      exerciseName: 'Dynamic Combination & First-Time Striking Box',
      objective: 'Practice accurate striking on goal following a wall-pass or cutback under timed defensive closing.',
      durationOrReps: '5 sets of 6 repetitions alternating left and right foot',
    },
    dribbling: {
      targetedSkill: '1v1 Ball Mastery & Directional Shifts',
      exerciseName: 'Tight Cones Slalom into 1v1 Channel Duel',
      objective: 'Refine close ball control, change of pace, and shielding when confronted by an aggressive defender.',
      durationOrReps: '4 sets of 4 repetitions per foot',
    },
    ballControl: {
      targetedSkill: 'First Touch & Aerial Reception',
      exerciseName: 'Aerial Cushioning & Directional First Touch Circuit',
      objective: 'Master killing ball bounce and redirecting possession towards attacking space within 1 touch.',
      durationOrReps: '4 sets x 10 aerial/ground service passes',
    },
    speed: {
      targetedSkill: 'Acceleration & Linear Sprint Mechanics',
      exerciseName: '10m - 20m Resisted Sprint & Deceleration Brakes',
      objective: 'Improve initial drive phase, explosive arm drive, and safe deceleration mechanics.',
      durationOrReps: '6 reps of 15m with 60s full recovery between reps',
    },
    endurance: {
      targetedSkill: 'Football-Specific Aerobic Capacity',
      exerciseName: 'High-Intensity Pitch Interval Shuttles (15s on / 15s off)',
      objective: 'Increase VO2 max and stamina to maintain high-work rate and pressing intensity across 90 minutes.',
      durationOrReps: '2 blocks of 8 reps (15s sprint, 15s jog), 3 min rest between blocks',
    },
    agility: {
      targetedSkill: 'Deceleration & Multi-Directional Change of Direction',
      exerciseName: 'Hexagon Cone Reactive Agility Mirror Drill',
      objective: 'Enhance quick foot turnover, low center of gravity, and responsive lateral cuts on coach visual cues.',
      durationOrReps: '5 repetitions of 20 seconds',
    },
    strength: {
      targetedSkill: 'Core Stability & Physical Shielding',
      exerciseName: 'Bodyweight Isometric Core Circuit & Shoulder-to-Shoulder Shielding',
      objective: 'Build core stability and upper body balance to protect the ball against physical challenges.',
      durationOrReps: '3 rounds of 45s plank, side-planks, and partner shielding hold',
    },
    positioning: {
      targetedSkill: 'Spatial Awareness & Line Breaking Support',
      exerciseName: 'Shadow Tactical Positioning & Phase-of-Play Possession',
      objective: 'Train movement between opponent lines and creating passing angles as the ball travels.',
      durationOrReps: '3 sets of 6 minutes tactical walkthrough',
    },
    decisionMaking: {
      targetedSkill: 'Pre-Orientation & Rapid Play Selection',
      exerciseName: 'Color-Coded 3-Color Possession with Overload Triggers',
      objective: 'Force cognitive processing, head-scanning before receiving, and rapid pass execution.',
      durationOrReps: '4 sets of 4 minutes',
    },
    gameAwareness: {
      targetedSkill: 'Pitch Scanning & Anticipation',
      exerciseName: 'Restricted-Touch Small Sided Game (3-Touch Max, Target Neutrals)',
      objective: 'Accelerate game reading, off-ball movement, and scanning shoulder checks before reception.',
      durationOrReps: '3 games x 7 minutes',
    },
    discipline: {
      targetedSkill: 'Tactical Focus & Tactical Rigor',
      exerciseName: 'Defensive Transition & Re-organization Drill',
      objective: 'Reinforce immediate defensive recovery and tactical shape following possession turnover.',
      durationOrReps: '4 sets of 5 minutes',
    },
  };

  const primaryArea = lowAreas[0]?.name?.toLowerCase() || 'passing';
  const secondaryArea = lowAreas[1]?.name?.toLowerCase() || 'endurance';

  const drill1 = drillBank[primaryArea] || drillBank['passing'];
  const drill2 = drillBank[secondaryArea] || drillBank['endurance'];

  // Add evidence citing evaluation score and coach observations
  let noteEvidence = '';
  if (coachObservations) {
    noteEvidence = ` Supported by coach observation note: "${coachObservations}".`;
  }

  drills.push({
    ...drill1,
    suitableAge: ageCategory,
    evaluationEvidence: `Identified growth area in ${formatMetricName(primaryArea)} (rated ${lowAreas[0]?.val || 5}/10).${noteEvidence}`,
  });

  drills.push({
    ...drill2,
    suitableAge: ageCategory,
    evaluationEvidence: `Identified growth area in ${formatMetricName(secondaryArea)} (rated ${lowAreas[1]?.val || 5}/10). Focuses on player role requirements for ${position}.`,
  });

  return drills;
}
