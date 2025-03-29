const express = require('express');
const session = require('express-session'); // ✅ Import session
const app = express();
const path = require('path');
const http = require('http');
const socketio = require('socket.io');

app.use(express.static('public'));
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/js', express.static(__dirname + '/public/js'));

// ✅ Configure session (45 minutes)
app.use(
    session({
        secret: "Gaurav@157",  // 🔒 Replace with a strong secret
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 45 * 60 * 1000 } // ⏳ 45 minutes
    })
);

const server = http.createServer(app);
const io = socketio(server);

io.on("connection", function(socket) {
    socket.on("send-location", function(data) {
        if (socket.handshake.session) {
            io.emit("receive-location", { id: socket.id, ...data });
        }
    });
    console.log("User connected:", socket.id);
});

app.set('view engine', 'ejs');
app.get("/", function (req, res) {
    req.session.startTime = Date.now(); // ✅ Store session start time
    res.render("index");
});

server.listen(3000, () => console.log("Server started at port: 3000"));
