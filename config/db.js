const mongoose = require("mongoose");

const connectWithDB = () => {
  mongoose
    .connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(console.log("Connected to DB."))
    .catch((err) => {
      console.log("Unable to connect to DB.");
      console.log(err);
      process.exit(1);
    });
};

module.exports = connectWithDB;
