const followButton = document.getElementById("follow");

function init() {
    followButton.addEventListener("click", sendUpdate);
}

function sendUpdate() {
    const uid = document.getElementById("uid").innerHTML
    const follow = document.getElementById("artist").innerHTML
    const req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (this.readyState === 4) {
            alert(req.responseText);
            // location.reload();
        }
    }
    // Send a POST request to the server containing the new user profile data
    req.open("POST", `/users/${uid}`);
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify({artist: follow}));
}