const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const userRoute = require("./routes/userRoute");

// Start Express
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(
  cors({
    origin: ["http://localhost:5001", "https://feedwise-dev-backend.up.railway.app"],
    credentials: true,
  })
);
// User Port
const PORT = process.env.PORT || 5001;

// Connecting to DB using mongoose
mongoose.connect(process.env.MONGO_URI, {

  }).then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
  }).catch(err => {
    console.error('Error connecting to MongoDB:', err.message);
});


app.use("/api/users", userRoute);
// Routes
app.get('/', (req, res) => {
    res.send('Testing!');
  });