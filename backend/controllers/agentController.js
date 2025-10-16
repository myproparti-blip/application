import Agent from "../models/agentModel.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { MESSAGES } from "../utils/messages.js";

const ADMIN_PHONE = process.env.ADMIN_PHONE; 
export const getAllAgents = asyncHandler(async (req, res) => {
  try {
    const agents = await Agent.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: MESSAGES.AGENT.FETCH_SUCCESS,
      data: agents,
    });
  } catch (error) {
    throw new ApiError(MESSAGES.AGENT.FETCH_FAIL, 500);
  }
});

export const registerAgent = asyncHandler(async (req, res) => {
  const {
    isPropertyDealer,
    agentName,
    firmName,
    operatingCity,
    operatingAreaChips,
    operatingSince,
    teamMembers,
    dealsIn,
    dealsInOther,
    aboutAgent,
  } = req.body;

  if (!agentName || !operatingCity || !dealsIn?.length) {
    throw new ApiError(MESSAGES.AGENT.REQUIRED_FIELDS, 400);
  }

  try {
    const newAgent = await Agent.create({
      isPropertyDealer,
      agentName: agentName.trim(),
      firmName: firmName?.trim() || "",
      operatingCity: operatingCity.trim(),
      operatingAreaChips,
      operatingSince,
      teamMembers,
      dealsIn,
      dealsInOther,
      aboutAgent: aboutAgent?.trim() || "",
      user: req.user?.id || null,
    });

    res.status(201).json({
      success: true,
      message: MESSAGES.AGENT.ADD_SUCCESS,
      data: newAgent,
    });
  } catch (error) {
    throw new ApiError(MESSAGES.AGENT.ADD_FAIL, 500);
  }
});

export const getAgentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const agent = await Agent.findById(id);
  if (!agent) throw new ApiError(MESSAGES.AGENT.NOT_FOUND, 404);

  res.status(200).json({
    success: true,
    message: MESSAGES.AGENT.FETCH_SUCCESS,
    data: agent,
  });
});

export const updateAgent = asyncHandler(async (req, res) => {
  const agent = await Agent.findById(req.params.id);
  if (!agent) throw new ApiError(MESSAGES.AGENT.NOT_FOUND, 404);

  // ✅ Only owner or admin (from .env) can update
  if (agent.user?.toString() !== req.user?.id && req.user?.phoneNumber !== ADMIN_PHONE) {
    throw new ApiError(MESSAGES.AGENT.NOT_AUTHORIZED, 403);
  }

  const fields = [
    "isPropertyDealer",
    "agentName",
    "firmName",
    "operatingCity",
    "operatingAreaChips",
    "operatingSince",
    "teamMembers",
    "dealsIn",
    "dealsInOther",
    "aboutAgent",
  ];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      agent[field] =
        typeof req.body[field] === "string"
          ? req.body[field].trim()
          : req.body[field];
    }
  });

  const updatedAgent = await agent.save();

  res.status(200).json({
    success: true,
    message: MESSAGES.AGENT.UPDATE_SUCCESS,
    data: updatedAgent,
  });
});

export const deleteAgent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const agent = await Agent.findById(id);
  if (!agent) throw new ApiError(MESSAGES.AGENT.NOT_FOUND, 404);

  if (agent.user?.toString() !== req.user?.id && req.user?.phoneNumber !== ADMIN_PHONE) {
    throw new ApiError(MESSAGES.AGENT.NOT_AUTHORIZED, 403);
  }

  await agent.deleteOne();

  res.status(200).json({
    success: true,
    message: MESSAGES.AGENT.DELETE_SUCCESS,
  });
});
