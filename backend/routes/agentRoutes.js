import express from "express";
import {
  registerAgent,
  getAllAgents,
  getAgentById,
} from "../controllers/agentController.js";

const router = express.Router();

router.post("/", registerAgent);
router.get("/", getAllAgents);
router.get("/:id", getAgentById);

export default router;
