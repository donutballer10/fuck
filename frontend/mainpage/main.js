var g_msg = new Map();    //{username, [{sender, msg}]}
var g_selected_user = null
var g_myself = "___me___";

var g_ui_userlist = new UIUserList();
var g_ui_chatbar = new UIChatBar();
var g_chatMgr = new ChatMgr();

function ChatMgr_OnUserListSelected(_item, _username) {     //DO NOT modify this
    if (g_selected_user != _username) {
        g_selected_user = _username;

        var label = document.getElementById("current_user");
        label.textContent = g_selected_user;

        g_ui_chatbar.clear();
        if (g_msg.has(_username)) {
            g_ui_chatbar.loadMsg(_username);
        }
    }

}


function rnd(min, max) {        //test only. Generate a random number
    return parseInt(((max - min + 1) * Math.random())) + min;
}


function AddMessage(_username, _msg) {       // _username: String, _msg: String. When receive message sent from other's, add _usg to sender's _username
    g_chatMgr.addMsg(_username, _msg);
}

function AddUser(_username, _img = null) {   // _username: String, _msg: String(Path to the image). Add _username and profile image when some other user online
    g_chatMgr.addUser(_username, _img);
}

function RemoveUser(_username) {     // _username: String Remove _username from online list when someone offline
    g_chatMgr.removeUser(_username);
}

function SetUserImage(_username, _img) {     // Backup method. No need to use this method.
    g_chatMgr.setUserImg(_username, _img);
}
// do not modify the code above


//called when user send a message
function OnSend(_to_username, _msg) {       // When user click the send button, this will be called and provide _to_username, and the _msg.
    console.log(g_myself + " to " + _to_username + " " + _msg);
    socket.emit("message", _to_username, _msg);

}

socket.on("user_logged_on", (user)=>{
    if (g_myself == "___me___"){
        g_myself = user;
    }
});

// get "logged_in" from server to make the menu
// users_li = "logged_in" from "server.js"; do i use the path or the img itself?
socket.emit("login_mainpage");
socket.on("login_mainpage", (logged_in) => {
	console.log("logged_in");
	console.log(logged_in);
	for (i = 0; i < logged_in.length; i++) {
		var user_info = logged_in[i];
		var img_path = "http://cse312-03.dcsl.buffalo.edu/backend/images/" + user_info["img"] + ".jpg"
        //var img_path = "http://localhost:80/" + user_info["img"] + ".jpg"
		console.log("img_path: " + String(img_path));
		AddUser(user_info["username"], img_path);
	}

});



function OnLogout(_username) {      //When user click the logout button, this will be called.
    console.log("logout");
    //implment here

    deleteCookie("clientname");

    var test = _username

    socket.emit("logged_out", test);//send to user
    window.location.href = "../login/login.html";

}



function deleteCookie(cname) {
    document.cookie = cname+"=; expires=Tue, 19 Jan 2038 03:14:07 UTC; path=/frontend/mainpage";

    //document.execCommand("ClearAuthenticationCache")
}

socket.on("logged", (user)=> {
    RemoveUser(user);
});

// a different user logged in, so add them to menu



/*
for (var i = 0; i < 10; i++) {      //test only. Simulate add users to online list.
    AddUser("user" + i, "https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-ios7-contact-512.png");
}
*/

/*
setInterval(() => {     //test only. Simulate add message.
    var n = rnd(0, 9);
    g_chatMgr.addMsg("user" + n, rnd(0, 999999));
}, 2000);

*/

