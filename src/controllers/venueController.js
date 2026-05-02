const { poolPromise, sql } = require("../db/connection");

// GET /venues
const getAllVenues = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT 
        venue_id,
        name,
        address,
        city,
        state,
        zip_code,
        capacity,
        created_at
      FROM venues
      ORDER BY venue_id;
    `);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("Error getting venues:", err);
    res.status(500).json({ error: "Failed to retrieve venues" });
  }
};

// GET /venues/:venueId
const getVenueById = async (req, res) => {
  try {
    const { venueId } = req.params;

    const pool = await poolPromise;

    const result = await pool.request()
      .input("venueId", sql.Int, venueId)
      .query(`
        SELECT 
          venue_id,
          name,
          address,
          city,
          state,
          zip_code,
          capacity,
          created_at
        FROM venues
        WHERE venue_id = @venueId;
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Venue not found" });
    }

    res.status(200).json(result.recordset[0]);
  } catch (err) {
    console.error("Error getting venue:", err);
    res.status(500).json({ error: "Failed to retrieve venue" });
  }
};

// POST /venues
const createVenue = async (req, res) => {
  try {
    const { name, address, city, state, zip_code, capacity } = req.body;

    if (!name || !address || !city || !state) {
      return res.status(400).json({
        error: "Venue name, address, city, and state are required"
      });
    }

    const pool = await poolPromise;

    const result = await pool.request()
      .input("name", sql.VarChar(100), name)
      .input("address", sql.VarChar(200), address)
      .input("city", sql.VarChar(100), city)
      .input("state", sql.VarChar(50), state)
      .input("zip_code", sql.VarChar(20), zip_code || null)
      .input("capacity", sql.Int, capacity || null)
      .query(`
        INSERT INTO venues (name, address, city, state, zip_code, capacity)
        OUTPUT 
          INSERTED.venue_id,
          INSERTED.name,
          INSERTED.address,
          INSERTED.city,
          INSERTED.state,
          INSERTED.zip_code,
          INSERTED.capacity,
          INSERTED.created_at
        VALUES (@name, @address, @city, @state, @zip_code, @capacity);
      `);

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error("Error creating venue:", err);
    res.status(500).json({ error: "Failed to create venue" });
  }
};

// PUT /venues/:venueId
const updateVenue = async (req, res) => {
  try {
    const { venueId } = req.params;
    const { name, address, city, state, zip_code, capacity } = req.body;

    if (!name || !address || !city || !state) {
      return res.status(400).json({
        error: "Venue name, address, city, and state are required"
      });
    }

    const pool = await poolPromise;

    const result = await pool.request()
      .input("venueId", sql.Int, venueId)
      .input("name", sql.VarChar(100), name)
      .input("address", sql.VarChar(200), address)
      .input("city", sql.VarChar(100), city)
      .input("state", sql.VarChar(50), state)
      .input("zip_code", sql.VarChar(20), zip_code || null)
      .input("capacity", sql.Int, capacity || null)
      .query(`
        UPDATE venues
        SET 
          name = @name,
          address = @address,
          city = @city,
          state = @state,
          zip_code = @zip_code,
          capacity = @capacity
        OUTPUT 
          INSERTED.venue_id,
          INSERTED.name,
          INSERTED.address,
          INSERTED.city,
          INSERTED.state,
          INSERTED.zip_code,
          INSERTED.capacity,
          INSERTED.created_at
        WHERE venue_id = @venueId;
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Venue not found" });
    }

    res.status(200).json(result.recordset[0]);
  } catch (err) {
    console.error("Error updating venue:", err);
    res.status(500).json({ error: "Failed to update venue" });
  }
};

// DELETE /venues/:venueId
const deleteVenue = async (req, res) => {
  try {
    const { venueId } = req.params;

    const pool = await poolPromise;

    const result = await pool.request()
      .input("venueId", sql.Int, venueId)
      .query(`
        DELETE FROM venues
        OUTPUT 
          DELETED.venue_id,
          DELETED.name,
          DELETED.address,
          DELETED.city,
          DELETED.state,
          DELETED.zip_code,
          DELETED.capacity
        WHERE venue_id = @venueId;
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Venue not found" });
    }

    res.status(200).json({
      message: "Venue deleted successfully",
      deletedVenue: result.recordset[0]
    });
  } catch (err) {
    console.error("Error deleting venue:", err);

    res.status(409).json({
      error: "Failed to delete venue.",
      note: "This venue is connected to one or more events. Delete or update the related events first, then try deleting the venue again."
    });
  }
};

module.exports = {
  getAllVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue
};