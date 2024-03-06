const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const userRoute = require("./routes/userRoute");
const cattleRoute = require("./routes/cattleRoute");
const feedInventoryRoute = require("./routes/feedInventoryRoute");
const feedNotificationsRoute = require("./routes/feedNotificationsRoute");
const scheduledTask = require('./utils/feedDeductionScheduler');
const WebSocket = require('ws');

// Start Express
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(
  cors({
    origin: ["http://localhost:5001", "https://feedwise-dev-backend.up.railway.app", "https://dev--feedwiseapp.netlify.app"],
    credentials: true,
  })
);

// User Port
const PORT = process.env.PORT || 5001;

// Connecting to DB using mongoose
mongoose.connect(process.env.MONGO_URI, {

  }).then(() => {
        console.log(`Server is running on port ${PORT}`);
  }).catch(err => {
    console.error('Error connecting to MongoDB:', err.message);
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Create WebSocket server
const wss = new WebSocket.Server({ noServer: true });

// Upgrade HTTP server to support WebSocket
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');

  // Handle WebSocket events (e.g., messages, disconnects) here
});

app.use("/api/users", userRoute);
app.use("/api/cattle", cattleRoute);
app.use("/api/feedInventory", feedInventoryRoute);
app.use("/api/notifications", feedNotificationsRoute);
// Routes
app.get('/', (req, res) => {
    res.send('Testing!');
  });