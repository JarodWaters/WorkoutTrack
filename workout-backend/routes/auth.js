const express = require('express');
const router = express.Router();

// Hardcoded users for demo purposes
const users = [
  { userId: '1', username: 'user1', password: 'password1' },
  { userId: '2', username: 'user2', password: 'password2' },
];

// POST route for login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Find user by username and password
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    res.json({ userId: user.userId });
  } else {
    res.status(401).json({ message: 'Invalid username or password' });
  }
});

module.exports = router;
