//server imports
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require("socket.io")(http);
const bcrypt = require("bcrypt");

const database = require("./database");

// node imports
var fs = require("fs");
//app.use(express.static('../frontend'));
//app.use(express.static('images/'));
app.use(express.static('..'));


var logged_in = []; // all currently logged in users to display on mainpage
var chatbarstatus = [];
var images_stored = 0; // will change this later to equal to number of  users registered in database; so need endpoint for that


http.listen(8000, () => {
		  console.log('listening on *:8000');
});


io.on("connection", (socket) => {
	var clientUsername = '';
	console.log("user connected");

	socket.on("reg", (username, text_password, img) => {
		// add code to test whether the user already exists and for socket events for each case
		console.log("user trying to register");


		username = username.replace('<', '&lt;');
		username = username.replace('>','&gt;');
		username = username.replace('&', '&amp;');


		//console.log(username, password);

		var filePath = store_img(img);
		console.log("filename: " + filePath);

		// hash password, gen salt, and store everything in db
		bcrypt.genSalt(12, (err, salt) => {
			bcrypt.hash(text_password, salt, (err, hash) => {
				console.log("salt: " + String(salt));
				console.log("hash: " + String(hash));
				database.add_entry(username, hash, salt, filePath, function (reg_status){

					socket.emit("reg_status", reg_status);
					if(reg_status){
						chatbarstatus.push({"username": username, "chatbar": false})
					}

				});
			});
		});

		//users[username] = [password, img]; // creates new entry in users with the corresponding username, password, image path
		//console.log(users);
	});

  
	socket.on("login", (username, password) => {
		//console.log("user trying to log in");

		// 0 if login is successful, 1 or -1 if login fails, 
		database.login(username, password, (login_status) => {
			console.log("login status: "+ String(login_status));
			socket.emit("login_status", login_status); // tell client whether login info's valid so it can process it
			if (login_status == 0) {
				//var user_info = database.get_user(username);
				database.user_path(username, (user_path) => {
					//console.log("path in login event:start");
					//console.log(user_path);
					//console.log("path in login event:end");
					logged_in.push({"username": username, "img": user_path}); // 'img' is the image number
					//console.log(String(logged_in));
					//console.log("logged_in:start");
					//console.log(logged_in);
					//console.log("logged_in:end");
					temp_user = username;
					socket.emit("user_logged_on", temp_user)
					//io.sockets.emit("user_logged_on", username); // broadcast that a user logged in
				});
			}
		});

	});

	// when user reaches main page, add them to visible logged in users
	// timing's trickier just doing it immediatley after login
  socket.on("login_mainpage", () => {
		//io.sockets.emit("user_logged_on");
		//console.log("login_mainpage event");
		socket.emit("login_mainpage", logged_in);
	});

	//bar status and user
	socket.on("chat_bar_setting", (status, name)=> {
		for(var x = 0; x<chatbarstatus.length; x++){
			if(chatbarstatus[x].username == name){
				chatbarstatus[x].chatbar = status;
			}
		}

	});

	socket.on("history", (name)=>{
		for(var x = 0; x<chatbarstatus.length; x++){
			if(chatbarstatus[x].username == name){
				console.log(chatbarstatus[x].chatbar);
				socket.emit("display", chatbarstatus[x].chatbar);
			}
		}
	});

	socket.on("clientUsername", ()=>{
		socket.emit("clientUsername", temp_user);
	});

	socket.on("logged_out", (clientname) => {
		//console.log(clientname.value+" is logging out!!!!!!!!!!!!!!!!!!!!!");

		for(var idx = 0; idx<logged_in.length; idx++){
			if(logged_in[idx]["username"] == clientname){
				logged_in.splice(idx, 1);
			}
		}

		//socket.emit("logged_out", clientname);
		socket.broadcast.emit("logged", clientname);

		//console.log("a user disconnected");
	});

	socket.on("message", (user, message) => {
    
		newMessage = message.replace('<', '&lt;');
		newMessage = newMessage.replace('>','&gt;');
		newMessage = newMessage.replace('&', '&amp;');
		//console.log(newMessage);

		io.emit('chat_message', user, newMessage);

	});



});


// takes in bytes of image, adds it to images dir under name "i.jpg" where i is the number of images stored there
// returns image number 
function store_img(img){
	var fileName = __dirname + "/images/" + images_stored.toString() + ".jpg"

	img = img.replace(/.*base64,/, ''); // replace metadata, necessary
	fs.writeFile( fileName, img, "base64", (err) => {
		if (err) { console.log("error on image store: " + String(err)); }
	});
	images_stored += 1;
	return images_stored - 1;
}

