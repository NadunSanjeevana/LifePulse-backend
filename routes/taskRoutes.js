const express = require("express");
const upload = require("../middleware/upload");
const router = express.Router();
const {
  createTask,
  getTasks,
  getWeeklyWorkLeisureSummary,
  importCalendarEvents,
} = require("../controllers/TaskController");

router.post("/addTasks", createTask);
router.get("/", getTasks);
router.get("/weekly-summary", getWeeklyWorkLeisureSummary);
router.post("/import-calendar", upload.single("file"), importCalendarEvents);

module.exports = router;
