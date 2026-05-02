const API_BASE_URL = window.location.origin;

// Tabs
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedTab = button.dataset.tab;

    tabButtons.forEach((btn) => btn.classList.remove("active"));
    tabContents.forEach((tab) => tab.classList.remove("active"));

    button.classList.add("active");
    document.getElementById(selectedTab).classList.add("active");
  });
});

// Weather
const eventIdInput = document.getElementById("eventIdInput");
const getWeatherBtn = document.getElementById("getWeatherBtn");
const weatherResult = document.getElementById("weatherResult");

// Buttons
const openClientFormBtn = document.getElementById("openClientFormBtn");
const openVenueFormBtn = document.getElementById("openVenueFormBtn");
const openEventFormBtn = document.getElementById("openEventFormBtn");
const openServiceFormBtn = document.getElementById("openServiceFormBtn");

const loadClientsBtn = document.getElementById("loadClientsBtn");
const loadVenuesBtn = document.getElementById("loadVenuesBtn");
const loadEventsBtn = document.getElementById("loadEventsBtn");
const loadServicesBtn = document.getElementById("loadServicesBtn");

const cancelClientFormBtn = document.getElementById("cancelClientFormBtn");
const cancelVenueFormBtn = document.getElementById("cancelVenueFormBtn");
const cancelEventFormBtn = document.getElementById("cancelEventFormBtn");
const cancelServiceFormBtn = document.getElementById("cancelServiceFormBtn");

// Lists
const clientsList = document.getElementById("clientsList");
const venuesList = document.getElementById("venuesList");
const eventsList = document.getElementById("eventsList");
const servicesList = document.getElementById("servicesList");

// Forms
const clientForm = document.getElementById("clientForm");
const venueForm = document.getElementById("venueForm");
const eventForm = document.getElementById("eventForm");
const serviceForm = document.getElementById("serviceForm");

// Hidden IDs
const clientIdHidden = document.getElementById("clientIdHidden");
const venueIdHidden = document.getElementById("venueIdHidden");
const eventIdHidden = document.getElementById("eventIdHidden");
const serviceIdHidden = document.getElementById("serviceIdHidden");

// Submit buttons
const clientSubmitBtn = document.getElementById("clientSubmitBtn");
const venueSubmitBtn = document.getElementById("venueSubmitBtn");
const eventSubmitBtn = document.getElementById("eventSubmitBtn");
const serviceSubmitBtn = document.getElementById("serviceSubmitBtn");

// Messages
const clientMessage = document.getElementById("clientMessage");
const venueMessage = document.getElementById("venueMessage");
const eventMessage = document.getElementById("eventMessage");
const serviceMessage = document.getElementById("serviceMessage");

// Event listeners
getWeatherBtn.addEventListener("click", getEventWeather);

openClientFormBtn.addEventListener("click", openAddClientForm);
openVenueFormBtn.addEventListener("click", openAddVenueForm);
openEventFormBtn.addEventListener("click", openAddEventForm);
openServiceFormBtn.addEventListener("click", openAddServiceForm);

loadClientsBtn.addEventListener("click", loadClients);
loadVenuesBtn.addEventListener("click", loadVenues);
loadEventsBtn.addEventListener("click", loadEvents);
loadServicesBtn.addEventListener("click", loadServices);

cancelClientFormBtn.addEventListener("click", closeClientForm);
cancelVenueFormBtn.addEventListener("click", closeVenueForm);
cancelEventFormBtn.addEventListener("click", closeEventForm);
cancelServiceFormBtn.addEventListener("click", closeServiceForm);

clientForm.addEventListener("submit", saveClient);
venueForm.addEventListener("submit", saveVenue);
eventForm.addEventListener("submit", saveEvent);
serviceForm.addEventListener("submit", saveService);

// Weather
function clearWeatherResults() {
  eventIdInput.value = "";
  weatherResult.innerHTML = `<p class="muted">Weather results will appear here.</p>`;
}

