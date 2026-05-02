const express = require("express");
const router = express.Router();

const {
  getEventWeather
} = require("../controllers/weatherController");

router.get("/events/:eventId/weather", getEventWeather);

module.exports = router;