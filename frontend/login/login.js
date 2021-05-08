function btn_login_click() {
    var username = document.getElementById("username");     //When user login, the input username will be here
    var passwd = document.getElementById("password");       //When user login, the input password will be here
	
    if (username.value && passwd.value) {
        OnLogin(username.value, passwd.value);
    } else {
        alert("username or password cannot be empty");
    }
}

function OnLogin(username, password) {
	console.log("onLogin");
	//socket.emit("newUser", username, password);
	socket.emit("login", username, password); 
		
	socket.on("login_status", (login_status) => {
		console.log("login_status: " + String(login_status));
		// if valid login info, go to mainpage
		if (login_status == 0) { 
			//socket.emit("login_mainpage", username); // add user to "logged_in" on server
			window.location.href = "../mainpage/main.html";
		}
		// login info not valid;
		else { 
			alert("incorrect username or password");
			window.location.href = "login.html";
		}
	});

}
