import express from "express";
import { getAreasByCity, addCity, updateCityAreas, deleteCity } from "../controllers/cityController.js";

const router = express.Router();
router.get("/", getAreasByCity);
router.post("/", addCity);
router.put("/:city", updateCityAreas);
router.delete("/:city", deleteCity);
export default router;
