const express = require('express');
const session = require('express-session'); 
const path = require('path');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// ✅ Configure session (45 minutes)
const sessionMiddleware = session({
    secret: "Gaurav@157",  
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 45 * 60 * 1000 } 
});

app.use(sessionMiddleware);

// ✅ Attach session to Socket.IO
io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});

// ✅ Static files
app.use(express.static('public'));

// ✅ Ensure correct static paths
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/js', express.static(__dirname + '/public/js'));

// ✅ Set EJS for rendering views
app.set('views', path.join(__dirname, 'views')); 
app.set('view engine', 'ejs');

// ✅ Socket.io connection
io.on("connection", function(socket) {
    console.log("User connected:", socket.id);

    socket.on("send-location", function(data) {
        console.log("Received location from:", socket.id, data);
        io.emit("receive-location", { id: socket.id, ...data });
    });

    socket.on("disconnect", function() {
        console.log("User disconnected:", socket.id);
    });
});

// ✅ Route to render the map
app.get("/", function (req, res) {
    req.session.startTime = Date.now();
    res.render("index");
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
