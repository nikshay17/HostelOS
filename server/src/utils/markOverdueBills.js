const MessBill = require('../models/MessBill.model');

const markOverdueBills = async () => {
  const result = await MessBill.updateMany(
    { status: 'unpaid', dueDate: { $lt: new Date() } },
    { $set: { status: 'overdue' } }
  );
  console.log(`Marked ${result.modifiedCount} bills as overdue`);
};

module.exports = markOverdueBills;