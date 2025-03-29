const socket = io();
const sessionDuration = 45 * 60 * 1000; // 45 minutes
const sessionStartTime = Date.now();
let watchId;

if (navigator.geolocation) {
    watchId = navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;

            if (Date.now() - sessionStartTime > sessionDuration) {
                navigator.geolocation.clearWatch(watchId);
                alert("Session expired! Location tracking has stopped.");
                return;
            }

            socket.emit("send-location", { latitude, longitude });
        },
        (error) => {
            console.error("Geolocation Error:", error.message);
        },
        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 5000
        }
    );

    // ✅ Listen for location updates from the server
    socket.on("receive-location", function(data) {
        updateMap(data.latitude, data.longitude);
    });

} else {
    alert("Geolocation is not supported by this browser.");
}

// ✅ Initialize map using Leaflet.js
const map = L.map('map').setView([20, 78], 5); // Default view (India)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let marker;
function updateMap(lat, lng) {
    if (marker) {
        marker.setLatLng([lat, lng]);
    } else {
        marker = L.marker([lat, lng]).addTo(map);
    }
    map.setView([lat, lng], 15);
}
