const { poolPromise, sql } = require("../db/connection");

// GET /clients
const getAllClients = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT 
        client_id,
        name,
        email,
        phone,
        created_at
      FROM clients
      ORDER BY client_id;
    `);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("Error getting clients:", err);
    res.status(500).json({ error: "Failed to retrieve clients" });
  }
};

// GET /clients/:clientId
const getClientById = async (req, res) => {
  try {
    const { clientId } = req.params;

    const pool = await poolPromise;

    const result = await pool.request()
      .input("clientId", sql.Int, clientId)
      .query(`
        SELECT 
          client_id,
          name,
          email,
          phone,
          created_at
        FROM clients
        WHERE client_id = @clientId;
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Client not found" });
    }

    res.status(200).json(result.recordset[0]);
  } catch (err) {
    console.error("Error getting client:", err);
    res.status(500).json({ error: "Failed to retrieve client" });
  }
};

// POST /clients
const createClient = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        error: "Client name and email are required"
      });
    }

    const pool = await poolPromise;

    const result = await pool.request()
      .input("name", sql.VarChar(100), name)
      .input("email", sql.VarChar(150), email)
      .input("phone", sql.VarChar(50), phone || null)
      .query(`
        INSERT INTO clients (name, email, phone)
        OUTPUT 
          INSERTED.client_id,
          INSERTED.name,
          INSERTED.email,
          INSERTED.phone,
          INSERTED.created_at
        VALUES (@name, @email, @phone);
      `);

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error("Error creating client:", err);

    if (err.message && err.message.includes("UNIQUE")) {
      return res.status(400).json({
        error: "A client with this email already exists"
      });
    }

    res.status(500).json({ error: "Failed to create client" });
  }
};

// PUT /clients/:clientId
const updateClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { name, email, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        error: "Client name and email are required"
      });
    }

    const pool = await poolPromise;

    const result = await pool.request()
      .input("clientId", sql.Int, clientId)
      .input("name", sql.VarChar(100), name)
      .input("email", sql.VarChar(150), email)
      .input("phone", sql.VarChar(50), phone || null)
      .query(`
        UPDATE clients
        SET 
          name = @name,
          email = @email,
          phone = @phone
        OUTPUT 
          INSERTED.client_id,
          INSERTED.name,
          INSERTED.email,
          INSERTED.phone,
          INSERTED.created_at
        WHERE client_id = @clientId;
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Client not found" });
    }

    res.status(200).json(result.recordset[0]);
  } catch (err) {
    console.error("Error updating client:", err);
    res.status(500).json({ error: "Failed to update client" });
  }
};

const deleteClient = async (req, res) => {
  try {
    const { clientId } = req.params;

    const pool = await poolPromise;

    const result = await pool.request()
      .input("clientId", sql.Int, clientId)
      .query(`
        DELETE FROM clients
        OUTPUT 
          DELETED.client_id,
          DELETED.name,
          DELETED.email,
          DELETED.phone
        WHERE client_id = @clientId;
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Client not found" });
    }

    res.status(200).json({
      message: "Client deleted successfully",
      deletedClient: result.recordset[0]
    });
  } catch (err) {
    console.error("Error deleting client:", err);

    res.status(409).json({
      error: "Failed to delete client.",
      note: "This client is connected to one or more events. Delete or update the related events first, then try deleting the client again."
    });
  }
};

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
};