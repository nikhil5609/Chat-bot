const mongoose = require('mongoose');

const partSchema = new mongoose.Schema({
  text: { type: String, required: true },
}, { _id: false });

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "model"], required: true },
  parts: { type: [partSchema], required: true },
}, { _id: false });

const sessionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: {type: String , default: "New Chat"},
  history: { type: [messageSchema], default: [] },
}, { timestamps: true });

const sessionModel = mongoose.model("Session", sessionSchema);
module.exports = sessionModel;
