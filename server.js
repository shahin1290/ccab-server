require("dotenv").config();
const express = require("express");
const bodyparser = require("body-parser");
const morgan = require("morgan");
const path = require("path");
const { sendContactMail } = require("./util/contactMail");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || process.env.SERVER_PORT;
const myDb = require("./database/db");
const axios = require("axios");
const Pusher = require("pusher");
const corsOptions = require("./util/corsOptions");
myDb();

app.use(morgan("dev"));
app.use(express.json());

//include body-parser
app.use(bodyparser.urlencoded({ extended: true }));

/** static file **/
app.use(express.static(path.join(__dirname, "public")));
app.use(cors(corsOptions));
app.get("/", (req, res) => {
  res.send("Server Running...");
});

//pusher routes
const pusher = new Pusher({
  appId: "1245202",
  key: "91fac7eec05b86dbcbb5",
  secret: "f0833f5edb06ef6caa9d",
  cluster: "eu",
  useTLS: true,
});

app.post("/update-editor", (req, res) => {
  pusher.trigger("editor", "text-update", {
    ...req.body,
  });

  res.status(200).send("OK");
});

//contact mail
app.post("/contact", (req, res) => {
  try {
    sendContactMail(req.body);
    res.send("MESSAGE IS SUCCESSFULLY SENT");
  } catch (err) {
    res.send(err);
  }
});

const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const answerRoutes = require("./routes/answerRoutes");
const bootcampRoutes = require("./routes/bootcampRoutes");
const dayRoutes = require("./routes/dayRoutes");
const weekRoutes = require("./routes/weekRoutes");
const quizAnswerRoutes = require("./routes/quizAnswerRoutes");
const quizRoutes = require("./routes/quizRoutes");
const orderRoutes = require("./routes/orderRoutes");
const jobRoutes = require("./routes/jobRoutes");
const mediaCenterRoutes = require("./routes/mediaCenterRoutes");

app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/answers", answerRoutes);
app.use("/api/bootcamp", bootcampRoutes);
app.use("/api/content", dayRoutes);
app.use("/api/weeks", weekRoutes);
app.use("/api/quizAnswer", quizAnswerRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/job", jobRoutes);
app.use("/api/mediaCenter", mediaCenterRoutes);

const server = app.listen(PORT, () => {
  console.log("The server is running on port: " + PORT);
});
