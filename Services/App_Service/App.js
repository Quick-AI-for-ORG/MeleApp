const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const session = require("express-session");
const bodyParser = require("body-parser");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");

dotenv.config({ path: "../../.env" });

const app = express();
const rootRouter = require("./Routes/root");
const keeperRouter = require("./Routes/keeper");
const adminRouter = require("./Routes/admin");
const ctrlPages = require("./Controllers/ctrlPages");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({ secret: "Your_Secret_Key", saveUninitialized: true, resave: false })
);
// Make sure the static file middleware is properly configured
app.use(express.static(path.join(__dirname, "../../UI/Public")));
app.use(expressLayouts);

// Add this before your route middleware
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

app.use("/", rootRouter);
app.use("/keeper", keeperRouter);
app.use("/admin", adminRouter);
app.get("*", ctrlPages._PUBLIC.notFound);

app.set("layout", "Layouts/layout");

app.set("views", "../../UI/Views");
app.set("view engine", "ejs");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

const PORT = process.env.PORT || 5000;
const IP = process.env.IP || 'localhost';
app.listen(PORT, IP,() => {
  console.log(`Server is running on port ${PORT}`);
});
