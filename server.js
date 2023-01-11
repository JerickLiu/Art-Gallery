const express = require('express');
const session = require('express-session');
const app = express();
const mc = require("mongodb").MongoClient;
let ObjectId = require('mongodb').ObjectId;

const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.static("views"));
app.use(express.json());
// Allows form data post method
app.use(express.urlencoded({extended: true}));

app.set("views", "./views");
app.set("view engine", "pug");

let db;

app.use(session({
    secret: 'Final Term Project',
    resave: true,
    saveUninitialized: false,
}));


app.use((req, res, next) => {
    if (req.session.loggedin) {
        res.locals.loggedin = true;
        res.locals.username = req.session.username;
    }
    next();
});

app.use(function (req, res, next) {
    console.log(req.session);

    next();
});

// GET Route for "/". Home page.
app.get("/", (req, res) => {
	res.status(200).render("home")
})

// GET Route to logout
app.get("/logout", (req, res) => {
    // If the user is logged in, then log them out and redirect to home
    if (req.session.loggedin) {
        // Reset session cookies
        req.session.loggedin = false;
        req.session.userID = undefined;
        req.session.username = undefined;

        res.redirect("/");
    } else {
        res.redirect("/");
    }
})

// GET method responds with an HTML page containing a list of all office supply items stored in the database
app.get('/artworks', (req, res) => {
	// Finds all items in db
	db.collection("gallary").find({}).toArray(function(err, searchResult) {
		if (err) throw err;

		res.render('artworks', {artworks: searchResult})
	});
});

// GET method finds the artwork with the name parameter
app.get("/artwork/:name", (req, res) => {
    db.collection("gallary").findOne({name: req.params.name})
        .then(result => {
            if (!result) {
                res.status(404).render("error", {
                    message: `Artwork with name ${req.params.name} does not exist`
                });
            } else {
                res.status(200).render("artwork", {artwork: result});
            }
        })
})

// GET method to addArtwork page
app.get("/addArtwork", (req, res) => {
    res.status(200).render("addArtwork", {artist: req.session.username});
})

// POST method to add the new artwork with the logged in artist
app.post("/addArtwork/:artist", (req, res) => {
    console.log(req.body);
    db.collection("gallary").findOne({name: req.body.name})
        .then(result => {
            if (result) {
                res.status(400).send(`Artwork with name ${req.body.name} already exists. Nothing has been added.`)
            } else {
                let newArt = {};
                newArt.name = req.body.name;
                newArt.artist = req.params.artist;
                newArt.category = req.body.category;
                newArt.medium = req.body.medium;
                newArt.year = req.body.year;
                newArt.image = req.body.image;
                newArt.rating = [-1, -1];

                db.collection("gallary").insertOne(newArt)
                res.status(201).send(`/artwork/${newArt.name}`);
            }
        })
})

// GET method to find the artist with the parameter
app.get("/artist/:name", (req, res) => {
    db.collection("users").findOne({username: req.params.name})
        .then(result => {
            if (!result) {
                res.status(404).render("error", {
                    message: `Artist with name ${req.params.name} does not exist`
                });
            } else {
                db.collection("gallary").find({artist: req.params.name}).toArray(function(err, searchResult) {
                    if (err) throw err;
                    
                    if (req.session.loggedin) {
                        res.status(200).render("artist", {artist: result, artworks: searchResult, userID: req.session.userID});
                    } else {
                        res.status(200).render("artist", {artist: result, artworks: searchResult, userID: 0});
                    }                
                });
            }

        })
});

// Routes for /register
app.route("/register")

    // Displayes the register html page
    .get((req, res) => {
        res.status(200).render("register");
    })

    // Registers the user
    .put((req, res) => {

        if (!req.body.username || !req.body.password) {
            res.status(400).send("Bad request")
        }

        // Checks if the username is already in the database
        db.collection("users").findOne({"username": req.body.username})
            .then(result => {
                if (result) {
                    res.status(409).send("Username already exists!");
                } else {

                    // Creates new user
                    let newUser = {};
                    newUser.username = req.body.username;
                    newUser.password = req.body.password;
                    newUser.patron = true;
                    newUser.following = [];
                    newUser.reviews = [];


                    db.collection("users").insertOne(newUser)
                        .then(result => {
                            
                            // Changes session data
                            req.session.loggedin = true;
                            req.session.userID = result.insertedId;
                            req.session.username = req.body.username;

                            res.status(200).send({userID: result.insertedId})
                        })
                }
            })
    });


