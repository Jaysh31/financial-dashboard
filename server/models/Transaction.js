// models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  id: Number,
  date: Date,
  amount: Number,
  category: String,
  status: String,
  user_id: String,
  user_profile: String,
}, {
  collection: 'Transactions'  // ✅ match your MongoDB collection name
});

module.exports = mongoose.model('Transaction', transactionSchema);
