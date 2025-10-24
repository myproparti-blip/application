import City from "../models/cityModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { MESSAGES } from "../utils/messages.js";

export const getAreasByCity = asyncHandler(async (req, res) => {
  const { city } = req.query;
  if (!city) throw new ApiError(MESSAGES.CITY.REQUIRED, 400);

  const cityData = await City.findOne({ city: { $regex: `^${city}$`, $options: "i" } });
  if (!cityData) throw new ApiError(MESSAGES.CITY.NOT_FOUND, 404);

  res.status(200).json({
    success: true,
    message: MESSAGES.CITY.FETCH_SUCCESS,
    data: { city: cityData.city, areas: cityData.areas },
  });
});

export const addCity = asyncHandler(async (req, res) => {
  const { city, areas } = req.body;
  if (!city || !areas || !Array.isArray(areas) || areas.length === 0)
    throw new ApiError(MESSAGES.CITY.REQUIRED_FIELDS, 400);

  const existing = await City.findOne({ city });
  if (existing) throw new ApiError(MESSAGES.CITY.EXISTS, 400);

  const newCity = await City.create({ city, areas });
  res.status(201).json({
    success: true,
    message: MESSAGES.CITY.ADD_SUCCESS,
    data: newCity,
  });
});

export const updateCityAreas = asyncHandler(async (req, res) => {
  const { city } = req.params;
  const { areas } = req.body;

  if (!areas || !Array.isArray(areas) || areas.length === 0)
    throw new ApiError(MESSAGES.CITY.REQUIRED_AREAS, 400);

  const cityData = await City.findOne({ city: { $regex: `^${city}$`, $options: "i" } });
  if (!cityData) throw new ApiError(MESSAGES.CITY.NOT_FOUND, 404);

  cityData.areas = areas;
  await cityData.save();

  res.status(200).json({
    success: true,
    message: MESSAGES.CITY.UPDATE_SUCCESS,
    data: cityData,
  });
});

export const deleteCity = asyncHandler(async (req, res) => {
  const { city } = req.params;
  const cityData = await City.findOne({ city: { $regex: `^${city}$`, $options: "i" } });
  if (!cityData) throw new ApiError(MESSAGES.CITY.NOT_FOUND, 404);

  await cityData.deleteOne();
  res.status(200).json({
    success: true,
    message: MESSAGES.CITY.DELETE_SUCCESS,
  });
});
