const { poolPromise, sql } = require("../db/connection");

// GET /services
const getAllServices = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
    SELECT
    s.service_id,
    s.event_id,
    s.service_name,
    s.description,
    s.status,
    s.created_at,
    e.event_name
    FROM services s
    JOIN events e ON s.event_id = e.event_id
    ORDER BY s.service_id;
  `);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("Error getting services:", err);
    res.status(500).json({ error: "Failed to retrieve services" });
  }
};

// GET /services/:serviceId
const getServiceById = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const pool = await poolPromise;

    const result = await pool.request()
      .input("serviceId", sql.Int, serviceId)
      .query(`
    SELECT
      s.service_id,
      s.event_id,
      s.service_name,
      s.description,
      s.status,
      s.created_at,
      e.event_name
    FROM services s
    JOIN events e ON s.event_id = e.event_id
    WHERE s.service_id = @serviceId;
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Service not found" });
    }

    res.status(200).json(result.recordset[0]);
  } catch (err) {
    console.error("Error getting service:", err);
    res.status(500).json({ error: "Failed to retrieve service" });
  }
};

// POST /services
const createService = async (req, res) => {
  try {
    const { event_id, service_name, description, status } = req.body;

    if (!event_id || !service_name) {
      return res.status(400).json({
        error: "event_id and service_name are required"
      });
    }

    const pool = await poolPromise;

    const result = await pool.request()
      .input("event_id", sql.Int, event_id)
      .input("service_name", sql.VarChar(100), service_name)
      .input("description", sql.VarChar(255), description || null)
      .input("status", sql.VarChar(50), status || "Requested")
      .query(`
    INSERT INTO services (
      event_id,
      service_name,
      description,
      status
    )
    OUTPUT
      INSERTED.service_id,
      INSERTED.event_id,
      INSERTED.service_name,
      INSERTED.description,
      INSERTED.status,
      INSERTED.created_at
    VALUES (
      @event_id,
      @service_name,
      @description,
      @status
    );
    `);

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error("Error creating service:", err);

    res.status(500).json({
      error: "Failed to create service",
      details: err.message
    });
  }
};

// PUT /services/:serviceId
const updateService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { event_id, service_name, description, status } = req.body;

    if (!event_id || !service_name) {
      return res.status(400).json({
        error: "event_id and service_name are required"
      });
    }

    const pool = await poolPromise;

    const result = await pool.request()
      .input("serviceId", sql.Int, serviceId)
      .input("event_id", sql.Int, event_id)
      .input("service_name", sql.VarChar(100), service_name)
      .input("description", sql.VarChar(255), description || null)
      .input("status", sql.VarChar(50), status || "Requested")
      .query(`
    UPDATE services
    SET
      event_id = @event_id,
      service_name = @service_name,
      description = @description,
      status = @status
    OUTPUT
      INSERTED.service_id,
      INSERTED.event_id,
      INSERTED.service_name,
      INSERTED.description,
      INSERTED.status,
      INSERTED.created_at
    WHERE service_id = @serviceId;
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Service not found" });
    }

    res.status(200).json(result.recordset[0]);
  } catch (err) {
    console.error("Error updating service:", err);

    res.status(500).json({
      error: "Failed to update service",
      details: err.message
    });
  }
};

// DELETE /services/:serviceId
const deleteService = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const pool = await poolPromise;

    const result = await pool.request()
      .input("serviceId", sql.Int, serviceId)
      .query(`
    DELETE FROM services
    OUTPUT
      DELETED.service_id,
      DELETED.event_id,
      DELETED.service_name,
      DELETED.description,
      DELETED.status
    WHERE service_id = @serviceId;
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Service not found" });
    }

    res.status(200).json({
      message: "Service deleted successfully",
      deletedService: result.recordset[0]
    });
  } catch (err) {
    console.error("Error deleting service:", err);

    res.status(500).json({
      error: "Failed to delete service.",
      note: "Check that the service exists and is not restricted by another database relationship."
    });
  }
};

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService
};