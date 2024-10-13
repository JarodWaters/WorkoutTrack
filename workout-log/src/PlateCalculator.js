import React, { useState, useEffect } from 'react';

// Plate weights in lbs
const plateSizes = [45, 35, 25, 10, 5, 2.5];

// Function to calculate how many plates are needed on each side of the barbell
const calculatePlates = (weight) => {
  const barWeight = 45; // Standard barbell weight
  const weightPerSide = (weight - barWeight) / 2; // Split weight equally between two sides
  let remainingWeight = weightPerSide;
  const plates = [];

  // Calculate plates required, starting from the largest plate
  plateSizes.forEach((plate) => {
    const plateCount = Math.floor(remainingWeight / plate);
    if (plateCount > 0) {
      plates.push({ plateSize: plate, count: plateCount });
      remainingWeight -= plateCount * plate;
    }
  });

  return plates;
};

function PlateCalculator({ targetWeight }) {
  const [plates, setPlates] = useState([]);

  useEffect(() => {
    const roundedWeight = Math.round(targetWeight / 5) * 5; // Round to nearest 5 lbs
    setPlates(calculatePlates(roundedWeight));
  }, [targetWeight]);

  return (
    <div className="flex flex-col items-center text-white">
      {/* Total Weight Display */}
      <h1 className="text-5xl font-bold mb-4">{targetWeight} LBS</h1>

      {/* Barbell and plates visual */}
      <div className="flex items-center justify-center mb-4">
        {/* Left side of barbell (plates stacked with biggest closest to the bar) */}
        <div className="flex items-center justify-center flex-row-reverse">
          {plates.map((plate, index) => (
            <div key={index} className="flex mx-1">
              {Array(plate.count)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="bg-blue-500 relative"
                    style={{
                      width: '8px', // Thin cylinder
                      height: `${plate.plateSize}px`, // Height corresponds to plate size
                      margin: '2px',
                    }}
                  />
                ))}
            </div>
          ))}
        </div>

        {/* Barbell itself */}
        <div className="h-4 w-32 bg-gray-500 rounded-full"></div> {/* Barbell */}

        {/* Right side of barbell (plates stacked with biggest closest to the bar) */}
        <div className="flex items-center justify-center">
          {plates.map((plate, index) => (
            <div key={index} className="flex mx-1">
              {Array(plate.count)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="bg-blue-500 relative"
                    style={{
                      width: '8px', // Thin cylinder
                      height: `${plate.plateSize}px`, // Height corresponds to plate size
                      margin: '2px',
                    }}
                  />
                ))}
            </div>
          ))}
        </div>
      </div>

      {/* Plate Count Display */}
      <div className="flex justify-center items-center mt-4 space-x-4">
        {plates.map((plate, index) => (
          <div key={index} className="text-center">
            <div
              className="w-12 h-12 flex items-center justify-center rounded-lg border border-white"
              style={{
                borderWidth: '2px',
                borderColor: 'cyan',
              }}
            >
              {plate.plateSize}
            </div>
            <p className="mt-2 text-sm font-semibold">{plate.count}x</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PlateCalculator;
