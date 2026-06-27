require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const auth = require("./middleware/auth");

const projectRoutes = require("./routes/project.routes");

const taskRoutes = require("./routes/task.routes");

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);

app.use("/api/projects", projectRoutes);

app.use("/api/tasks" , taskRoutes);

app.get("/me", auth, (req, res) => {
  res.json({
    message: "Protected Route",
    user: req.user,
  });
});

app.get("/", (req, res) => {
  res.send("ContriFlow API Running");
});


app.listen(3000, () => {
  console.log("Server Running");
});