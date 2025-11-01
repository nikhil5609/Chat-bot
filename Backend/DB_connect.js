const mongoose = require('mongoose');

exports.main = async() => {
  await mongoose.connect(process.env.DB_CONNECTION_STRING);
}