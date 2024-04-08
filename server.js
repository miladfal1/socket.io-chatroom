const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const setupSocket = require("./socket");
const createAdapter = require("@socket.io/redis-adapter").createAdapter;
const redis = require("redis");
const { createClient } = redis;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

(async () => {
  pubClient = createClient({ url: "redis://127.0.0.1:6379" });
  await pubClient.connect();
  subClient = pubClient.duplicate();
  io.adapter(createAdapter(pubClient, subClient));
})();

setupSocket(io);

const PORT = 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
