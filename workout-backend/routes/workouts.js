const express = require('express');
const router = express.Router();
const Workout = require('../models/Workout');
const WorkoutHistory = require('../models/WorkoutHistory.js');

// POST route to save workout data
router.post('/save', async (req, res) => {
  const { userId, lifts, accessories } = req.body;

  try {
    let workout = await Workout.findOne({ userId });

    if (workout) {
      workout.lifts = lifts;
      workout.accessories = accessories;
      await workout.save();
      return res.status(200).json(workout);
    } else {
      workout = new Workout({ userId, lifts, accessories });
      await workout.save();
      return res.status(201).json(workout);
    }
  } catch (error) {
    console.error('Error saving workout data:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET route to fetch workout data for a specific user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const workout = await Workout.findOne({ userId: String(userId) });

    if (workout) {
      return res.status(200).json(workout);
    } else {
      return res.status(404).json({ message: 'Workout data not found' });
    }
  } catch (error) {
    console.error('Error fetching workout data:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to generate the full 16-week workout plan, including accessories
const generateWorkoutPlan = (lifts, accessories) => {
  if (!lifts || !accessories) {
    throw new Error('Missing required lift data in lifts or accessories object.');
  }

  const weeks = [
    [{ percentage: 0.65, reps: 5 }, { percentage: 0.75, reps: 5 }, { percentage: 0.85, reps: '5+' }],
    [{ percentage: 0.7, reps: 3 }, { percentage: 0.8, reps: 3 }, { percentage: 0.9, reps: '3+' }],
    [{ percentage: 0.75, reps: 5 }, { percentage: 0.85, reps: 3 }, { percentage: 0.95, reps: '1+' }],
    [{ percentage: 0.4, reps: 5 }, { percentage: 0.5, reps: 5 }, { percentage: 0.6, reps: 5 }],
  ];

  const warmupSets = [
    { percentage: 0.4, reps: 5 },
    { percentage: 0.5, reps: 5 },
    { percentage: 0.6, reps: 3 },
  ];

  const accessoriesPlan = {
    benchPress: ['overheadPress', 'rows', 'curls'],
    squats: ['deadliftAcc', 'dips', 'chinups'], // Save accessory deadlift as deadliftAcc
    deadlift: ['squatsAcc', 'machinePress', 'latPushdown'], // Save accessory squat as squatsAcc
    overheadPress: ['benchPressAcc', 'curls', 'tricepsPushdowns'], // Save accessory benchPress as benchPressAcc
  };

  const liftsArray = ['squats', 'benchPress', 'deadlift', 'overheadPress'];

  const fullPlan = [];

  // Calculate training max for main lifts (90% of one-rep max)
  let trainingMaxes = {
    squats: lifts.squats.oneRepMax * 0.9,
    benchPress: lifts.benchPress.oneRepMax * 0.9,
    deadlift: lifts.deadlift.oneRepMax * 0.9,
    overheadPress: lifts.overheadPress.oneRepMax * 0.9,
  };

  // Calculate training max for accessory lifts (90% of one-rep max)
  let accessoryMaxes = {
    curls: accessories.curls.oneRepMax * 0.9,
    rows: accessories.rows.oneRepMax * 0.9,
    dips: accessories.dips.oneRepMax * 0.9,
    chinups: accessories.chinups.oneRepMax * 0.9,
    machinePress: accessories.machinePress.oneRepMax * 0.9,
    latPushdown: accessories.latPushdown.oneRepMax * 0.9,
    tricepsPushdowns: accessories.tricepsPushdowns.oneRepMax * 0.9,
    // Accessory versions of main lifts
    deadliftAcc: accessories.deadliftAcc ? accessories.deadliftAcc.oneRepMax * 0.9 : trainingMaxes.deadlift,
    squatsAcc: accessories.squatsAcc ? accessories.squatsAcc.oneRepMax * 0.9 : trainingMaxes.squats,
    benchPressAcc: accessories.benchPressAcc ? accessories.benchPressAcc.oneRepMax * 0.9 : trainingMaxes.benchPress,
    overheadPressAcc: accessories.overheadPressAcc ? accessories.overheadPressAcc.oneRepMax * 0.9 : trainingMaxes.overheadPress,

  };

  const validateWeight = (weight) => (!isNaN(weight) && weight > 0 ? Math.round(weight) : 0);

  // Loop through 4 cycles (16 weeks total)
  for (let cycle = 0; cycle < 4; cycle++) {
    for (let weekIndex = 0; weekIndex < weeks.length; weekIndex++) {
      const weekPlan = [];

      // Loop through each lift (4 days per week)
      liftsArray.forEach((lift) => {
        // Warm-up sets
        const warmup = warmupSets.map((set) => ({
          weight: validateWeight(trainingMaxes[lift] * set.percentage),
          reps: set.reps,
          percentage: `${Math.round(set.percentage * 100)}%`,
        }));

        // Working sets for the current week
        const workingSets = weeks[weekIndex].map((set) => ({
          weight: validateWeight(trainingMaxes[lift] * set.percentage),
          reps: set.reps,
          percentage: `${Math.round(set.percentage * 100)}%`,
        }));

        // Accessory sets
        const accessories = accessoriesPlan[lift].map((accessory) => ({
          accessory,
          sets: [
            { weight: validateWeight(accessoryMaxes[accessory] * 0.4), reps: 12 },
            { weight: validateWeight(accessoryMaxes[accessory] * 0.5), reps: 10 },
            { weight: validateWeight(accessoryMaxes[accessory] * 0.6), reps: 8 },
          ],
        }));

        weekPlan.push({
          lift,
          warmup,
          workingSets,
          accessories,
        });
      });

      fullPlan.push({
        cycle: cycle + 1,
        week: weekIndex + 1,
        workouts: weekPlan,
      });
    }

    // After each cycle, increase the training max for both main lifts and accessories
    trainingMaxes.squats += 10;
    trainingMaxes.deadlift += 10;
    trainingMaxes.benchPress += 5;
    trainingMaxes.overheadPress += 5;

    // Increase training max for accessory lifts by 5 pounds each cycle
    accessoryMaxes.curls += 5;
    accessoryMaxes.rows += 5;
    accessoryMaxes.dips += 5;
    accessoryMaxes.chinups += 5;
    accessoryMaxes.machinePress += 5;
    accessoryMaxes.latPushdown += 5;
    accessoryMaxes.tricepsPushdowns += 5;

    // Increase accessory training maxes for main lifts
    accessoryMaxes.deadliftAcc += 5;
    accessoryMaxes.squatsAcc += 5;
    accessoryMaxes.benchPressAcc += 5;
    accessoryMaxes.overheadPressAcc += 5;
  }

  return fullPlan;
};



// POST route to start a 16-week cycle
// POST route to start a 16-week cycle
router.post('/startcycle', async (req, res) => {
  const { userId, lifts, accessories } = req.body;

  try {
    const schedule = generateWorkoutPlan(lifts, accessories); // Pass accessories too

    let workout = await Workout.findOne({ userId });

    if (workout) {
      workout.lifts = lifts;
      workout.accessories = accessories; // Save the accessories as well
      workout.schedule = schedule;

      await workout.save();
      return res.status(200).json(workout);
    } else {
      workout = new Workout({ userId, lifts, accessories, schedule });

      await workout.save();
      return res.status(201).json(workout);
    }
  } catch (error) {
    console.error('Error in startcycle route:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});


// POST route to save workout history
router.post('/history', async (req, res) => {
  const { userId, day, week, completedSets } = req.body;

  try {
    const workoutHistory = new WorkoutHistory({
      userId,
      day,
      week,
      completedSets,
      completedAt: new Date(),
    });

    await workoutHistory.save();
    res.status(201).json({ message: 'Workout history saved successfully!' });
  } catch (error) {
    console.error('Error saving workout history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
