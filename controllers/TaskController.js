const Task = require("../models/Task");

exports.createTask = async (req, res) => {
  try {
    const { userId, task, timeFrom, timeTo, date, category } = req.body;

    const [timeFromHour, timeFromMinute] = timeFrom.split(":").map(Number);
    const [timeToHour, timeToMinute] = timeTo.split(":").map(Number);

    const taskDate = new Date(date); // Use the provided date
    const timeFromDate = new Date(
      taskDate.setHours(timeFromHour, timeFromMinute)
    ).toISOString();
    const timeToDate = new Date(
      taskDate.setHours(timeToHour, timeToMinute)
    ).toISOString();

    const newTask = new Task({
      userId,
      description: task,
      timeFrom: timeFromDate,
      timeTo: timeToDate,
      date: new Date(date), // Set the task date
      category, // Set the task category
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
    console.log(date);
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const tasks = await Task.find({
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

    const tasks = await Task.find({
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
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
