// Step 1: Install the necessary packages
// Run the following commands in your terminal:
// npm install socket.io-client mqtt

// Step 2: Import the required modules
const io = require('socket.io-client');

// Step 3: Open a connection to the specified URL
const socket = io('https://api.brandmeister.network:/lh/socket.io');

// Step 4: Listen for the 'mqtt' event and handle the incoming data
socket.on('connect', () => {
  console.log('Connected to the socket.io server');
});

socket.on('mqtt', (data) => {
  try {
    // Step 5: Extract JSON from the MQTT events
    const jsonData = JSON.parse(data);
    
    // Step 6: Output the JSON to stdout
    console.log('Received JSON data:', JSON.stringify(jsonData, null, 2));
  } catch (error) {
    console.error('Error parsing JSON data:', error);
  }
});

socket.on('disconnect', () => {
  console.log('Disconnected from the socket.io server');
});