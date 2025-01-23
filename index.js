const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');



const app = express();
app.use(bodyParser.json()); //
const cors = require('cors');
app.use(cors());


mongoose.connect('mongodb+srv://owenmuldoon86:Owen8601@cluster0.pkib7.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const playerSchema = new mongoose.Schema({
  browserId: String,
  name: String,
  score: { type: Number, default: 0 },
});

const Player = mongoose.model('Player', playerSchema);

app.post('/scan', async (req, res) => {
  const { browserId, name } = req.body;

  let player = await Player.findOne({ browserId });

  if (!player) {
    // First-time scan, register the player
    player = new Player({ browserId, name });
    await player.save();
    console.log('Player added:', player);
    res.json({ message: 'Player registered!', player });
  } else {
    // Existing player, update score
    player.score += 1;
    console.log('Score updated for player:', player);
    await player.save();
    res.json({ message: 'Score updated!', player });
  }
});

app.get('/leaderboard', async (req, res) => {
  const leaderboard = await Player.find().sort({ score: -1 });
  res.json(leaderboard);
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
