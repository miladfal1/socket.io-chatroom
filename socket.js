const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require("./utils/users");
const formatMessage = require("./utils/messages");
const botName = "Yoohoo";

module.exports = function (io) {
  io.on("connection", (socket) => {
    console.log(io.of("/").adapter);
    socket.on("joinRoom", ({ username, room }) => {
      const user = userJoin(socket.id, username, room);

      socket.join(user.room);

      // Welcome current user
      socket.emit("message", formatMessage("Welcome to Yoohoo!"));

      // Broadcast when a user connects
      socket.broadcast.to(user.room).emit("message", formatMessage(botName, `${user.username} has joined the chat`));

      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    });

    // Listen for chatMessage
    socket.on("chatMessage", (msg) => {
      const user = getCurrentUser(socket.id);

      io.to(user.room).emit("message", formatMessage(user.username, msg));
    });

    // Runs when client disconnects
    socket.on("disconnect", () => {
      const user = userLeave(socket.id);

      if (user) {
        io.to(user.room).emit("message", formatMessage(botName, `${user.username} has left the chat`));

        // Send users and room info
        io.to(user.room).emit("roomUsers", {
          room: user.room,
          users: getRoomUsers(user.room),
        });
      }
    });
  });
};
