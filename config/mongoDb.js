const { MongoClient } = require("mongodb");
require("dotenv").config();

// connect to mongoDB database using mongodb
const client = new MongoClient(process.env.DB_CONNECTION, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
module.exports = client;
