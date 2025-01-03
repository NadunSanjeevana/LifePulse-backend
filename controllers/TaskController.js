const Task = require("../models/Task");
const fs = require("fs");
const ical = require("ical");
const checkOverlappingTask = require("../utils/checkOverlappingTask");

exports.createTask = async (req, res) => {
  try {
    const { task, timeFrom, timeTo, date, category } = req.body;
    const userId = req.user._id;

    const [timeFromHour, timeFromMinute] = timeFrom.split(":").map(Number);
    const [timeToHour, timeToMinute] = timeTo.split(":").map(Number);

    const taskDate = new Date(date);
    const timeFromDate = new Date(
      taskDate.setHours(timeFromHour, timeFromMinute)
    ).toISOString();
    const timeToDate = new Date(
      taskDate.setHours(timeToHour, timeToMinute)
    ).toISOString();

    const overlappingTask = await checkOverlappingTask(
      userId,
      timeFromDate,
      timeToDate
    );

    if (overlappingTask) {
      return res
        .status(400)
        .json({ message: "There is already a task for the same time slot." });
    }

    const newTask = new Task({
      userId,
      description: task,
      timeFrom: timeFromDate,
      timeTo: timeToDate,
      date: new Date(date),
      category,
    });

    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const { date } = req.query;
    const userId = req.user._id; // Ensure userId is passed from authenticated user

    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const tasks = await Task.find({
      userId, // Filter by userId
      timeFrom: {
        $gte: startDate.toISOString(),
        $lt: endDate.toISOString(),
      },
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getHours = (from, to) => {
  const fromTime = new Date(from);
  const toTime = new Date(to);
  return (toTime - fromTime) / 3600000; // Convert milliseconds to hours
};

exports.getWeeklyWorkLeisureSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user._id; // Ensure userId is passed from authenticated user
    const from = new Date(startDate);
    const to = new Date(endDate);
    const tasks = await Task.find({
      userId, // Filter by userId
      date: {
        $gte: from.toISOString(),
        $lte: to.toISOString(),
      },
    });
    const summary = tasks.reduce((acc, task) => {
      const day = new Date(task.date).toLocaleDateString("en-US", {
        weekday: "short",
      });
      const hours = getHours(task.timeFrom, task.timeTo);

      if (!acc[day]) {
        acc[day] = { Work: 0, Leisure: 0, Sleep: 0, Other: 0 };
      }
      acc[day][task.category] += hours;
      return acc;
    }, {});
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.importCalendarEvents = async (req, res) => {
  try {
    const filePath = req.file.path;
    const data = fs.readFileSync(filePath, "utf8");
    const parsedData = ical.parseICS(data);

    const events = [];
    for (const key in parsedData) {
      if (parsedData.hasOwnProperty(key)) {
        const event = parsedData[key];
        if (event.type === "VEVENT") {
          events.push({
            summary: event.summary,
            start: event.start,
            end: event.end,
          });
        }
      }
    }

    // Remove the uploaded file after parsing
    fs.unlinkSync(filePath);

    res.status(200).json(events);
  } catch (error) {
    console.error("Failed to import calendar events:", error);
    res.status(500).json({ message: "Failed to import calendar events" });
  }
};

exports.saveSelectedEvents = async (req, res) => {
  try {
    const { events } = req.body;
    const userId = req.user._id;
    const savedEvents = [];

    for (const event of events) {
      const overlappingTask = await checkOverlappingTask(
        userId,
        event.start,
        event.end
      );

      if (overlappingTask) {
        console.warn(`Skipping event '${event.summary}' due to overlap`);
        continue; // Skip overlapping events
      }

      const newTask = new Task({
        description: event.summary,
        timeFrom: event.start,
        timeTo: event.end,
        date: event.start,
        category: event.category || "Other",
        userId,
      });
      const savedEvent = await newTask.save();
      savedEvents.push(savedEvent);
    }

    res.status(200).json(savedEvents);
  } catch (error) {
    console.error("Failed to save selected events:", error);
    res.status(500).json({ message: "Failed to save selected events" });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user._id; // Ensure userId is passed from authenticated user

    // Find the task by taskId and userId
    const task = await Task.findOne({ _id: taskId, userId });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await Task.deleteOne({ _id: taskId, userId });
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
