const mongoose = require('mongoose');

const WorkoutHistorySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  day: {
    type: String,
    required: true,
  },
  week: {
    type: Number,
    required: true,
  },
  completedSets: {
    type: Array,
    required: true,
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('WorkoutHistory', WorkoutHistorySchema);
