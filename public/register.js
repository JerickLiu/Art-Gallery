const submitButton = document.getElementById("submit-button");
const usernameInput = document.getElementById("username-input");
const passwordInput = document.getElementById("password-input");

function init() {
    submitButton.addEventListener("click", sendUpdate);
}

function sendUpdate() {
    let newUserData = {
        username: usernameInput.value,
        password: passwordInput.value
    };

    if (!newUserData.username || !newUserData.password) {
        alert("All fields must be filled.");
        return;
    }

    const req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            window.location.href = `/users/${JSON.parse(req.responseText).userID}`
        } else if (this.readyState === 4 && this.status === 409) {
            alert(req.responseText);
        }
    }


    // Send a PUT request to the server containing the new user data
    req.open("PUT", "/register");
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(newUserData));
}