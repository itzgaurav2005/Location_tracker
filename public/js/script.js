const socket = io();
const sessionDuration = 45 * 60 * 1000; // ⏳ 45 minutes
const sessionStartTime = Date.now();

if (navigator.geolocation) {
    const watchId = navigator.geolocation.watchPosition(
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
} else {
    alert("Geolocation is not supported by this browser.");
}