window.clearWeatherResults = clearWeatherResults;

async function getEventWeather() {
  const eventId = eventIdInput.value.trim();

  if (!eventId) {
    weatherResult.innerHTML = `
      <div class="weather-result-header">
        <div class="error">Please enter an event ID.</div>
        <button class="clear-weather-btn" onclick="clearWeatherResults()">&times;</button>
      </div>
    `;
    return;
  }

  weatherResult.innerHTML = `
    <div class="weather-result-header">
      <p class="muted">Loading weather data...</p>
      <button class="clear-weather-btn" onclick="clearWeatherResults()">&times;</button>
    </div>
  `;

  try {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/weather`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.details || "Failed to load weather data.");
    }

    const current = data.weather.current;
    const daily = data.weather.daily;

    weatherResult.innerHTML = `
      <div class="weather-result-header">
        <h3>${data.event.event_name}</h3>
        <button class="clear-weather-btn" onclick="clearWeatherResults()">&times;</button>
      </div>

      <div class="weather-card">
        <p><strong>Venue:</strong> ${data.event.venue_name}</p>
        <p><strong>Location Used:</strong> ${data.event.location || "N/A"}</p>
        <p><strong>Coordinates:</strong> ${data.coordinates.latitude}, ${data.coordinates.longitude}</p>

        <div class="weather-data">
          <div class="weather-stat">
            <strong>Current Temperature</strong>
            ${current.temperature_2m} °F
          </div>
          <div class="weather-stat">
            <strong>Precipitation</strong>
            ${current.precipitation} in
          </div>
          <div class="weather-stat">
            <strong>Wind Speed</strong>
            ${current.wind_speed_10m} mph
          </div>
          <div class="weather-stat">
            <strong>Today High / Low</strong>
            ${daily.temperature_2m_max[0]} °F / ${daily.temperature_2m_min[0]} °F
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    weatherResult.innerHTML = `
      <div class="weather-result-header">
        <div class="error">${error.message}</div>
        <button class="clear-weather-btn" onclick="clearWeatherResults()">&times;</button>
      </div>
    `;
  }
}

// Add form open/close
function openAddClientForm() {
  clientForm.reset();
  clientIdHidden.value = "";
  clientSubmitBtn.textContent = "Add Client";
  clientForm.classList.add("active");
}

function closeClientForm() {
  clientForm.reset();
  clientIdHidden.value = "";
  clientForm.classList.remove("active");
}

function openAddVenueForm() {
  venueForm.reset();
  venueIdHidden.value = "";
  venueSubmitBtn.textContent = "Add Venue";
  venueForm.classList.add("active");
}

function closeVenueForm() {
  venueForm.reset();
  venueIdHidden.value = "";
  venueForm.classList.remove("active");
}

function openAddEventForm() {
  eventForm.reset();
  eventIdHidden.value = "";
  document.getElementById("eventStatus").value = "Scheduled";
  eventSubmitBtn.textContent = "Add Event";
  eventForm.classList.add("active");
}

function closeEventForm() {
  eventForm.reset();
  eventIdHidden.value = "";
  eventForm.classList.remove("active");
}

function openAddServiceForm() {
  serviceForm.reset();
  serviceIdHidden.value = "";
  document.getElementById("serviceStatus").value = "Requested";
  serviceSubmitBtn.textContent = "Add Service";
  serviceForm.classList.add("active");
}

function closeServiceForm() {
  serviceForm.reset();
  serviceIdHidden.value = "";
  serviceForm.classList.remove("active");
}

