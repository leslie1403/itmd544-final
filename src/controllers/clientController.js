const { poolPromise, sql } = require("../db/connection");

// GET /clients
const getAllClients = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT client_id, name, email, phone, created_at
      FROM clients
      ORDER BY client_id;
    `);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("Error getting clients:", err);
    res.status(500).json({ error: "Failed to retrieve clients" });
  }
};

// GET /clients/:clientId/events
const getEventsByClient = async (req, res) => {
  try {
    const { clientId } = req.params;

    const pool = await poolPromise;

    const result = await pool.request()
      .input("clientId", sql.Int, clientId)
      .query(`
        SELECT 
          e.event_id,
          e.event_name,
          e.event_date,
          e.start_time,
          e.end_time,
          e.expected_attendance,
          e.status,
          c.client_id,
          c.name AS client_name,
          v.venue_id,
          v.name AS venue_name,
          v.city,
          v.state
        FROM events e
        JOIN clients c ON e.client_id = c.client_id
        JOIN venues v ON e.venue_id = v.venue_id
        WHERE c.client_id = @clientId
        ORDER BY e.event_date;
      `);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("Error getting client events:", err);
    res.status(500).json({ error: "Failed to retrieve client events" });
  }
};

module.exports = {
  getAllClients,
  getEventsByClient
};