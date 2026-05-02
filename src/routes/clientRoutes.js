const express = require("express");
const router = express.Router();

const {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
} = require("../controllers/clientController");

router.get("/", getAllClients);
router.get("/:clientId", getClientById);
router.post("/", createClient);
router.put("/:clientId", updateClient);
router.delete("/:clientId", deleteClient);

module.exports = router;