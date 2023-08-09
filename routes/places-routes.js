const express = require("express");
const router = express.Router();

const placesControllers = require("../controllers/places-controller");

const checkAuth = require("../middleware/check-auth");

router.use(checkAuth);

router.post("/add", placesControllers.addPlaceToUser);

router.get("/getPlaces", placesControllers.getPlacesByUserId);

router.delete("/delete/:placeId", placesControllers.deletePlaceById);

module.exports = router;
