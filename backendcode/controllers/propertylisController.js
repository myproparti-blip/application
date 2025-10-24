import Property from "../models/propertyModel.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { MESSAGES } from "../utils/messages.js";

const ADMIN_PHONE = "7416698451";

export const createProperty = asyncHandler(async (req, res) => {
  const {
    title,
    propertyType,
    addressLine1,
    locality,
    city,
    price,
    bedrooms,
  } = req.body;

  if (!title || !addressLine1 || !city || !propertyType || !price || !bedrooms) {
    throw new ApiError(MESSAGES.PROPERTY.REQUIRED_FIELDS, 400);
  }

  const images = req.files?.images?.map(f => f.path) || [];
  const videos = req.files?.videos?.map(f => f.path) || [];

  let property = await Property.findOne({
    user: req.user.id,
    title: title.trim(),
    propertyType,
    addressLine1: addressLine1.trim(),
    locality: locality ? locality.trim() : "",
    city: city.trim(),
    bedrooms,
    price,
  });

  if (property) {
    if (images.length) property.images.push(...images);
    if (videos.length) property.videos.push(...videos);
    Object.assign(property, req.body, { lastUpdated: Date.now() });
    const updatedProperty = await property.save();

    return res.status(200).json({
      success: true,
      message: MESSAGES.PROPERTY.DUPLICATE_FOUND,
      data: updatedProperty,
    });
  }

  property = new Property({
    ...req.body,
    user: req.user.id,
    images,
    videos,
    isApproved: false,
  });

  const savedProperty = await property.save();

  return res.status(201).json({
    success: true,
    message: MESSAGES.PROPERTY.ADD_SUCCESS,
    data: savedProperty,
  });
});

export const getAllProperties = asyncHandler(async (req, res) => {
  const properties = await Property.find().populate("user", "name email phone");

  res.status(200).json({
    success: true,
    message: MESSAGES.PROPERTY.FETCH_SUCCESS,
    data: properties,
  });
});

export const getPropertyById = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id).populate("user", "name email");
  if (!property) throw new ApiError(MESSAGES.PROPERTY.NOT_FOUND, 404);

  const isAdmin = req.user.phone === ADMIN_PHONE;
  if (!property.isApproved && property.user.toString() !== req.user.id && !isAdmin) {
    throw new ApiError(MESSAGES.PROPERTY.NOT_AUTHORIZED, 403);
  }

  res.status(200).json({
    success: true,
    message: MESSAGES.PROPERTY.FETCH_SINGLE_SUCCESS,
    data: property,
  });
});

export const updateProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(MESSAGES.PROPERTY.NOT_FOUND, 404);

  const isAdmin = req.user.phone === ADMIN_PHONE;
  if (property.user.toString() !== req.user.id && !isAdmin) {
    throw new ApiError(MESSAGES.PROPERTY.NOT_AUTHORIZED, 403);
  }

  if (req.files?.images) property.images.push(...req.files.images.map(f => f.path));
  if (req.files?.videos) property.videos.push(...req.files.videos.map(f => f.path));

  Object.assign(property, req.body, { lastUpdated: Date.now() });
  const updatedProperty = await property.save();

  res.status(200).json({
    success: true,
    message: MESSAGES.PROPERTY.UPDATE_SUCCESS,
    data: updatedProperty,
  });
});

export const deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(MESSAGES.PROPERTY.NOT_FOUND, 404);

  const isAdmin = req.user.phone === ADMIN_PHONE;
  if (property.user.toString() !== req.user.id && !isAdmin) {
    throw new ApiError(MESSAGES.PROPERTY.NOT_AUTHORIZED, 403);
  }

  await property.deleteOne();

  res.status(200).json({
    success: true,
    message: MESSAGES.PROPERTY.DELETE_SUCCESS,
  });
});

export const approveProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(MESSAGES.PROPERTY.NOT_FOUND, 404);

  const isAdmin = req.user.phone === ADMIN_PHONE;
  if (!isAdmin) throw new ApiError(MESSAGES.PROPERTY.NOT_AUTHORIZED, 403);

  property.isApproved = true;
  property.approvedBy = req.user.id;
  property.approvalDate = Date.now();

  const updatedProperty = await property.save();

  res.status(200).json({
    success: true,
    message: MESSAGES.PROPERTY.APPROVE_SUCCESS,
    data: updatedProperty,
  });
});
