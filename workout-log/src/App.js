import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import Workout from './Workout'; // Import the Workout component
import StartingWeights from './StartingWeights';
import Login from './Login';
import Header from './Header';

function App() {
  const [userId, setUserId] = useState(null);  // To store userId after login
  const [oneRepMaxes, setOneRepMaxes] = useState({
    squats: 0,
    benchPress: 0,
    overheadPress: 0,
    deadlift: 0,
  });

  const [dailyData, setDailyData] = useState([{}, {}, {}, {}]); // To store data for Monday, Tuesday, Thursday, and Friday
  const [isDarkMode, setIsDarkMode] = useState(false); // Track dark mode state

  // Dark mode toggle function
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('isDarkMode', !isDarkMode); // Save dark mode preference in localStorage
  };

  // Load dark mode preference from localStorage
  useEffect(() => {
    const storedMode = localStorage.getItem('isDarkMode') === 'true';
    setIsDarkMode(storedMode);
  }, []);

  return (
    <Router>
      {/* Apply dark mode globally based on isDarkMode state */}
      <div className={`${isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-900'} min-h-screen`}>
        {/* Pass dark mode state and toggle function to the Header */}
        {userId && <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />}

        <Routes>
          {/* Conditionally render login or the main routes */}
          {!userId ? (
            <Route path="*" element={<Login setUserId={setUserId} />} />
          ) : (
            <>
              <Route
                path="/"
                element={
                  <Home
                    oneRepMaxes={oneRepMaxes}
                    setOneRepMaxes={setOneRepMaxes} // Pass this function
                    dailyData={dailyData}
                    setDailyData={setDailyData}
                    userId={userId} // Make sure userId is passed here
                    isDarkMode={isDarkMode} // Pass dark mode state to Home
                  />
                }
              />
              <Route
                path="/startingweights"
                element={
                  <StartingWeights
                    setOneRepMaxes={setOneRepMaxes}
                    userId={userId}
                    isDarkMode={isDarkMode} // Pass dark mode state to StartingWeights
                  />
                }
              />
              <Route
                path="/workout"
                element={<Workout />} // Add the Workout route
              />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
