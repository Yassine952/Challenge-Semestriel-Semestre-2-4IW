import express from "express";
import mongoose from "mongoose";
import { indexRouter } from "./routes/index.js";

const server = express();

mongoose.connect("mongodb://mongo:27017/mydatabase", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("Connected to MongoDB");
})
.catch(err => {
  console.error("Failed to connect to MongoDB", err);
});

server.use("/", indexRouter);

server.listen(8000, "0.0.0.0", () => {
  console.log("Server listening on http://localhost:8000");
});
