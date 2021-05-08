var mongo = require('mongodb');
var monk = require('monk');

var db = require('monk')('mongo:27017/test1');
//const users = db.create('user_data1') //create collection run this the first time then comment it out
var user = db.get('user_data11')
const bcrypt = require("bcrypt");




//add username, password and image path to database
//won't add if the username is taken
//return 0 for success ////// 1 for false
//user,pass,path all string
function add_entry(username, password, salt, path, callback){

    user.find({"username": username}, {}, function (e, docs){
        if(docs.length > 0){
            return callback(false); //username taken
        }else{
            user.insert([{'username':username, 'password':password, 'salt': salt,'path':path}])
            return callback(true); //username created
        }
    })

}

//return 0 if login is successful
//1 if login fails
function login(username, password, callback){

    user.findOne({"username": username}, {}, function (e, docs){
		console.log("login():");
		console.log(docs);
		if (docs == null){
			return callback(1);
		}
        bcrypt.hash(password, docs["salt"], function (err, hash){
            test_tracker = hash.localeCompare(docs["password"]);
            return callback(test_tracker);
        });
    });

}


// returns user's document
// doesn't handle the user not being in db, so only call after valid logins
function get_user(username) {
	user.findOne({"username": username}, (error, user_info) => {
		console.log("get_user() result:");
		console.log(user_info);
		return user_info;
	});
}


// get user's path
function user_path(username, callback) {
	user.findOne({"username": username}, (error, user_info) => {
		return callback(user_info["path"]);
		//return user_info["path"];
	});
}



// module exports
exports.add_entry = add_entry;
exports.login = login;
exports.get_user = get_user;
exports.user_path = user_path;
