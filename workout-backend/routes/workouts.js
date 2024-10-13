const express = require('express');
const router = express.Router();
const Workout = require('../models/Workout'); // Assuming you have a Workout model
const WorkoutHistory = require('../models/WorkoutHistory.js'); // Assuming you create a WorkoutHistory model


// POST route to save workout data
router.post('/save', async (req, res) => {
  const { userId, lifts } = req.body;

  try {
    // Check if the user already has a workout record
    let workout = await Workout.findOne({ userId });

    if (workout) {
      // Update existing workout
      workout.lifts = lifts;
      await workout.save();
      return res.status(200).json(workout);
    } else {
      // Create a new workout if none exists
      workout = new Workout({ userId, lifts });
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
// Helper function to generate the full 16-week workout plan
const generateWorkoutPlan = (lifts) => {
  const weeks = [
    // Week 1: 65%, 75%, 85% for 5 reps
    [
      { percentage: 0.65, reps: 5 },
      { percentage: 0.75, reps: 5 },
      { percentage: 0.85, reps: '5+' }, // AMRAP (As Many Reps As Possible)
    ],
    // Week 2: 70%, 80%, 90% for 3 reps
    [
      { percentage: 0.7, reps: 3 },
      { percentage: 0.8, reps: 3 },
      { percentage: 0.9, reps: '3+' },
    ],
    // Week 3: 75%, 85%, 95% for 1 rep
    [
      { percentage: 0.75, reps: 5 },
      { percentage: 0.85, reps: 3 },
      { percentage: 0.95, reps: '1+' },
    ],
    // Week 4: Deload (40%, 50%, 60%)
    [
      { percentage: 0.4, reps: 5 },
      { percentage: 0.5, reps: 5 },
      { percentage: 0.6, reps: 5 },
    ],
  ];

  const warmupSets = [
    { percentage: 0.4, reps: 5 },
    { percentage: 0.5, reps: 5 },
    { percentage: 0.6, reps: 3 },
  ];

  const liftsArray = ['squats', 'benchPress', 'deadlift', 'overheadPress'];

  const fullPlan = [];

  let trainingMaxes = {
    squats: lifts.squats.oneRepMax * 0.9,
    benchPress: lifts.benchPress.oneRepMax * 0.9,
    deadlift: lifts.deadlift.oneRepMax * 0.9,
    overheadPress: lifts.overheadPress.oneRepMax * 0.9,
  };

  // Loop through 4 cycles (16 weeks total)
  for (let cycle = 0; cycle < 4; cycle++) {
    for (let weekIndex = 0; weekIndex < weeks.length; weekIndex++) {
      const weekPlan = [];

      // Loop through each lift (4 days per week)
      liftsArray.forEach((lift) => {
        // Warm-up sets (same for every week)
        const warmup = warmupSets.map((set) => ({
          weight: Math.round(trainingMaxes[lift] * set.percentage),
          reps: set.reps,
          percentage: `${Math.round(set.percentage * 100)}%`,
        }));

        // Working sets for the current week
        const workingSets = weeks[weekIndex].map((set) => ({
          weight: Math.round(trainingMaxes[lift] * set.percentage),
          reps: set.reps,
          percentage: `${Math.round(set.percentage * 100)}%`,
        }));

        weekPlan.push({
          lift,
          warmup,
          workingSets,
        });
      });

      fullPlan.push({
        cycle: cycle + 1,
        week: weekIndex + 1,
        workouts: weekPlan,
      });
    }

    // After each cycle, increase the training max
    trainingMaxes.squats += 10; // Increase by 10 lbs
    trainingMaxes.deadlift += 10; // Increase by 10 lbs
    trainingMaxes.benchPress += 5; // Increase by 5 lbs
    trainingMaxes.overheadPress += 5; // Increase by 5 lbs
  }

  return fullPlan;
};

router.post('/startcycle', async (req, res) => {
  const { userId, lifts, schedule } = req.body;

  try {
    // Log the incoming data
    console.log('Data received:', { userId, lifts, schedule });

    // Check if the workout already exists for this user
    let workout = await Workout.findOne({ userId });

    if (workout) {
      // Update existing workout plan
      workout.lifts = lifts;
      workout.schedule = schedule; // Save the full 16-week workout schedule

      // Save the updated workout and use async/await
      const updatedWorkout = await workout.save();
      console.log('Workout updated:', updatedWorkout);
      return res.status(200).json(updatedWorkout);
    } else {
      // Create a new workout if none exists
      workout = new Workout({ userId, lifts, schedule });

      // Save the new workout and use async/await
      const newWorkout = await workout.save();
      console.log('New workout saved:', newWorkout);
      return res.status(201).json(newWorkout);
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
    // Create a new workout history entry
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
