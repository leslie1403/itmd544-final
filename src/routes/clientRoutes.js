const express = require("express");
const router = express.Router();

const {
  getAllClients,
  getEventsByClient
} = require("../controllers/clientController");

router.get("/", getAllClients);
router.get("/:clientId/events", getEventsByClient);

module.exports = router;