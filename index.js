// Import required modules
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const client = require("./config/mongoDb");

// express app initialization
const app = express();
app.use(cors());
dotenv.config();
app.use(express.json());

// Import Routes
const authRoutes = require("./routes/authRoute");
const tripRoutes = require("./routes/tripRoutes");
const bookingRoute = require("./routes/bookingRoute");

// application routes
const run = async () => {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    app.get("/", (req, res) => {
      res.send("Hey, Welcome To API 🎉");
    });
    app.use("/users", authRoutes);
    app.use("/trips", tripRoutes);
    app.use("/booking", bookingRoute);
  } catch (err) {
    console.log(err);
  }
};

run().catch(console.dir);

// Start the server
const port = process.env.PORT || 8000;
app.listen(port, () =>
  console.log(`Server started on http://localhost:${port}/`)
);
