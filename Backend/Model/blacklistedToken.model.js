const { Schema, model } = require("mongoose");

const blacklistedTokenSchema = new Schema(
  {
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      default: Date.now, // current time
      expires: 60 * 60 * 24, // <-- 1 day (in seconds)
    },
  },
  {
    timestamps: true,
  }
);

const blacklistedTokenModel = model("blacklisted-token", blacklistedTokenSchema);

module.exports = blacklistedTokenModel;
