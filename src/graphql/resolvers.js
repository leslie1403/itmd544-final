const { poolPromise, sql } = require("../db/connection");

const formatDate = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    return value.toISOString().split("T")[0];
  }

  if (!isNaN(value)) {
    return new Date(Number(value)).toISOString().split("T")[0];
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

const formatEventTimes = (event) => {
  if (!event) return null;

  event.event_date = formatDate(event.event_date);
  event.start_time = formatTime(event.start_time);
  event.end_time = formatTime(event.end_time);

  return event;
};

const resolvers = {
  Query: {
    clients: async () => {
      const pool = await poolPromise;

      const result = await pool.request().query(`
        SELECT client_id, name, email, phone, created_at
        FROM clients
        ORDER BY client_id;
      `);

      return result.recordset;
    },

    venues: async () => {
      const pool = await poolPromise;

      const result = await pool.request().query(`
        SELECT venue_id, name, address, city, state, zip_code, capacity, created_at
        FROM venues
        ORDER BY venue_id;
      `);

      return result.recordset;
    },

    events: async () => {
      const pool = await poolPromise;

      const result = await pool.request().query(`
        SELECT 
          event_id,
          client_id,
          venue_id,
          event_name,
          event_date,
          start_time,
          end_time,
          expected_attendance,
          status,
          created_at
        FROM events
        ORDER BY event_date;
      `);

      return result.recordset.map(formatEventTimes);
    },

    client: async (_, { id }) => {
      const pool = await poolPromise;

      const result = await pool.request()
        .input("id", sql.Int, id)
        .query(`
          SELECT client_id, name, email, phone, created_at
          FROM clients
          WHERE client_id = @id;
        `);

      return result.recordset[0] || null;
    },

    venue: async (_, { id }) => {
      const pool = await poolPromise;

      const result = await pool.request()
        .input("id", sql.Int, id)
        .query(`
          SELECT venue_id, name, address, city, state, zip_code, capacity, created_at
          FROM venues
          WHERE venue_id = @id;
        `);

      return result.recordset[0] || null;
    },

    event: async (_, { id }) => {
      const pool = await poolPromise;

      const result = await pool.request()
        .input("id", sql.Int, id)
        .query(`
          SELECT 
            event_id,
            client_id,
            venue_id,
            event_name,
            event_date,
            start_time,
            end_time,
            expected_attendance,
            status,
            created_at
          FROM events
          WHERE event_id = @id;
        `);

      return formatEventTimes(result.recordset[0]);
    }
  },

  Event: {
    client: async (parent) => {
      const pool = await poolPromise;

      const result = await pool.request()
        .input("client_id", sql.Int, parent.client_id)
        .query(`
          SELECT client_id, name, email, phone, created_at
          FROM clients
          WHERE client_id = @client_id;
        `);

      return result.recordset[0] || null;
    },

    venue: async (parent) => {
      const pool = await poolPromise;

      const result = await pool.request()
        .input("venue_id", sql.Int, parent.venue_id)
        .query(`
          SELECT venue_id, name, address, city, state, zip_code, capacity, created_at
          FROM venues
          WHERE venue_id = @venue_id;
        `);

      return result.recordset[0] || null;
    }
  },

  Mutation: {
    createEvent: async (_, args) => {
      const pool = await poolPromise;

      const result = await pool.request()
        .input("client_id", sql.Int, args.client_id)
        .input("venue_id", sql.Int, args.venue_id)
        .input("event_name", sql.VarChar(150), args.event_name)
        .input("event_date", sql.Date, args.event_date)
        .input("start_time", sql.VarChar(10), args.start_time || null)
        .input("end_time", sql.VarChar(10), args.end_time || null)
        .input("expected_attendance", sql.Int, args.expected_attendance || null)
        .input("status", sql.VarChar(50), args.status || "Scheduled")
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

      return formatEventTimes(result.recordset[0]);
    },

    updateEvent: async (_, args) => {
      const pool = await poolPromise;

      const result = await pool.request()
        .input("event_id", sql.Int, args.event_id)
        .input("client_id", sql.Int, args.client_id)
        .input("venue_id", sql.Int, args.venue_id)
        .input("event_name", sql.VarChar(150), args.event_name)
        .input("event_date", sql.Date, args.event_date)
        .input("start_time", sql.VarChar(10), args.start_time || null)
        .input("end_time", sql.VarChar(10), args.end_time || null)
        .input("expected_attendance", sql.Int, args.expected_attendance || null)
        .input("status", sql.VarChar(50), args.status || "Scheduled")
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
          WHERE event_id = @event_id;
        `);

      return formatEventTimes(result.recordset[0]);
    },

    deleteEvent: async (_, { event_id }) => {
      const pool = await poolPromise;

      const result = await pool.request()
        .input("event_id", sql.Int, event_id)
        .query(`
          DELETE FROM events
          OUTPUT DELETED.*
          WHERE event_id = @event_id;
        `);

      return formatEventTimes(result.recordset[0]);
    }
  }
};

module.exports = resolvers;