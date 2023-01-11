const accountType = document.getElementById("account-type");
const submitButton = document.getElementById("submit-button");

function init() {
    submitButton.addEventListener("click", sendUpdate);
}

function sendUpdate() {

    const req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (this.readyState === 4 && this.status == 200) {
            alert(req.responseText);
            location.reload();
        } else if (this.readyState === 4 && this.status == 401) {
            alert(req.responseText);
            window.location.href = "/addArtwork";
        }
    }

    // Send a POST request to the server containing the new user profile data
    req.open("POST", `/users/${userData._id}`);
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify({patron: accountType.elements["patron"].value}));
}

function submit() {
    // This function is called on click of the "Save Item" button, compiles field data into an object and sends to server
    // Params: N/A
    // Returns: alert indicating successful or error

    // Object to store field data
    let data = {};
    
    if (document.getElementById("name").value.length < 2) {
        alert("Artwork name must be atleast 2 characters.");
        return;
    }

    data.name = document.getElementById("name").value;
    data.category = document.getElementById("category").value;
    data.medium = document.getElementById("medium").value;
    data.year = document.getElementById("year").value;
    data.description = document.getElementById("description").value;
    data.image = document.getElementById("image").value;

    let req = new XMLHttpRequest();

    req.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 201) {
            alert("Artwork Successfully Added!");
            window.location.href = this.responseText;
        } else if (this.readyState == 4 && this.status == 400) {
            alert(this.responseText);
            window.location.reload();
        }
    }

    const artist = document.getElementById("uid").innerHTML;

    req.open("POST", `/addArtwork/${artist}`);
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(data));
}