// Change
app.route("/users/:userID")
    .get((req, res) => {
        if (!ObjectId.isValid(req.params.userID)) {
            res.status(404).render("error", {
                message: `Page does not exist`
            });
            return;
        }
    
        let queryUID = ObjectId(req.params.userID);
    
        db.collection("users").findOne({_id: queryUID})
            .then(result => {
                if (!result) {
                    // User ID does not exist
                    res.status(404).render("error", {
                        message: `User with ID ${queryUID} does not exist`
                    });
                } else {
                    res.status(200).render("user", {
                        userData: result
                    });
                }
            })
    })
    .post((req, res) => {    

        // Checks if user is authorized to update the profile
        if (!req.session.loggedin) {
            res.status(403).send("You must be logged in to do this action.");
            return;
        } else if (!ObjectId(req.params.userID).equals(req.session.userID)) {
            res.status(403).send("You are not this user, and cannot perform this action.");
            return;
        }

        let queryUID = ObjectId(req.params.userID);

        if (req.body.patron != undefined) {

            let patronBool = req.body.patron === "false";
            console.log(patronBool);

            db.collection("users").findOne({_id: queryUID})
                .then((result) => {
                    db.collection("gallary").findOne({artist: result.username})
                        .then((result) => {
                            if (!result) {
                                res.status(401).send("You must add one artwork to the database.")
                            } else {
                                db.collection("users").updateOne({_id: queryUID}, {$set: {patron: patronBool}})
                                    .then(() => {
                                        res.status(200).send("Profile updated!");
                                    })
                                    .catch(err => {
                                        res.status(500).send(`Error reading database: ${err}.`);
                                    });
                            }
                        })
                })

        } else if (req.body.artist != undefined) {
            db.collection("users").findOne({_id: queryUID, following: req.body.artist})
                .then((result) => {
                    if (!result) {
                        db.collection("users").updateOne({_id: queryUID}, {$push: {following: req.body.artist}})
                            .then(() => {
                                res.status(200).send("You are now following: " + req.body.artist);
                            })
                    } else {
                        db.collection("users").updateOne({_id: queryUID}, {$pull: {following: req.body.artist}})
                            .then(() => {
                                res.status(200).send("You have unfollowed " + req.body.artist);
                            })
                    }
                })
        }
    });


// GET method redirects to user page
app.get("/profile", (req, res) => {
    if (req.session.loggedin)
        res.redirect(`/users/${req.session.userID}`);
    else
        res.redirect("/login");
});

app.route("/login")
    .get((req, res) => {
        res.status(200).render("login");
    })
    .post((req, res) => {
        if (req.session.loggedin) {
            res.status(200).render("error", {message: `Cannot log in. Already logged into ${req.session.username}.`});
            return;
        }
        console.log(req.body);

        db.collection("users").findOne({username: req.body.username, password: req.body.password},
            (err, result) => {
                if (err) throw err;
                if (!result) {
                    // Username does not exist or the password is incorrect; do not give detailed info
                    res.status(401).render("error", {message: "There was a problem. Your username or password is incorrect"});
                    return;
                }
    
                // Set session cookies
                req.session.loggedin = true;
                req.session.userID = result._id;
                req.session.username = req.body.username;
    
                res.redirect(`/users/${result._id}`);
            });
    });


// Connecting to the database
mc.connect("mongodb://localhost:27017", { useNewUrlParser: true }, function(err, client) {
	if (err) {
		console.log("Error in connecting to database");
		return;
	}
	//Get the database and save it to a variable
	db = client.db("final");
	
	//Only start listening now, when we know the database is available
	app.listen(PORT);
	console.log("Server listening on port 3000");
})