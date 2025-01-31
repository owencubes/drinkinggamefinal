const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb+srv://owenmuldoon86:Owen8601@cluster0.pkib7.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

const playerSchema = new mongoose.Schema({
  browserId: { type: String, unique: true },
  name: String,
  score: { type: Number, default: 0 },
});

const Player = mongoose.model('Player', playerSchema);

app.post('/scan', async (req, res) => {
  const { browserId, name } = req.body;

  if (!browserId || !name) {
    return res.status(400).json({ error: 'Missing browserId or name' });
  }

  let player = await Player.findOne({ browserId });

  if (!player) {
    // New player, save to database
    player = new Player({ browserId, name });
    await player.save();
    console.log('Player registered:', player);
    return res.json({ message: 'Player registered!', player });
  }

  // If name is different, update it
  if (player.name !== name) {
    player.name = name;
  }

  // Increment score
  player.score += 1;
  await player.save();
  console.log('Score updated for player:', player);
  res.json({ message: 'Score updated!', player });
});

app.get('/leaderboard', async (req, res) => {
  const leaderboard = await Player.find().sort({ score: -1 });
  res.json(leaderboard);
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