// Clients
async function loadClients() {
  clearMessage(clientMessage);
  clientsList.innerHTML = `<p class="muted">Loading clients...</p>`;

  try {
    const response = await fetch(`${API_BASE_URL}/clients`);
    const data = await response.json();

    if (!response.ok) throw new Error(data.error || "Failed to load clients.");

    const clients = getArrayFromResponse(data, "clients");

    if (clients.length === 0) {
      clientsList.innerHTML = `<p class="muted">No clients found.</p>`;
      return;
    }

    clientsList.innerHTML = clients.map(client => `
      <div class="item">
        <h3>${client.name || "Unnamed Client"}</h3>
        <p><strong>Client ID:</strong> ${client.client_id}</p>
        <p><strong>Email:</strong> ${client.email || "N/A"}</p>
        <p><strong>Phone:</strong> ${client.phone || "N/A"}</p>

        <div class="actions">
          <button class="secondary-btn" onclick="editClient(${client.client_id}, '${escapeValue(client.name)}', '${escapeValue(client.email)}', '${escapeValue(client.phone)}')">Edit</button>
          <button class="delete-btn" onclick="deleteClient(${client.client_id})">Delete</button>
        </div>

        <div id="clientEditForm-${client.client_id}" class="inline-edit-box"></div>
      </div>
    `).join("");
  } catch (error) {
    clientsList.innerHTML = `<div class="error">${error.message}</div>`;
  }
}

async function saveClient(event) {
  event.preventDefault();

  const clientData = {
    name: document.getElementById("clientName").value,
    email: document.getElementById("clientEmail").value,
    phone: document.getElementById("clientPhone").value
  };

  try {
    await sendRequest("/clients", "POST", clientData);

    closeClientForm();
    await loadClients();
    showMessage(clientMessage, "success", "Client added successfully.");
  } catch (error) {
    showMessage(clientMessage, "error", error.message);
  }
}

function editClient(clientId, currentName, currentEmail, currentPhone) {
  const container = document.getElementById(`clientEditForm-${clientId}`);

  container.innerHTML = `
    <form class="inline-edit-form" onsubmit="saveClientInline(event, ${clientId})">
      <input type="text" id="editClientName-${clientId}" value="${escapeHtmlAttr(currentName)}" required />
      <input type="email" id="editClientEmail-${clientId}" value="${escapeHtmlAttr(currentEmail)}" required />
      <input type="text" id="editClientPhone-${clientId}" value="${escapeHtmlAttr(currentPhone)}" />
      <button type="submit">Save Changes</button>
      <button type="button" class="secondary-btn" onclick="closeInlineEdit('clientEditForm-${clientId}')">Cancel</button>
    </form>
  `;
}

async function saveClientInline(event, clientId) {
  event.preventDefault();

  const clientData = {
    name: document.getElementById(`editClientName-${clientId}`).value,
    email: document.getElementById(`editClientEmail-${clientId}`).value,
    phone: document.getElementById(`editClientPhone-${clientId}`).value
  };

  try {
    await sendRequest(`/clients/${clientId}`, "PUT", clientData);
    await loadClients();
    showMessage(clientMessage, "success", "Client updated successfully.");
  } catch (error) {
    showMessage(clientMessage, "error", error.message);
  }
}

async function deleteClient(clientId) {
  if (!confirm("Delete this client?")) return;

  try {
    await sendRequest(`/clients/${clientId}`, "DELETE");
    await loadClients();
    showMessage(clientMessage, "success", "Client deleted successfully.");
  } catch (error) {
    showMessage(clientMessage, "error", error.message);
  }
}

