import express from "express";
import {
  getConsultants,
  addConsultant,
  deleteConsultant,
  updateConsultant, 
} from "../controllers/consultantController.js";
import upload from "../middleware/upload.js";
import { protect } from "../middleware/authMiddleware.js"; // <-- Import auth middleware

const router = express.Router();

// ---------------- PROTECTED ROUTES ----------------

// Get all consultants
router.get("/", protect, getConsultants);

// Add consultant (with file upload)
router.post(
  "/",
  protect,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "idProof", maxCount: 1 }
  ]),
  addConsultant
);

// Update consultant
router.put(
  "/:id",
  protect,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "idProof", maxCount: 1 }
  ]),
  updateConsultant
);

// Delete consultant
router.delete("/:id", protect, deleteConsultant);

export default router;
