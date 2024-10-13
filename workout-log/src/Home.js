import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PlateCalculator from './PlateCalculator'; // Import the Plate Calculator component

function Home({ userId, isDarkMode }) {
  const [currentDay, setCurrentDay] = useState(0); // Track the current day of the week
  const [currentWeek, setCurrentWeek] = useState(0); // Track the current week
  const [workoutPlan, setWorkoutPlan] = useState(null); // Store the fetched workout plan
  const [currentSet, setCurrentSet] = useState(0); // Track the current set
  const [started, setStarted] = useState(false); // Track if workout is started
  const [completedSets, setCompletedSets] = useState([]); // Track completed sets
  const [showPreview, setShowPreview] = useState(true); // Toggle preview visibility

  const daysOfWeek = ['Monday', 'Tuesday', 'Thursday', 'Friday'];

  // Fetch the workout plan when the component mounts
  useEffect(() => {
    const fetchWorkoutPlan = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/workouts/${userId}`);
        if (response.data && response.data.schedule) {
          setWorkoutPlan(response.data.schedule);
        } else {
          console.error('Workout plan not found');
        }
      } catch (error) {
        console.error('Error fetching workout plan:', error);
      }
    };

    if (userId) {
      fetchWorkoutPlan();
    }
  }, [userId]);

  // Start the workout
  const startWorkout = () => {
    setStarted(true);
    setCurrentSet(0); // Start from the first set
  };

  // Complete a set
  const handleCompleteSet = () => {
    const currentWorkout = workoutPlan[currentWeek]?.workouts[currentDay];
    const totalSets = [...currentWorkout.warmup, ...currentWorkout.workingSets]; // Include both warmup and working sets

    if (currentWorkout && currentSet < totalSets.length) {
      setCompletedSets([...completedSets, totalSets[currentSet]]);
      setCurrentSet(currentSet + 1);
    } else {
      console.log('Workout complete');
      saveWorkoutHistory();
    }
  };

  // Save workout history to the database
  const saveWorkoutHistory = async () => {
    try {
      const workoutHistory = {
        userId,
        day: daysOfWeek[currentDay],
        week: currentWeek + 1,
        completedSets,
      };

      // Log the completed workout to MongoDB
      await axios.post('http://localhost:5000/api/workouts/history', workoutHistory);
      alert('Workout history saved successfully!');
    } catch (error) {
      console.error('Error saving workout history:', error);
    }
  };

  const currentWorkout = workoutPlan && workoutPlan[currentWeek]?.workouts[currentDay];
  const totalSets = currentWorkout ? [...currentWorkout.warmup, ...currentWorkout.workingSets] : [];

  return (
    <div className={`${isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-900'} min-h-screen p-4`}>
      <h1 className="text-3xl font-bold text-center mb-6">
        Today's Workout: {daysOfWeek[currentDay]}
      </h1>

      {/* Toggle Workout Preview */}
      <button
        onClick={() => setShowPreview(!showPreview)}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
      >
        {showPreview ? 'Hide' : 'Show'} Workout Preview
      </button>

      {/* Collapsible workout preview */}
      {showPreview && currentWorkout && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Workout Preview</h2>
          <h3 className="text-lg mb-2">Warm-up Sets</h3>
          {currentWorkout.warmup.map((set, index) => (
            <div
              key={index}
              className={`mb-4 p-4 ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-900'} shadow-md rounded-lg border ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}
            >
              <p>
                {set.percentage} of training max: <span className="font-semibold">{set.weight} lbs</span> for {set.reps} reps
              </p>
            </div>
          ))}

          <h3 className="text-lg mb-2">Working Sets</h3>
          {currentWorkout.workingSets.map((set, index) => (
            <div
              key={index}
              className={`mb-4 p-4 ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-900'} shadow-md rounded-lg border ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}
            >
              <p>
                {set.percentage} of training max: <span className="font-semibold">{set.weight} lbs</span> for {set.reps} reps
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Start Workout or Continue the Workout */}
      {!started ? (
        <button
          onClick={startWorkout}
          className="bg-green-500 px-4 py-2 rounded text-lg font-semibold"
        >
          Start Workout
        </button>
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-4">Set #{currentSet + 1}</h2>
          {totalSets[currentSet] && (
            <div className="mb-6">
              <p>
                Weight: {totalSets[currentSet].weight} lbs | Reps: {totalSets[currentSet].reps}
              </p>
              
              {/* Plate Calculator */}
              <PlateCalculator targetWeight={totalSets[currentSet].weight} />
            </div>
          )}

          {/* Complete Set Button */}
          <button
            onClick={handleCompleteSet}
            className="bg-blue-600 px-4 py-2 rounded text-lg font-semibold"
          >
            Complete Set
          </button>

          {/* Display the progress bar */}
          <div className="w-full mt-8">
            <div className="w-full bg-gray-600 h-4 rounded">
              <div
                className="bg-green-500 h-4 rounded"
                style={{ width: `${(currentSet / totalSets.length) * 100}%` }}
              ></div>
            </div>
            <p className="text-center mt-2">{Math.round((currentSet / totalSets.length) * 100)}% Complete</p>
          </div>
        </>
      )}

      {/* Navigation for Days */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => setCurrentDay((prev) => (prev - 1 + daysOfWeek.length) % daysOfWeek.length)}
          className={`p-2 rounded-lg font-semibold ${isDarkMode ? 'bg-neon-green-500 text-black' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
        >
          Previous Day
        </button>
        <button
          onClick={() => setCurrentDay((prev) => (prev + 1) % daysOfWeek.length)}
          className={`p-2 rounded-lg font-semibold ${isDarkMode ? 'bg-neon-green-500 text-black' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          Next Day
        </button>
      </div>
    </div>
  );
}

export default Home;