// Venues
async function loadVenues() {
  clearMessage(venueMessage);
  venuesList.innerHTML = `<p class="muted">Loading venues...</p>`;

  try {
    const response = await fetch(`${API_BASE_URL}/venues`);
    const data = await response.json();

    if (!response.ok) throw new Error(data.error || "Failed to load venues.");

    const venues = getArrayFromResponse(data, "venues");

    if (venues.length === 0) {
      venuesList.innerHTML = `<p class="muted">No venues found.</p>`;
      return;
    }

    venuesList.innerHTML = venues.map(venue => `
      <div class="item">
        <h3>${venue.name || "Unnamed Venue"}</h3>
        <p><strong>Venue ID:</strong> ${venue.venue_id}</p>
        <p><strong>Address:</strong> ${formatAddress(venue)}</p>
        <p><strong>Capacity:</strong> ${venue.capacity || "N/A"}</p>

        <div class="actions">
          <button class="secondary-btn" onclick="editVenue(${venue.venue_id}, '${escapeValue(venue.name)}', '${escapeValue(venue.address)}', '${escapeValue(venue.city)}', '${escapeValue(venue.state)}', '${escapeValue(venue.zip_code)}', '${venue.capacity || ""}')">Edit</button>
          <button class="delete-btn" onclick="deleteVenue(${venue.venue_id})">Delete</button>
        </div>

        <div id="venueEditForm-${venue.venue_id}" class="inline-edit-box"></div>
      </div>
    `).join("");
  } catch (error) {
    venuesList.innerHTML = `<div class="error">${error.message}</div>`;
  }
}

async function saveVenue(event) {
  event.preventDefault();

  const venueData = {
    name: document.getElementById("venueName").value,
    address: document.getElementById("venueAddress").value,
    city: document.getElementById("venueCity").value,
    state: document.getElementById("venueState").value,
    zip_code: document.getElementById("venueZip").value,
    capacity: Number(document.getElementById("venueCapacity").value) || null
  };

  try {
    await sendRequest("/venues", "POST", venueData);

    closeVenueForm();
    await loadVenues();
    showMessage(venueMessage, "success", "Venue added successfully.");
  } catch (error) {
    showMessage(venueMessage, "error", error.message);
  }
}

function editVenue(venueId, currentName, currentAddress, currentCity, currentState, currentZip, currentCapacity) {
  const container = document.getElementById(`venueEditForm-${venueId}`);

  container.innerHTML = `
    <form class="inline-edit-form" onsubmit="saveVenueInline(event, ${venueId})">
      <input type="text" id="editVenueName-${venueId}" value="${escapeHtmlAttr(currentName)}" required />
      <input type="text" id="editVenueAddress-${venueId}" value="${escapeHtmlAttr(currentAddress)}" required />
      <input type="text" id="editVenueCity-${venueId}" value="${escapeHtmlAttr(currentCity)}" required />
      <input type="text" id="editVenueState-${venueId}" value="${escapeHtmlAttr(currentState)}" required />
      <input type="text" id="editVenueZip-${venueId}" value="${escapeHtmlAttr(currentZip)}" />
      <input type="number" id="editVenueCapacity-${venueId}" value="${escapeHtmlAttr(currentCapacity)}" />
      <button type="submit">Save Changes</button>
      <button type="button" class="secondary-btn" onclick="closeInlineEdit('venueEditForm-${venueId}')">Cancel</button>
    </form>
  `;
}

async function saveVenueInline(event, venueId) {
  event.preventDefault();

  const venueData = {
    name: document.getElementById(`editVenueName-${venueId}`).value,
    address: document.getElementById(`editVenueAddress-${venueId}`).value,
    city: document.getElementById(`editVenueCity-${venueId}`).value,
    state: document.getElementById(`editVenueState-${venueId}`).value,
    zip_code: document.getElementById(`editVenueZip-${venueId}`).value,
    capacity: Number(document.getElementById(`editVenueCapacity-${venueId}`).value) || null
  };

  try {
    await sendRequest(`/venues/${venueId}`, "PUT", venueData);
    await loadVenues();
    showMessage(venueMessage, "success", "Venue updated successfully.");
  } catch (error) {
    showMessage(venueMessage, "error", error.message);
  }
}

async function deleteVenue(venueId) {
  if (!confirm("Delete this venue?")) return;

  try {
    await sendRequest(`/venues/${venueId}`, "DELETE");
    await loadVenues();
    showMessage(venueMessage, "success", "Venue deleted successfully.");
  } catch (error) {
    showMessage(venueMessage, "error", error.message);
  }
}

