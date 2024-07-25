const Task = require("../models/Task");

const checkOverlappingTask = async (userId, timeFrom, timeTo) => {
  const overlappingTask = await Task.findOne({
    userId,
    $or: [
      {
        timeFrom: { $lt: timeTo },
        timeTo: { $gt: timeFrom },
      },
    ],
  });
  return overlappingTask;
};

module.exports = checkOverlappingTask;
