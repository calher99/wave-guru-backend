const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const usersRoutes = require("./routes/users-routes");

const HttpError = require("./models/http-error");

const mongoose = require("mongoose");

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});

app.use("/api/users", usersRoutes);



// turn errors to JSON format
app.use((error, req, res, next) => {
  if (error instanceof HttpError) {
    return res.status(error.code).json({ message: error.message });
  }
  // If it's not an HttpError
  return res.status(500).json({ message: 'An unexpected error occurred.' });
});

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route", 404);
  next(error);
});

mongoose
  .connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@surf-forecast-dev.oh0d0ru.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`)
  .then(() => {
    app.listen(process.env.PORT || 4090);
    console.log("Succesfully connected");
  })
  .catch((error) => {
    console.log(error);
  });