// Events
async function loadEvents() {
  clearMessage(eventMessage);
  eventsList.innerHTML = `<p class="muted">Loading events...</p>`;

  try {
    const response = await fetch(`${API_BASE_URL}/events`);
    const data = await response.json();

    if (!response.ok) throw new Error(data.error || "Failed to load events.");

    const events = getArrayFromResponse(data, "events");

    if (events.length === 0) {
      eventsList.innerHTML = `<p class="muted">No events found.</p>`;
      return;
    }

    eventsList.innerHTML = events.map(event => `
      <div class="item">
        <h3>${event.event_name || "Unnamed Event"}</h3>
        <p><strong>Event ID:</strong> ${event.event_id}</p>
        <p><strong>Date:</strong> ${formatDate(event.event_date)}</p>
        <p><strong>Start Time:</strong> ${event.start_time || "N/A"}</p>
        <p><strong>End Time:</strong> ${event.end_time || "N/A"}</p>
        <p><strong>Expected Attendance:</strong> ${event.expected_attendance || "N/A"}</p>
        <p><strong>Status:</strong> ${event.status || "N/A"}</p>
        <p><strong>Client:</strong> ${event.client_name || event.client_id || "N/A"}</p>
        <p><strong>Venue:</strong> ${event.venue_name || event.venue_id || "N/A"}</p>

        <div class="actions">
          <button class="secondary-btn" onclick="editEvent(${event.event_id}, '${escapeValue(event.event_name)}', '${formatInputDate(event.event_date)}', '${escapeValue(event.start_time)}', '${escapeValue(event.end_time)}', '${event.expected_attendance || ""}', '${escapeValue(event.status)}', '${event.client_id}', '${event.venue_id}')">Edit</button>
          <button class="delete-btn" onclick="deleteEvent(${event.event_id})">Delete</button>
        </div>

        <div id="eventEditForm-${event.event_id}" class="inline-edit-box"></div>
      </div>
    `).join("");
  } catch (error) {
    eventsList.innerHTML = `<div class="error">${error.message}</div>`;
  }
}

async function saveEvent(event) {
  event.preventDefault();

  const eventData = {
    event_name: document.getElementById("eventName").value,
    event_date: document.getElementById("eventDate").value,
    start_time: document.getElementById("startTime").value || null,
    end_time: document.getElementById("endTime").value || null,
    expected_attendance: Number(document.getElementById("expectedAttendance").value) || null,
    status: document.getElementById("eventStatus").value || "Scheduled",
    client_id: Number(document.getElementById("eventClientId").value),
    venue_id: Number(document.getElementById("eventVenueId").value)
  };

  try {
    await sendRequest("/events", "POST", eventData);

    closeEventForm();
    await loadEvents();
    showMessage(eventMessage, "success", "Event added successfully.");
  } catch (error) {
    showMessage(eventMessage, "error", error.message);
  }
}

function editEvent(eventId, currentName, currentDate, currentStart, currentEnd, currentAttendance, currentStatus, currentClientId, currentVenueId) {
  const container = document.getElementById(`eventEditForm-${eventId}`);

  container.innerHTML = `
    <form class="inline-edit-form" onsubmit="saveEventInline(event, ${eventId})">
      <input type="text" id="editEventName-${eventId}" value="${escapeHtmlAttr(currentName)}" required />
      <input type="date" id="editEventDate-${eventId}" value="${escapeHtmlAttr(currentDate)}" required />
      <input type="time" id="editStartTime-${eventId}" value="${escapeHtmlAttr(currentStart)}" />
      <input type="time" id="editEndTime-${eventId}" value="${escapeHtmlAttr(currentEnd)}" />
      <input type="number" id="editExpectedAttendance-${eventId}" value="${escapeHtmlAttr(currentAttendance)}" />
      <input type="text" id="editEventStatus-${eventId}" value="${escapeHtmlAttr(currentStatus)}" />
      <input type="number" id="editEventClientId-${eventId}" value="${escapeHtmlAttr(currentClientId)}" required />
      <input type="number" id="editEventVenueId-${eventId}" value="${escapeHtmlAttr(currentVenueId)}" required />
      <button type="submit">Save Changes</button>
      <button type="button" class="secondary-btn" onclick="closeInlineEdit('eventEditForm-${eventId}')">Cancel</button>
    </form>
  `;
}

