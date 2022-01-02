const app = require("./app");
const connectWithDB = require("./config/db");
const cloudinary = require("cloudinary");
require("dotenv").config();

//cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// connect with db.
connectWithDB();

app.listen(process.env.PORT, () =>
  console.log(`Server is running on port ${process.env.PORT}`)
);
