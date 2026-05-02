const typeDefs = `#graphql
  type Client {
    client_id: ID!
    name: String!
    email: String!
    phone: String
    created_at: String
  }

  type Venue {
    venue_id: ID!
    name: String!
    address: String!
    city: String!
    state: String!
    zip_code: String
    capacity: Int!
    created_at: String
  }

  type Event {
    event_id: ID!
    client_id: ID!
    venue_id: ID!
    event_name: String!
    event_date: String!
    start_time: String
    end_time: String
    expected_attendance: Int
    status: String
    created_at: String
    client: Client
    venue: Venue
    services: [Service]
  }

  type Service {
    service_id: ID!
    event_id: ID!
    service_name: String!
    description: String
    status: String
    created_at: String
    event: Event
  }

  type Query {
    clients: [Client]
    venues: [Venue]
    events: [Event]
    services: [Service]

    client(id: ID!): Client
    venue(id: ID!): Venue
    event(id: ID!): Event
    service(id: ID!): Service
  }

  type Mutation {
    createEvent(
      client_id: ID!
      venue_id: ID!
      event_name: String!
      event_date: String!
      start_time: String
      end_time: String
      expected_attendance: Int
      status: String
    ): Event

    updateEvent(
      event_id: ID!
      client_id: ID!
      venue_id: ID!
      event_name: String!
      event_date: String!
      start_time: String
      end_time: String
      expected_attendance: Int
      status: String
    ): Event

    deleteEvent(event_id: ID!): Event

    createService(
      event_id: ID!
      service_name: String!
      description: String
      status: String
    ): Service

    updateService(
      service_id: ID!
      event_id: ID!
      service_name: String!
      description: String
      status: String
    ): Service

    deleteService(service_id: ID!): Service
  }
`;

module.exports = typeDefs;