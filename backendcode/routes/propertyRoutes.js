import express from "express";
import {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  approveProperty
} from "../controllers/propertylisController.js";
import upload from "../middleware/upload.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// File upload config
const uploadFields = upload.fields([
  { name: "images", maxCount: 10 },
  { name: "videos", maxCount: 5 },
]);

router.post("/", protect, uploadFields, createProperty);
router.get("/", protect, getAllProperties);
router.get("/:id", protect, getPropertyById);
router.put("/:id", protect, uploadFields, updateProperty);
router.delete("/:id", protect, deleteProperty);
router.post("/:id/approve", protect, approveProperty);

export default router;
