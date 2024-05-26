const express = require("express");
const mongoose = require("mongoose");
require("express-async-errors");
const cors = require("cors");
const app = express();
const config = require("./utils/config");
const logger = require("./utils/logger");
const middleware = require("./utils/middlewares");

mongoose.set("strictQuery", false);
logger.info("Connecting to", config.MONGODB_URL);

mongoose
  .connect(config.MONGODB_URL)
  .then(() => logger.info("Connected to MongoDB"))
  .catch((err) => logger.error("Error connecting to MongoDB", err.message));

const blogsRouter = require("./controllers/blogs");

app.use(cors());
app.use(express.json());

app.use("/api/blogs", blogsRouter);
app.use(middleware.errorHandler);

module.exports = app;
