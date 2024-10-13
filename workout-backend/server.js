const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // Add Mongoose for MongoDB connection
const app = express();

app.use(cors());
app.use(express.json()); // Enable JSON body parsing

// MongoDB Atlas connection
const mongoURI = 'mongodb+srv://jarodwatersall:A1xbmVsB4h6Gdi5w@workoutbackend.x2t6f.mongodb.net/?retryWrites=true&w=majority&appName=WorkoutBackend'

;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  connectTimeoutMS: 30000, // Optional: increase timeout to 30 seconds
})
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import the auth route
const authRoute = require('./routes/auth');
app.use('/api', authRoute); // Register the route for /api/login

// Import the workouts route
const workoutsRoute = require('./routes/workouts');
app.use('/api/workouts', workoutsRoute); // Register the route for /api/workouts

// Start the server only after MongoDB is connected
const PORT = 5000;
mongoose.connection.once('open', () => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
