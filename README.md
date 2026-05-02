# ITMD 544 Final Assignment - Event Management Dashboard

Live Link: https://itmd544-final-axe9ekanh2fpceg3.westus2-01.azurewebsites.net/

Github Repo Link: https://github.com/leslie1403/itmd544-final 

## Project Overview

This project is a backend-focused event management system. The application allows users to manage clients, venues, events, and services. It includes REST API endpoints, a GraphQL endpoint, a SQL database, a simple frontend dashboard, logging, Docker support, and an external weather API integration using Open-Meteo.

## Technology Stack

- Backend: Node.js, Express.js
- API: REST and GraphQL with Apollo Server
- Database: SQL Server
- Frontend: HTML, CSS, JavaScript
- External API: Open-Meteo Weather API
- Logging: Morgan
- Containerization: Docker
- Deployment: Azure Web App with continuous deployment from GitHub

## System Architecture

The application uses an Express backend connected to a SQL Server database. The frontend is served from the same Express application at `/frontend`. REST endpoints handle CRUD operations, GraphQL provides an additional API interface, and the Open-Meteo API provides weather data for event locations.

Basic flow:

    Frontend Dashboard → Express Backend → SQL Server Database
                              ↓
                       Open-Meteo Weather API

## Database Design

The database uses four connected tables:

- `clients`
- `venues`
- `events`
- `services`

Clients and venues are connected to events. Services are connected to events. This creates related data across the system and helps maintain data integrity through foreign key constraints.

Basic relationship:

    clients → events ← venues
    events → services

## API Features

The backend includes REST API routes and a GraphQL endpoint. The REST API supports CRUD operations for clients, venues, events, and services. The API also includes a weather endpoint that retrieves weather data for an event venue location.

Main API features include:

- Create, read, update, and delete clients, venues, events, and services
- Retrieve weather data for an event location
- Query related data through GraphQL
- Return helpful error messages for invalid requests or protected records

## REST API Endpoints

### Clients

| Method | Endpoint | Description |
|---|---|---|
| GET | `/clients` | Gets all clients |
| GET | `/clients/:clientId` | Gets one client by ID |
| POST | `/clients` | Creates a new client |
| PUT | `/clients/:clientId` | Updates an existing client |
| DELETE | `/clients/:clientId` | Deletes a client if it is not connected to existing events |

### Venues

| Method | Endpoint | Description |
|---|---|---|
| GET | `/venues` | Gets all venues |
| GET | `/venues/:venueId` | Gets one venue by ID |
| POST | `/venues` | Creates a new venue |
| PUT | `/venues/:venueId` | Updates an existing venue |
| DELETE | `/venues/:venueId` | Deletes a venue if it is not connected to existing events |

### Events

| Method | Endpoint | Description |
|---|---|---|
| GET | `/events` | Gets all events |
| GET | `/events/:eventId` | Gets one event by ID |
| POST | `/events` | Creates a new event |
| PUT | `/events/:eventId` | Updates an existing event |
| DELETE | `/events/:eventId` | Deletes an event if it is not connected to existing services |
| GET | `/events/:eventId/weather` | Gets weather data for the event venue location |

### Services

| Method | Endpoint | Description |
|---|---|---|
| GET | `/services` | Gets all services |
| GET | `/services/:serviceId` | Gets one service by ID |
| POST | `/services` | Creates a new service |
| PUT | `/services/:serviceId` | Updates an existing service |
| DELETE | `/services/:serviceId` | Deletes a service |

## GraphQL

The project includes a GraphQL endpoint at `/graphql`.

GraphQL can be used to query clients, venues, events, and services from one interface. It also supports mutations for creating, updating, and deleting records.

## External API Integration

The project uses the Open-Meteo API to retrieve weather data for event locations. When a user requests weather for an event, the backend looks up the event, finds the connected venue, uses the venue city and state to get coordinates, and then requests weather data from Open-Meteo.

Weather endpoint:

    GET /events/:eventId/weather

## Frontend

The frontend dashboard is available at `/frontend`.

The frontend allows users to:

- Load clients, venues, events, and services
- Add new records
- Edit records directly inside their cards
- Delete records
- View success and error notifications
- Look up weather information by event ID

## Logging

The application uses Morgan for request logging. Logs are printed in the terminal while the server is running and are also saved to a log file.

