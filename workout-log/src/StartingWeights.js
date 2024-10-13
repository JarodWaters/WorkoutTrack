import React, { useState, useEffect } from 'react';
import axios from 'axios';

function StartingWeights({ userId, setOneRepMaxes }) {
  const [lifts, setLifts] = useState({
    squats: { weight: '', reps: '', oneRepMax: '', locked: false },
    benchPress: { weight: '', reps: '', oneRepMax: '', locked: false },
    overheadPress: { weight: '', reps: '', oneRepMax: '', locked: false },
    deadlift: { weight: '', reps: '', oneRepMax: '', locked: false },
  });

  const [accessories, setAccessories] = useState({
    rows: { weight: '', reps: '', oneRepMax: '', locked: false },
    curls: { weight: '', reps: '', oneRepMax: '', locked: false },
    dips: { weight: '', reps: '', oneRepMax: '', locked: false },
    chinups: { weight: '', reps: '', oneRepMax: '', locked: false },
    machinePress: { weight: '', reps: '', oneRepMax: '', locked: false },
    latPushdown: { weight: '', reps: '', oneRepMax: '', locked: false },
    tricepsPushdowns: { weight: '', reps: '', oneRepMax: '', locked: false },
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

        if (response.data && response.data.accessories) {
          setAccessories(response.data.accessories);
        }
      } catch (error) {
        console.error('Error fetching workout data:', error);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  const handleInputChange = (e, isAccessory, lift, accessory) => {
    const { name, value } = e.target;
    const processedValue = value === null ? '' : value;

    if (isAccessory) {
      setAccessories({
        ...accessories,
        [accessory]: {
          ...accessories[accessory],
          [name]: processedValue,
        },
      });
    } else {
      setLifts({
        ...lifts,
        [lift]: {
          ...lifts[lift],
          [name]: processedValue,
        },
      });
    }
  };

  const calculateOneRepMax = (weight, reps) => {
    if (!weight || !reps) return '';
    return (weight * reps * 0.033333 + parseFloat(weight)).toFixed(2);
  };

  const handleCalculate = async (e, isAccessory, lift, accessory) => {
    e.preventDefault();
  
    let weight, reps;
  
    if (isAccessory) {
      weight = parseFloat(accessories[accessory].weight);
      reps = parseFloat(accessories[accessory].reps);
    } else {
      weight = parseFloat(lifts[lift].weight);
      reps = parseFloat(lifts[lift].reps);
    }
  
    const oneRepMax = calculateOneRepMax(weight, reps);
  
    if (isAccessory) {
      const updatedAccessories = {
        ...accessories,
        [accessory]: {
          ...accessories[accessory],
          oneRepMax,
          locked: true,
        },
      };
      setAccessories(updatedAccessories);
  
      try {
        await axios.post('http://localhost:5000/api/workouts/save', {
          userId,
          lifts,
          accessories: updatedAccessories,
        });
        console.log('Accessory data saved successfully');
      } catch (error) {
        console.error('Error saving accessory data', error);
      }
    } else {
      const updatedLifts = {
        ...lifts,
        [lift]: {
          ...lifts[lift],
          oneRepMax,
          locked: true,
        },
      };
      
      // Automatically save the accessory version for the main lifts
      const updatedAccessories = {
        ...accessories,
        [`${lift}Acc`]: {
          weight: lifts[lift].weight,
          reps: lifts[lift].reps,
          oneRepMax, // same one rep max for accessory
          locked: true,
        },
      };
  
      setLifts(updatedLifts);
      setAccessories(updatedAccessories);
  
      try {
        await axios.post('http://localhost:5000/api/workouts/save', {
          userId,
          lifts: updatedLifts,
          accessories: updatedAccessories,
        });
        console.log('Workout data saved successfully');
      } catch (error) {
        console.error('Error saving workout data', error);
      }
    }
  };
  

  const handleUnlock = (isAccessory, lift, accessory) => {
    if (isAccessory) {
      setAccessories({
        ...accessories,
        [accessory]: {
          ...accessories[accessory],
          locked: false,
        },
      });
    } else {
      setLifts({
        ...lifts,
        [lift]: {
          ...lifts[lift],
          locked: false,
        },
      });
    }
  };

  // Handle starting the 16-week cycle
  const handleStartCycle = async () => {
    try {
      await axios.post('http://localhost:5000/api/workouts/startcycle', {
        userId,
        lifts,
        accessories,
      });
      alert('16-week cycle started successfully!');
    } catch (error) {
      console.error('Error starting 16-week cycle', error);
    }
  };

  // Exclude main lifts from the accessory display
  const accessoryLiftsToShow = Object.keys(accessories).filter(
    (accessory) => !['deadliftAcc', 'squatsAcc', 'benchPressAcc', 'overheadPressAcc'].includes(accessory)
  );

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">5/3/1 Starting Weights</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Main Lifts */}
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
                  onClick={() => handleUnlock(false, lift)}
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
                  value={lifts[lift].weight || ''}
                  onChange={(e) => handleInputChange(e, false, lift)}
                  className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  name="reps"
                  placeholder="Reps"
                  value={lifts[lift].reps || ''}
                  onChange={(e) => handleInputChange(e, false, lift)}
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

        {/* Accessory Lifts */}
        {accessoryLiftsToShow.map((accessoryLift) => (
          <div
            key={accessoryLift}
            className="bg-white shadow-lg rounded-lg p-6 border border-gray-200 mb-6"
          >
            <h3 className="text-xl font-semibold capitalize mb-4 text-gray-800">
              {accessoryLift.replace(/([A-Z])/g, ' $1')}
            </h3>

            {accessories[accessoryLift].locked ? (
              <div>
                <p className="mb-2 text-gray-700">Weight: <span className="font-semibold">{accessories[accessoryLift].weight} lbs</span></p>
                <p className="mb-2 text-gray-700">Reps: <span className="font-semibold">{accessories[accessoryLift].reps}</span></p>
                <p className="mb-2 text-gray-700">1 Rep Max: <span className="font-semibold">{accessories[accessoryLift].oneRepMax} lbs</span></p>
                <button
                  onClick={() => handleUnlock(true, '', accessoryLift)}
                  className="mt-4 p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded w-full"
                >
                  Update
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => handleCalculate(e, true, '', accessoryLift)} className="flex flex-col space-y-4">
                <input
                  type="number"
                  name="weight"
                  placeholder="Weight (lbs)"
                  value={accessories[accessoryLift].weight || ''}
                  onChange={(e) => handleInputChange(e, true, '', accessoryLift)}
                  className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  name="reps"
                  placeholder="Reps"
                  value={accessories[accessoryLift].reps || ''}
                  onChange={(e) => handleInputChange(e, true, '', accessoryLift)}
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

      {/* Start 16-Week Cycle Button */}
      <div className="text-center mt-8">
        <button
          onClick={handleStartCycle}
          className="p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xl font-semibold"
        >
          Start 16 Week Cycle
        </button>
      </div>
    </div>
  );
}

export default StartingWeights;
