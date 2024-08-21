// Step 1: Set up a new Node.js project
// Run the following commands in your terminal:
// npm init -y
// npm install express sqlite3

// Step 2: Create the SQLite database and table
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./lastheard.db'); // Persist the database to disk

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS lastheard (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      linkname VARCHAR(90),
      sessionid UUID,
      linktype INTEGER,
      contextid INTEGER,
      sessiontype INTEGER,
      slot INTEGER,
      sourceid INTEGER,
      destinationid INTEGER,
      route VARCHAR(12),
      linkcall VARCHAR(50),
      sourcecall VARCHAR(50),
      sourcename VARCHAR(100),
      destinationcall VARCHAR(3),
      destinationname VARCHAR(100),
      state INTEGER,
      start BIGINT,
      stop BIGINT,
      rssi INTEGER,
      ber DOUBLE PRECISION,
      reflectorid INTEGER,
      linktypename VARCHAR(24),
      losscount INTEGER,
      totalcount INTEGER,
      master INTEGER,
      talkeralias VARCHAR(45),
      flagset INTEGER,
      event VARCHAR(36),
      duration INTEGER
    )
  `);
});

// Step 3: Create an Express server
const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

// Step 4: Create a POST endpoint to receive data
app.post('/data', (req, res) => {
  const data = req.body;
  const query = `
    INSERT INTO lastheard (
      linkname, sessionid, linktype, contextid, sessiontype, slot, sourceid, destinationid, route, linkcall, sourcecall, sourcename, destinationcall, destinationname, state, start, stop, rssi, ber, reflectorid, linktypename, losscount, totalcount, master, talkeralias, flagset, event, duration
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    data.LinkName, data.SessionID, data.LinkType, data.ContextID, data.SessionType, data.Slot, data.SourceID, data.DestinationID, data.Route, data.LinkCall, data.SourceCall, data.SourceName, data.DestinationCall, data.DestinationName, data.State, data.Start, data.Stop, data.RSSI, data.BER, data.ReflectorID, data.LinkTypeName, data.LossCount, data.TotalCount, data.Master, data.TalkerAlias, data.FlagSet, data.Event, data.Duration
  ];

  db.run(query, params, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID });
  });


  // Step 6: Add an endpoint to display the last 10 records as an HTML page
app.get('/last', (req, res) => {
  const query = `
    SELECT * FROM lastheard
    ORDER BY id DESC
    LIMIT 100
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    let html = `
      <html>
      <head>
        <title>Last Records</title>
        <meta http-equiv="refresh" content="10">
      </head>
      <body>
        <h1>Last Records</h1>
        <table border="1">
          <tr>
            <th>ID</th>
            <th>Timestamp</th>
            <th>LinkName</th>
            <th>SessionID</th>
            <th>LinkType</th>
            <th>ContextID</th>
            <th>SessionType</th>
            <th>Slot</th>
            <th>SourceID</th>
            <th>DestinationID</th>
            <th>Route</th>
            <th>LinkCall</th>
            <th>SourceCall</th>
            <th>SourceName</th>
            <th>DestinationCall</th>
            <th>DestinationName</th>
            <th>State</th>
            <th>Start</th>
            <th>Stop</th>
            <th>RSSI</th>
            <th>BER</th>
            <th>ReflectorID</th>
            <th>LinkTypeName</th>
            <th>LossCount</th>
            <th>TotalCount</th>
            <th>Master</th>
            <th>TalkerAlias</th>
            <th>FlagSet</th>
            <th>Event</th>
            <th>Duration</th>
          </tr>
    `;

    rows.forEach(row => {
      html += `
        <tr>
          <td>${row.id}</td>
          <td>${row.timestamp}</td>
          <td>${row.linkname}</td>
          <td>${row.sessionid}</td>
          <td>${row.linktype}</td>
          <td>${row.contextid}</td>
          <td>${row.sessiontype}</td>
          <td>${row.slot}</td>
          <td>${row.sourceid}</td>
          <td>${row.destinationid}</td>
          <td>${row.route}</td>
          <td>${row.linkcall}</td>
          <td>${row.sourcecall}</td>
          <td>${row.sourcename}</td>
          <td>${row.destinationcall}</td>
          <td>${row.destinationname}</td>
          <td>${row.state}</td>
          <td>${row.start}</td>
          <td>${row.stop}</td>
          <td>${row.rssi}</td>
          <td>${row.ber}</td>
          <td>${row.reflectorid}</td>
          <td>${row.linktypename}</td>
          <td>${row.losscount}</td>
          <td>${row.totalcount}</td>
          <td>${row.master}</td>
          <td>${row.talkeralias}</td>
          <td>${row.flagset}</td>
          <td>${row.event}</td>
          <td>${row.duration}</td>
        </tr>
      `;
    });

    html += `
        </table>
      </body>
      </html>
    `;

    res.send(html);
  });
});
// Step 7: Add an endpoint to display the number of records in the table
app.get('/count', (req, res) => {
  const query = `
    SELECT COUNT(*) AS count FROM lastheard
  `;

  db.get(query, [], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    let html = `
      <html>
      <head>
        <title>Record Count</title>
        <meta http-equiv="refresh" content="10">
      </head>
      <body>
        <h1>Number of Records in the Table</h1>
        <p>Count: ${row.count}</p>
      </body>
      </html>
    `;

    res.send(html);
  });
});
});

// Step 5: Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
});