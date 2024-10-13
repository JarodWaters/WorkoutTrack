import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

function StartingWeights({ userId, setOneRepMaxes }) {
  const [lifts, setLifts] = useState({
    squats: { weight: '', reps: '', oneRepMax: '', locked: false },
    benchPress: { weight: '', reps: '', oneRepMax: '', locked: false },
    overheadPress: { weight: '', reps: '', oneRepMax: '', locked: false },
    deadlift: { weight: '', reps: '', oneRepMax: '', locked: false },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/workouts/${userId}`);
        if (response.data && response.data.lifts) {
          const savedLifts = response.data.lifts;
          const updatedLifts = {};
          Object.keys(savedLifts).forEach((lift) => {
            updatedLifts[lift] = {
              ...savedLifts[lift],
              locked: true,
            };
          });
          setLifts(updatedLifts);
        }
      } catch (error) {
        console.error('Error fetching workout data:', error);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  const handleInputChange = (e, liftName) => {
    const { name, value } = e.target;
    setLifts({
      ...lifts,
      [liftName]: {
        ...lifts[liftName],
        [name]: value,
      },
    });
  };

  const calculateOneRepMax = (weight, reps) => {
    if (!weight || !reps) return '';
    return (weight * reps * 0.033333 + parseFloat(weight)).toFixed(2);
  };

  const handleCalculate = async (e, liftName) => {
    e.preventDefault();
    const weight = parseFloat(lifts[liftName].weight);
    const reps = parseFloat(lifts[liftName].reps);
    const oneRepMax = calculateOneRepMax(weight, reps);

    const updatedLifts = {
      ...lifts,
      [liftName]: {
        ...lifts[liftName],
        oneRepMax,
        locked: true,
      },
    };
    setLifts(updatedLifts);

    try {
      await axios.post('http://localhost:5000/api/workouts/save', {
        userId,
        lifts: updatedLifts,
      });
      console.log('Workout data saved successfully');
    } catch (error) {
      console.error('Error saving workout data', error);
    }

    setOneRepMaxes((prevMaxes) => ({
      ...prevMaxes,
      [liftName]: oneRepMax,
    }));
  };

  const handleUnlock = (liftName) => {
    setLifts((prevLifts) => ({
      ...prevLifts,
      [liftName]: {
        ...prevLifts[liftName],
        locked: false,
      },
    }));
  };

  const handleStartCycle = async () => {
    try {
      // Generate the full workout plan
      const fullWorkoutPlan = generateWorkoutPlan(lifts);
  
      // Log the data being sent
      console.log('Sending data to backend:', { userId, lifts, schedule: fullWorkoutPlan });
  
      // POST the full workout plan to the backend
      await axios.post('http://localhost:5000/api/workouts/startcycle', {
        userId,
        lifts,
        schedule: fullWorkoutPlan, // Ensure the workout plan is included
      });
  
      alert('Workout cycle started successfully!');
    } catch (error) {
      console.error('Error starting workout cycle:', error);
    }
  };  

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">5/3/1 Starting Weights</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.keys(lifts).map((lift) => (
          <div
            key={lift}
            className="bg-white shadow-lg rounded-lg p-6 border border-gray-200"
          >
            <h2 className="text-xl font-semibold capitalize mb-4 text-gray-800">
              {lift.replace(/([A-Z])/g, ' $1')}
            </h2>

            {lifts[lift].locked ? (
              <div>
                <p className="mb-2 text-gray-700">Weight: <span className="font-semibold">{lifts[lift].weight} lbs</span></p>
                <p className="mb-2 text-gray-700">Reps: <span className="font-semibold">{lifts[lift].reps}</span></p>
                <p className="mb-2 text-gray-700">1 Rep Max: <span className="font-semibold">{lifts[lift].oneRepMax} lbs</span></p>
                <button
                  onClick={() => handleUnlock(lift)}
                  className="mt-4 p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded w-full"
                >
                  Update
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => handleCalculate(e, lift)} className="flex flex-col space-y-4">
                <input
                  type="number"
                  name="weight"
                  placeholder="Weight (lbs)"
                  value={lifts[lift].weight}
                  onChange={(e) => handleInputChange(e, lift)}
                  className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  name="reps"
                  placeholder="Reps"
                  value={lifts[lift].reps}
                  onChange={(e) => handleInputChange(e, lift)}
                  className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  Calculate
                </button>
              </form>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={handleStartCycle}
        className="mt-6 p-3 bg-green-500 text-white rounded w-full"
      >
        Start 16-Week Cycle
      </button>
    </div>
  );
}

export default StartingWeights;
