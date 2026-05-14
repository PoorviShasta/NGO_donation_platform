const mongoose = require("mongoose");
require("dotenv").config();

console.log(process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");
    process.exit();
  })
  .catch((err) => {
    console.log("ERROR:");
    console.log(err);
    process.exit();
  });