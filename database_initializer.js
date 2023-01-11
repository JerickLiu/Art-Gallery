let mongo = require('mongodb');
const fs = require("fs");
let MongoClient = mongo.MongoClient;
let db;
let artworks = [];
let premadeUsernames = ["Corrine Hunt", "Midjourney", "Carl Schaefer", "Banksy", "Luke"]
let users = [];

premadeUsernames.forEach(name => {
	let user = {};
	user.username = name;
	user.password = "a";
	user.patron = true;
	user.following = [];
	user.reviews = [];
	users.push(user);
})

let gallary = require("./art/gallery.json");


for (let art in gallary) {
    let artwork = {};
    // console.log(gallary[art].name);
    artwork.name = gallary[art].name;
    artwork.artist = gallary[art].artist;
    artwork.year = gallary[art].year;
    artwork.category = gallary[art].category;
    artwork.medium = gallary[art].medium;
    artwork.description = gallary[art].description;
    artwork.image = gallary[art].image;
    artwork.rating = [-1, -1];

    // console.log(artwork);
    artworks.push(artwork);

}

// console.log(artworks);


MongoClient.connect("mongodb://127.0.0.1:27017/", { useNewUrlParser: true }, function(err, client) {
	if(err) throw err;
	db = client.db('final');

	db.dropCollection("gallary", function(err, result){
		if(err){
			console.log("No gallary collection to clear.")
		}else{
			console.log("Cleared gallary collection.");
		}

		db.collection("gallary").insertMany(artworks, function(err, result){
			if(err) throw err;
			console.log("Successfuly inserted " + result.insertedCount + " artworks.")
			console.log(result);

			client.close();
		})

	});

    db.dropCollection("users", function(err, result){
		if(err){
			console.log("No users collection to clear.")
		}else{
			console.log("Cleared users collection.");
		}

		db.collection("users").insertMany(users, function(err, result){
			if(err) throw err;
			console.log("Successfuly inserted " + result.insertedCount + " users.")
			console.log(result);

			client.close();
		})

	});
});