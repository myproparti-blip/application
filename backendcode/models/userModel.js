import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true, trim: true },
    role: {
      type: [String],
      enum: [
        "buyer", "seller", "tenant", "landlord", "owner", "investor",
        "agent", "broker", "builder", "developer", "contractor",
        "property_manager", "appraiser", "consultant"
      ],
      required: true,
    },
    refreshToken: { type: String },
    isDeleted: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    lastOtpSentAt: { type: Date },
  },
  { timestamps: true }
);
userSchema.index({ phone: 1 });
export default mongoose.model("User", userSchema);
