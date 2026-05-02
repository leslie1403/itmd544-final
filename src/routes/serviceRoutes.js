const express = require("express");
const router = express.Router();

const {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService
} = require("../controllers/serviceController");

router.get("/", getAllServices);
router.get("/:serviceId", getServiceById);
router.post("/", createService);
router.put("/:serviceId", updateService);
router.delete("/:serviceId", deleteService);

module.exports = router;