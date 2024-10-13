const mongoose = require('mongoose');

// Workout Schema for storing user's lifts data
const WorkoutSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  lifts: {
    squats: { weight: Number, reps: Number, oneRepMax: Number },
    benchPress: { weight: Number, reps: Number, oneRepMax: Number },
    overheadPress: { weight: Number, reps: Number, oneRepMax: Number },
    deadlift: { weight: Number, reps: Number, oneRepMax: Number },
  },
  schedule: [
    {
      cycle: Number,
      week: Number,
      workouts: [
        {
          lift: String,
          warmup: [
            {
              weight: Number,
              reps: String,
              percentage: String,
            },
          ],
          workingSets: [
            {
              weight: Number,
              reps: String,
              percentage: String,
            },
          ],
        },
      ],
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});



module.exports = mongoose.model('Workout', WorkoutSchema);
