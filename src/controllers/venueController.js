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

module.exports = {
  getAllVenues,
  getVenueById
};