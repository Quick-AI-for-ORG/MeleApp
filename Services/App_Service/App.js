const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "../../.env" });

const mongoURI = process.env.MONGODB_URI;
const app = express();

dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("../../UI/Public"));
app.set("views", "../../UI/Views");

app.set("view engine", "ejs");

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("Connected to MongoDB successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

app.get("/", (req, res) => {
  res.render("signup");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
