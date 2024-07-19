const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasks,
  getWeeklyWorkLeisureSummary,
} = require("../controllers/TaskController");

router.post("/addTasks", createTask);
router.get("/", getTasks);
router.get("/weekly-summary", getWeeklyWorkLeisureSummary);

module.exports = router;
