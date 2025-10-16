import mongoose from "mongoose";

const citySchema = new mongoose.Schema({
  city: { type: String, required: true, unique: true },
  areas: [{ type: String, required: true }],
}, { timestamps: true });

export default mongoose.model("City", citySchema);
