const { poolPromise, sql } = require("../db/connection");
const {
  getCoordinates,
  getWeatherForecast
} = require("../services/weatherService");

// GET /events/:eventId/weather
const getEventWeather = async (req, res) => {
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
          v.venue_id,
          v.name AS venue_name,
          v.address,
          v.city,
          v.state,
          v.zip_code
        FROM events e
        JOIN venues v ON e.venue_id = v.venue_id
        WHERE e.event_id = @eventId;
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    const event = result.recordset[0];

    const location = [
      event.city,
      event.state,
      "United States"
    ]
      .filter(Boolean)
      .join(", ");

    console.log("Weather location being searched:", location);
    console.log("Event venue data:", event);

    if (!event.city) {
      return res.status(400).json({
        error: "Venue location is missing. Weather lookup requires a venue address, city, state, or zip code."
      });
    }

    const coordinates = await getCoordinates(event.city, event.state);

    const weather = await getWeatherForecast(
      coordinates.latitude,
      coordinates.longitude
    );

    res.status(200).json({
      event: {
        event_id: event.event_id,
        event_name: event.event_name,
        event_date: event.event_date,
        venue_id: event.venue_id,
        venue_name: event.venue_name,
        location
      },
      coordinates,
      weather
    });
  } catch (err) {
    console.error("Error getting event weather:", err);

    res.status(500).json({
      error: "Failed to retrieve weather for event",
      details: err.message
    });
  }
};

module.exports = {
  getEventWeather
};