async function saveEventInline(event, eventId) {
  event.preventDefault();

  const eventData = {
    event_name: document.getElementById(`editEventName-${eventId}`).value,
    event_date: document.getElementById(`editEventDate-${eventId}`).value,
    start_time: document.getElementById(`editStartTime-${eventId}`).value || null,
    end_time: document.getElementById(`editEndTime-${eventId}`).value || null,
    expected_attendance: Number(document.getElementById(`editExpectedAttendance-${eventId}`).value) || null,
    status: document.getElementById(`editEventStatus-${eventId}`).value || "Scheduled",
    client_id: Number(document.getElementById(`editEventClientId-${eventId}`).value),
    venue_id: Number(document.getElementById(`editEventVenueId-${eventId}`).value)
  };

  try {
    await sendRequest(`/events/${eventId}`, "PUT", eventData);
    await loadEvents();
    showMessage(eventMessage, "success", "Event updated successfully.");
  } catch (error) {
    showMessage(eventMessage, "error", error.message);
  }
}

async function deleteEvent(eventId) {
  if (!confirm("Delete this event?")) return;

  try {
    await sendRequest(`/events/${eventId}`, "DELETE");
    await loadEvents();
    showMessage(eventMessage, "success", "Event deleted successfully.");
  } catch (error) {
    showMessage(eventMessage, "error", error.message);
  }
}

// Services
async function loadServices() {
  clearMessage(serviceMessage);
  servicesList.innerHTML = `<p class="muted">Loading services...</p>`;

  try {
    const response = await fetch(`${API_BASE_URL}/services`);
    const data = await response.json();

    if (!response.ok) throw new Error(data.error || "Failed to load services.");

    const services = getArrayFromResponse(data, "services");

    if (services.length === 0) {
      servicesList.innerHTML = `<p class="muted">No services found.</p>`;
      return;
    }

    servicesList.innerHTML = services.map(service => `
      <div class="item">
        <h3>${service.service_name || "Unnamed Service"}</h3>
        <p><strong>Service ID:</strong> ${service.service_id}</p>
        <p><strong>Event ID:</strong> ${service.event_id}</p>
        <p><strong>Event:</strong> ${service.event_name || "N/A"}</p>
        <p><strong>Description:</strong> ${service.description || "N/A"}</p>
        <p><strong>Status:</strong> ${service.status || "N/A"}</p>

        <div class="actions">
          <button class="secondary-btn" onclick="editService(${service.service_id}, '${service.event_id}', '${escapeValue(service.service_name)}', '${escapeValue(service.description)}', '${escapeValue(service.status)}')">Edit</button>
          <button class="delete-btn" onclick="deleteService(${service.service_id})">Delete</button>
        </div>

        <div id="serviceEditForm-${service.service_id}" class="inline-edit-box"></div>
      </div>
    `).join("");
  } catch (error) {
    servicesList.innerHTML = `<div class="error">${error.message}</div>`;
  }
}

async function saveService(event) {
  event.preventDefault();

  const serviceData = {
    event_id: Number(document.getElementById("serviceEventId").value),
    service_name: document.getElementById("serviceName").value,
    description: document.getElementById("serviceDescription").value,
    status: document.getElementById("serviceStatus").value || "Requested"
  };

  try {
    await sendRequest("/services", "POST", serviceData);

    closeServiceForm();
    await loadServices();
    showMessage(serviceMessage, "success", "Service added successfully.");
  } catch (error) {
    showMessage(serviceMessage, "error", error.message);
  }
}

