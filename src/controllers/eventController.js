const { poolPromise, sql } = require("../db/connection");

const formatDate = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    return value.toISOString().split("T")[0];
  }

  return value.toString();
};

const formatTime = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    return value.toISOString().substring(11, 16);
  }

  if (!isNaN(value)) {
    const totalMilliseconds = Number(value);
    const totalMinutes = Math.floor(totalMilliseconds / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  return value.toString();
};

const formatEvent = (event) => {
  if (!event) return null;

  event.event_date = formatDate(event.event_date);
  event.start_time = formatTime(event.start_time);
  event.end_time = formatTime(event.end_time);

  return event;
};

// GET /events?page=1&limit=10
const getAllEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    if (page < 1 || limit < 1) {
      return res.status(400).json({
        error: "Page and limit must be positive numbers"
      });
    }

    const pool = await poolPromise;

    const countResult = await pool.request().query(`
      SELECT COUNT(*) AS total
      FROM events;
    `);

    const totalEvents = countResult.recordset[0].total;
    const totalPages = Math.ceil(totalEvents / limit);

    const result = await pool.request()
      .input("offset", sql.Int, offset)
      .input("limit", sql.Int, limit)
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
        ORDER BY e.event_date
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY;
      `);

    res.status(200).json({
      page,
      limit,
      totalEvents,
      totalPages,
      data: result.recordset.map(formatEvent)
    });
  } catch (err) {
    console.error("Error getting events:", err);
    res.status(500).json({ error: "Failed to retrieve events" });
  }
};

// GET /events/:eventId
const getEventById = async (req, res) => {
  try {
    const { eventId } = req.params;

    const pool = await poolPromise;

    const result = await pool.request()
      .input("eventId", sql.Int, eventId)
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
          c.email AS client_email,
          c.phone AS client_phone,
          v.venue_id,
          v.name AS venue_name,
          v.address,
          v.city,
          v.state,
          v.zip_code,
          v.capacity
        FROM events e
        JOIN clients c ON e.client_id = c.client_id
        JOIN venues v ON e.venue_id = v.venue_id
        WHERE e.event_id = @eventId;
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.status(200).json(formatEvent(result.recordset[0]));
  } catch (err) {
    console.error("Error getting event:", err);
    res.status(500).json({ error: "Failed to retrieve event" });
  }
};

// POST /events
const createEvent = async (req, res) => {
  try {
    const {
      client_id,
      venue_id,
      event_name,
      event_date,
      start_time,
      end_time,
      expected_attendance,
      status
    } = req.body;

    if (!client_id || !venue_id || !event_name || !event_date) {
      return res.status(400).json({
        error: "client_id, venue_id, event_name, and event_date are required"
      });
    }

    const pool = await poolPromise;

    const result = await pool.request()
      .input("client_id", sql.Int, client_id)
      .input("venue_id", sql.Int, venue_id)
      .input("event_name", sql.VarChar(150), event_name)
      .input("event_date", sql.Date, event_date)
      .input("start_time", sql.VarChar(10), start_time || null)
      .input("end_time", sql.VarChar(10), end_time || null)
      .input("expected_attendance", sql.Int, expected_attendance || null)
      .input("status", sql.VarChar(50), status || "Scheduled")
      .query(`
        INSERT INTO events (
          client_id,
          venue_id,
          event_name,
          event_date,
          start_time,
          end_time,
          expected_attendance,
          status
        )
        OUTPUT INSERTED.*
        VALUES (
          @client_id,
          @venue_id,
          @event_name,
          @event_date,
          @start_time,
          @end_time,
          @expected_attendance,
          @status
        );
      `);

    res.status(201).json(formatEvent(result.recordset[0]));
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ error: "Failed to create event" });
  }
};

// PUT /events/:eventId
const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const {
      client_id,
      venue_id,
      event_name,
      event_date,
      start_time,
      end_time,
      expected_attendance,
      status
    } = req.body;

    if (!client_id || !venue_id || !event_name || !event_date) {
      return res.status(400).json({
        error: "client_id, venue_id, event_name, and event_date are required"
      });
    }

    const pool = await poolPromise;

    const result = await pool.request()
      .input("eventId", sql.Int, eventId)
      .input("client_id", sql.Int, client_id)
      .input("venue_id", sql.Int, venue_id)
      .input("event_name", sql.VarChar(150), event_name)
      .input("event_date", sql.Date, event_date)
      .input("start_time", sql.VarChar(10), start_time || null)
      .input("end_time", sql.VarChar(10), end_time || null)
      .input("expected_attendance", sql.Int, expected_attendance || null)
      .input("status", sql.VarChar(50), status || "Scheduled")
      .query(`
        UPDATE events
        SET
          client_id = @client_id,
          venue_id = @venue_id,
          event_name = @event_name,
          event_date = @event_date,
          start_time = @start_time,
          end_time = @end_time,
          expected_attendance = @expected_attendance,
          status = @status
        OUTPUT INSERTED.*
        WHERE event_id = @eventId;
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.status(200).json(formatEvent(result.recordset[0]));
  } catch (err) {
    console.error("Error updating event:", err);
    res.status(500).json({ error: "Failed to update event" });
  }
};

// DELETE /events/:eventId
const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const pool = await poolPromise;

    const result = await pool.request()
      .input("eventId", sql.Int, eventId)
      .query(`
        DELETE FROM events
        OUTPUT DELETED.*
        WHERE event_id = @eventId;
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.status(200).json({
      message: "Event deleted successfully",
      deletedEvent: formatEvent(result.recordset[0])
    });
  } catch (err) {
    console.error("Error deleting event:", err);

    res.status(409).json({
      error: "Failed to delete event.",
      note: "This event may be connected to one or more services. Delete the related services first, then try deleting the event again."
    });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
};