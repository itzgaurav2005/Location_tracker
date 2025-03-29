const express = require('express');
const session = require('express-session');  // ✅ Import session
const app = express();
const path = require('path');

const http = require('http');
const server = http.createServer(app);

const socketio = require('socket.io');
const io = socketio(server);

// ✅ Set up session middleware
app.use(session({
    secret: 'your_secret_key',  // Change this to a strong secret
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 30 * 60 * 1000 } // ✅ Session expires after 30 minutes
}));

// ✅ Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ✅ Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));

// ✅ Socket.io connection handling with session check
io.on("connection", (socket) => {
    const sessionID = socket.handshake.headers.cookie;

    if (!sessionID) {
        console.log("Session expired. Blocking location tracking.");
        socket.disconnect();  // ❌ Disconnect if session expired
        return;
    }

    socket.on("send-location", (data) => {
        io.emit("receive-location", { id: socket.id, ...data });
    });

    console.log("Connected:", socket.id);
});

// ✅ Home route
app.get("/", (req, res) => {
    if (!req.session.startTime) {
        req.session.startTime = Date.now();  // Set session start time
    }

    // ✅ Check if session exceeded 30 minutes
    if (Date.now() - req.session.startTime > 30 * 60 * 1000) {
        req.session.destroy();  // ❌ End session after 30 minutes
        return res.send("Session expired. Refresh the page to restart.");
    }

    res.render("index");
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server started on port: ${PORT}`));
