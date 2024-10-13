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
            warmup,   // Include warmup sets
            workingSets, // Include working sets
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
  