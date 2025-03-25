const socket = io();

socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
});

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            console.log("Sending location:", latitude, longitude);
            socket.emit("send-location", { latitude, longitude });
        },
        (error) => {
            console.error("Geolocation error:", error);
        },
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000,
        }
    );
} else {
    console.error("Geolocation is not supported by this browser.");
}

const map = L.map("map").setView([0, 0], 10);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Vindhya Travels Map",
}).addTo(map);

const markers = {}; // Store markers for each user

socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;
    console.log("Received location for:", id, latitude, longitude);

    map.setView([latitude, longitude]);

    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});

socket.on("user-disconnected", (id)=>{
    if(markers[id]){
        map.removeLayer(markers[id])
        delete markers[id]
    }
})
