import consultantModel from "../models/consultantModel.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { MESSAGES } from "../utils/messages.js";

export const getConsultants = asyncHandler(async (req, res) => {
  const { location } = req.query;
  const filter = location ? { location: { $regex: location, $options: "i" } } : {};
  try {
    const consultants = await consultantModel.find(filter).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: MESSAGES.CONSULTANT.FETCH_SUCCESS,
      data: consultants,
    });
  } catch (error) {
    throw new ApiError(MESSAGES.CONSULTANT.FETCH_FAIL, 500);
  }
});

export const addConsultant = asyncHandler(async (req, res) => {
  const {
    name,
    phone,
    designation,
    experience,
    money,
    moneyType,
    expertise,
    languages,
    address,
    location,
  } = req.body;

  if (
    !name ||
    !phone ||
    !designation ||
    experience === undefined ||
    !money ||
    !expertise ||
    !location ||
    !req.files?.image?.[0] ||
    !req.files?.idProof?.[0]
  ) {
    throw new ApiError(MESSAGES.CONSULTANT.REQUIRED_FIELDS, 400);
  }

  const existing = await consultantModel.findOne({
    name: name.trim(),
    phone: phone.trim(),
  });
  if (existing) throw new ApiError(MESSAGES.CONSULTANT.EXISTS, 400);

  const imagePath = `/uploads/${req.files.image[0].filename}`;
  const idProofPath = `/uploads/${req.files.idProof[0].filename}`;

  const formattedLanguages = Array.isArray(languages)
    ? languages
    : typeof languages === "string"
    ? languages.split(",").map((l) => l.trim())
    : [];

  try {
    const consultant = await consultantModel.create({
      name: name.trim(),
      phone: phone.trim(),
      designation: designation.trim(),
      experience,
      money,
      moneyType: moneyType || "project",
      expertise: expertise.trim(),
      certifications: "",
      languages: formattedLanguages,
      image: imagePath,
      idProof: idProofPath,
      address: address?.trim() || "",
      location: location.trim(),
      user: req.user?.id || null,
    });

    res.status(201).json({
      success: true,
      message: MESSAGES.CONSULTANT.ADD_SUCCESS,
      data: consultant,
    });
  } catch (error) {
    throw new ApiError(MESSAGES.CONSULTANT.ADD_FAIL, 500);
  }
});

export const updateConsultant = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const consultant = await consultantModel.findById(id);
  if (!consultant) throw new ApiError(MESSAGES.CONSULTANT.NOT_FOUND, 404);

  const fields = [
    "name",
    "phone",
    "designation",
    "experience",
    "money",
    "moneyType",
    "expertise",
    "certifications",
    "languages",
    "address",
    "location",
  ];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      if (field === "languages") {
        consultant.languages = Array.isArray(req.body.languages)
          ? req.body.languages
          : req.body.languages.toString().split(",").map((l) => l.trim());
      } else if (typeof req.body[field] === "string") {
        consultant[field] = req.body[field].trim();
      } else {
        consultant[field] = req.body[field];
      }
    }
  });

  if (req.files?.image?.[0]) consultant.image = `/uploads/${req.files.image[0].filename}`;
  if (req.files?.idProof?.[0]) consultant.idProof = `/uploads/${req.files.idProof[0].filename}`;

  try {
    const updated = await consultant.save();
    res.status(200).json({
      success: true,
      message: MESSAGES.CONSULTANT.UPDATE_SUCCESS,
      data: updated,
    });
  } catch {
    throw new ApiError(MESSAGES.CONSULTANT.UPDATE_FAIL, 500);
  }
});

export const deleteConsultant = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const consultant = await consultantModel.findById(id);
  if (!consultant) throw new ApiError(MESSAGES.CONSULTANT.NOT_FOUND, 404);

  if (consultant.user?.toString() !== req.user?.id && req.user?.phoneNumber !== "7416698451") {
    throw new ApiError(MESSAGES.CONSULTANT.NOT_AUTHORIZED, 403);
  }

  await consultant.deleteOne();
  res.status(200).json({
    success: true,
    message: MESSAGES.CONSULTANT.DELETE_SUCCESS,
  });
});