function editService(serviceId, currentEventId, currentName, currentDescription, currentStatus) {
  const container = document.getElementById(`serviceEditForm-${serviceId}`);

  container.innerHTML = `
    <form class="inline-edit-form" onsubmit="saveServiceInline(event, ${serviceId})">
      <input type="number" id="editServiceEventId-${serviceId}" value="${escapeHtmlAttr(currentEventId)}" required />
      <input type="text" id="editServiceName-${serviceId}" value="${escapeHtmlAttr(currentName)}" required />
      <input type="text" id="editServiceDescription-${serviceId}" value="${escapeHtmlAttr(currentDescription)}" />
      <input type="text" id="editServiceStatus-${serviceId}" value="${escapeHtmlAttr(currentStatus)}" />
      <button type="submit">Save Changes</button>
      <button type="button" class="secondary-btn" onclick="closeInlineEdit('serviceEditForm-${serviceId}')">Cancel</button>
    </form>
  `;
}

async function saveServiceInline(event, serviceId) {
  event.preventDefault();

  const serviceData = {
    event_id: Number(document.getElementById(`editServiceEventId-${serviceId}`).value),
    service_name: document.getElementById(`editServiceName-${serviceId}`).value,
    description: document.getElementById(`editServiceDescription-${serviceId}`).value,
    status: document.getElementById(`editServiceStatus-${serviceId}`).value || "Requested"
  };

  try {
    await sendRequest(`/services/${serviceId}`, "PUT", serviceData);
    await loadServices();
    showMessage(serviceMessage, "success", "Service updated successfully.");
  } catch (error) {
    showMessage(serviceMessage, "error", error.message);
  }
}

async function deleteService(serviceId) {
  if (!confirm("Delete this service?")) return;

  try {
    await sendRequest(`/services/${serviceId}`, "DELETE");
    await loadServices();
    showMessage(serviceMessage, "success", "Service deleted successfully.");
  } catch (error) {
    showMessage(serviceMessage, "error", error.message);
  }
}

// Helpers

async function sendRequest(path, method, body) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json"
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const data = await response.json();

  if (!response.ok) {
    let message = data.error || "Request failed.";

    if (data.note) {
      message += ` ${data.note}`;
    }

    if (data.details) {
      message += ` Details: ${data.details}`;
    }

    throw new Error(message);
  }

  return data;
}

function getArrayFromResponse(data, key) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data[key])) return data[key];
  if (Array.isArray(data.data)) return data.data;
  if (data.data && Array.isArray(data.data[key])) return data.data[key];
  if (Array.isArray(data.recordset)) return data.recordset;
  return [];
}

function showMessage(messageBox, type, message) {
  messageBox.innerHTML = `
    <div class="${type} dismissible-message">
      <span>${message}</span>
      <button type="button" class="message-close-btn" onclick="this.parentElement.remove()">
        &times;
      </button>
    </div>
  `;
}

function clearMessage(messageBox) {
  messageBox.innerHTML = "";
}

function closeInlineEdit(containerId) {
  document.getElementById(containerId).innerHTML = "";
}

function formatDate(dateValue) {
  if (!dateValue) return "N/A";
  return new Date(dateValue).toLocaleDateString();
}

function formatInputDate(dateValue) {
  if (!dateValue) return "";
  return new Date(dateValue).toISOString().split("T")[0];
}

function formatAddress(venue) {
  return [
    venue.address,
    venue.city,
    venue.state,
    venue.zip_code
  ].filter(Boolean).join(", ") || "N/A";
}

function escapeValue(value) {
  if (value === null || value === undefined) return "";

  return String(value)
    .replaceAll("\\", "\\\\")
    .replaceAll("'", "\\'")
    .replaceAll("\n", " ");
}

function escapeHtmlAttr(value) {
  if (value === null || value === undefined) return "";

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}