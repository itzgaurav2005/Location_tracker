const express = require('express');
const app = express();
const path = require('path');
const http = require('http');

const socketio = require('socket.io');
const server = http.createServer(app);
const io = socketio(server);

// Serve static files from "public"
app.use(express.static('public'));

// Ensure EJS is set correctly
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Handle Socket.IO connections
io.on("connection", function(socket) {
    console.log("A user connected:", socket.id);

    socket.on("send-location", function(data) {
        io.emit("receive-location", { id: socket.id, ...data });
    });

    socket.on("disconnect", function() {
        console.log("User disconnected:", socket.id);
    });

    socket.on("disconnect", function(){
        io.emit("user-disconnected", socket.id)
    })
});

// Route to render EJS template
app.get("/", function (req, res) {
    res.render("index");
});

// Start server
server.listen(3000, () => console.log("Server started at port: 3000"));
