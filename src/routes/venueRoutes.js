const express = require("express");
const router = express.Router();

const {
  getAllVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue
} = require("../controllers/venueController");

router.get("/", getAllVenues);
router.get("/:venueId", getVenueById);
router.post("/", createVenue);
router.put("/:venueId", updateVenue);
router.delete("/:venueId", deleteVenue);

module.exports = router;