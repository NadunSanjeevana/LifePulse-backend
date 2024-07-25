const express = require("express");
const upload = require("../middleware/upload");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
const {
  createTask,
  getTasks,
  getWeeklyWorkLeisureSummary,
  importCalendarEvents,
  saveSelectedEvents,
} = require("../controllers/TaskController");

router.post("/addTasks", authMiddleware, createTask);
router.get("/", authMiddleware, getTasks);
router.get("/weekly-summary", authMiddleware, getWeeklyWorkLeisureSummary);
router.post(
  "/import-calendar",
  authMiddleware,
  upload.single("file"),
  importCalendarEvents
);
router.post("/save-events", authMiddleware, saveSelectedEvents);

module.exports = router;
