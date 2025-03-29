const express = require('express');
const session = require('express-session');
const app = express();
const http = require('http');
const socketio = require('socket.io');

const server = http.createServer(app);
const io = socketio(server);

// Session Middleware
app.use(session({
    secret: 'your_secret_key',  // Change this to a strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 30 * 60 * 1000 }  // 30 minutes session
}));

io.on("connection", function(socket) {
    const sessionID = socket.handshake.headers.cookie;

    socket.on("send-location", function(data) {
        if (!sessionID) {
            socket.emit("session-expired"); // Notify frontend to stop tracking
            return;
        }
        io.emit("receive-location", { id: socket.id, ...data });
    });

    console.log("User connected:", socket.id);
});

app.get("/", function(req, res) {
    req.session.startTime = Date.now();  // Set session start time
    res.render("index");
});

server.listen(3000, () => console.log("Server started at port: 3000"));
