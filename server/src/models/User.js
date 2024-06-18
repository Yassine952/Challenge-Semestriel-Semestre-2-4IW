import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isConfirmed: { type: Boolean, default: false },
  passwordChangedAt: { type: Date },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
}, { timestamps: true });

userSchema.methods.isLocked = function() {
  return this.lockUntil && this.lockUntil > Date.now();
};

const User = mongoose.model("User", userSchema);

export default User;
