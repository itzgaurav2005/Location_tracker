const socket = io();
let trackingActive = true;

// Check session expiry from backend
socket.on("session-expired", () => {
    alert("Session expired. Location tracking stopped.");
    trackingActive = false;
});

if (navigator.geolocation) {
    const stopTrackingTime = Date.now() + 30 * 60 * 1000; // 30 minutes from now

    const trackLocation = () => {
        if (!trackingActive || Date.now() > stopTrackingTime) {
            console.log("Tracking stopped after 30 minutes.");
            return;
        }
        navigator.geolocation.watchPosition((position) => {
            const { latitude, longitude } = position.coords;
            socket.emit("send-location", { latitude, longitude });
        }, (error) => {
            console.error(error);
        }, {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000
        });
    };

    setInterval(trackLocation, 5000); // Update location every 5 seconds
}