Log file location: `logs/access.log`

This helps track requests made to the REST API, GraphQL endpoint, frontend route, and weather endpoint.

## Docker

The project includes Docker support through a `Dockerfile` and `.dockerignore` file. Docker can be used to build and run the application in a containerized environment.

Build the Docker image:

    docker build -t event-management-final .

Run the Docker container:

    docker run -p 3000:3000 --env-file .env event-management-final

## Setup Instructions

Install dependencies:

    npm install

Create a `.env` file with the required database connection variables. The application requires a working SQL Server database connection.

Start the server:

    npm run dev

Open the app locally:

- `http://localhost:3000`
- `http://localhost:3000/frontend`
- `http://localhost:3000/graphql`

## Database Setup

The database is hosted in SQL Server. The required tables were created directly in the database using SQL queries. The application expects four main tables:

- `clients`
- `venues`
- `events`
- `services`

The sample data can be reset by deleting records in the correct order, resetting the identity values, and then rerunning the seed inserts.

### Reset Database Records

Run this query before rerunning the seed data:

    DELETE FROM services;
    DELETE FROM events;
    DELETE FROM venues;
    DELETE FROM clients;

    DBCC CHECKIDENT ('services', RESEED, 0);
    DBCC CHECKIDENT ('events', RESEED, 0);
    DBCC CHECKIDENT ('venues', RESEED, 0);
    DBCC CHECKIDENT ('clients', RESEED, 0);

### Seed Data

Run this query after the reset query:

    INSERT INTO clients (name, email, phone)
    VALUES
    ('Bob Senior', 'bob.senior@example.com', '312-123-1234'),
    ('Bob Jr', 'bob.jr@example.com', '312-123-5678'),
    ('Bob Inc', 'bob.inc@example.com', '312-123-9012');

    INSERT INTO venues (name, address, city, state, zip_code, capacity)
    VALUES
    ('Chicago Cultural Center', '78 E. Washington St.', 'Chicago', 'IL', '60602', 400),
    ('Chicago Botanic Garden', '1000 Lake Cook Road', 'Glencoe', 'IL', '60022', 300),
    ('Field Museum', '1400 S. DuSable Lake Shore Drive', 'Chicago', 'IL', '60605', 500);

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
    VALUES
    (1, 1, 'Wedding Ceremony and Reception', '2026-06-20', '16:00', '22:00', 180, 'Scheduled'),
    (2, 2, 'Annual Fundraising Banquet', '2026-07-12', '17:30', '21:30', 220, 'Scheduled'),
    (3, 3, 'Midwest Innovation Conference', '2026-08-05', '09:00', '17:00', 350, 'Scheduled');

    INSERT INTO services (
        event_id,
        service_name,
        description,
        status
    )
    VALUES
    (1, 'Audio/Visual Support', 'Microphones, speakers, projector, and presentation support for the ceremony and reception.', 'Requested'),
    (1, 'Room Setup', 'Ceremony seating, reception tables, staging, and general event layout setup.', 'Confirmed'),
    (2, 'Catering Coordination', 'Coordinate banquet meal service and food setup with the catering team.', 'Requested'),
    (2, 'Lighting Support', 'Provide lighting setup and support for the fundraising banquet program.', 'Confirmed'),
    (3, 'Registration Support', 'Set up registration tables and check-in support for conference attendees.', 'Requested'),
    (3, 'Presentation Technology', 'Provide projector, screen, microphones, and laptop connection support for conference sessions.', 'Confirmed');

## Known Behavior

Some seeded clients and venues cannot be deleted until their related events and services are deleted first. This is expected behavior because the database uses foreign key constraints to protect related records. This protects the integrity of the records and helps keep the database consistent.

## Testing

The API can be tested using the frontend, browser routes, GraphQL interface, and Postman collection.

Main routes to test:

- `/`
- `/frontend`
- `/clients`
- `/venues`
- `/events`
- `/services`
- `/events/1/weather`
- `/graphql`

## Deployment

The application is deployed using Azure Web App with continuous deployment from GitHub. When changes are pushed to the repository, Azure automatically redeploys the application.

## Future Improvements

- Add user authentication
- Add user roles and admin permissions
- Improve frontend form validation
- Add more event scheduling features
- Add more external API integrations
- Add more advanced reporting and filtering
