// Step 1: Install the necessary package
// Run the following command in your terminal:
// npm install socket.io-client sqlite3

// Step 2: Import the required module
const io = require('socket.io-client');
const sqlite3 = require('sqlite3').verbose();

// Step 3: Open a connection to the specified URL with the correct path
const socket = io('https://api.brandmeister.network', {
  path: '/lh/socket.io'
});

// Step 4: Set up the SQLite database
const db = new sqlite3.Database('./brandmeister.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS lastheard (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    Timestamp TEXT,
    LinkName TEXT,
    SessionID TEXT,
    LinkType INTEGER,
    ContextID INTEGER,
    SessionType INTEGER,
    Slot INTEGER,
    SourceID INTEGER,
    DestinationID INTEGER,
    Route TEXT,
    LinkCall TEXT,
    SourceCall TEXT,
    SourceName TEXT,
    DestinationCall TEXT,
    DestinationName TEXT,
    State INTEGER,
    Start INTEGER,
    Stop INTEGER,
    RSSI TEXT,
    BER REAL,
    ReflectorID INTEGER,
    LinkTypeName TEXT,
    CallTypes TEXT,
    LossCount INTEGER,
    TotalCount INTEGER,
    Master TEXT,
    TalkerAlias TEXT,
    FlagSet INTEGER,
    Event TEXT,
    Duration REAL
  )`);
});

// Step 4: Listen for events from the socket and handle the incoming data
socket.on('connect', () => {
  console.log('Connected to the socket.io server');
});

socket.onAny((event, data) => {
  try {
    // Step 5: Extract the payload from the events
    const payload = data.payload;

    // Step 6: Convert the payload to JSON
    const jsonPayload = JSON.parse(payload);

    // Ignore data where the field "Stop" equals 0
    if (jsonPayload.Stop === 0) {
      return;
    }

    // Step 7: Add a Duration field to the JSON
    if (jsonPayload.Start && jsonPayload.Stop) {
      const start = new Date(jsonPayload.Start);
      const stop = new Date(jsonPayload.Stop);
      jsonPayload.Duration = (stop - start); // Duration in seconds

      // Ignore data where duration is less than 5 seconds
      if (jsonPayload.Duration < 5) {
        return;
      }
    }

    // Add the current timestamp to the JSON payload
    jsonPayload.Timestamp = new Date().toISOString();

    // Ignore data where "Group" is not in CallTypes
    if (!jsonPayload.CallTypes || !jsonPayload.CallTypes.includes("Group")) {
      return;
    }

    // Step 8: Output the JSON payload to stdout
    console.log(`Received event: ${event}`);
    console.log('Payload:', JSON.stringify(jsonPayload, null, 2));
  } catch (error) {
    console.error('Error processing data:', error);
  }
});

socket.on('disconnect', () => {
  console.log('Disconnected from the socket.io server');
});