const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@as-integrations/express5");

const { poolPromise } = require("./db/connection");

const eventRoutes = require("./routes/eventRoutes");
const clientRoutes = require("./routes/clientRoutes");
const venueRoutes = require("./routes/venueRoutes");

const typeDefs = require("./graphql/schema");
const resolvers = require("./graphql/resolvers");

const app = express();

async function startServer() {
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers
  });

  await apolloServer.start();

  app.use(cors());
  app.use(express.json());

  app.get("/", (req, res) => {
    res.json({ message: "Event Services Management API is running" });
  });

  app.get("/test-db", async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query("SELECT GETDATE() AS now");
      res.json(result.recordset);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database connection failed" });
    }
  });

  app.use("/events", eventRoutes);
  app.use("/clients", clientRoutes);
  app.use("/venues", venueRoutes);

  app.use("/graphql", expressMiddleware(apolloServer));

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`GraphQL available at http://localhost:${PORT}/graphql`);
  });
}

startServer();