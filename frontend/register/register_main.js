var g_image_selected = false;
var g_img = null;

function on_file_selected() {       //DO NOT modify this
    var filePacker = document.getElementById("filePicker");

    if (filePacker.files && filePacker.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            var imageBox = document.getElementById("imageBox");
            imageBox.setAttribute("src", e.target.result);
            g_img = e.target.result;
            imageBox.style.display = "";
            g_image_selected = true;
        };

        reader.readAsDataURL(filePacker.files[0]);
    }

}


function btn_submit_click() {   //DO NOT modify this
    var username = document.getElementById("username");
    var passwd = document.getElementById("password");
    var username_label = document.getElementById("username_label");
    var passwd_label = document.getElementById("password_label");
    var div1 = document.getElementById("registerBox");
    var div2 = document.getElementById("createSucceedBox");
    var filePicker = document.getElementById("filePicker");

    var hr = true;


    if (!username.value) {
        username_label.style.color = "red";
        hr = false;
    } else {
        username_label.style.color = "white";
    }

    if (!passwd.value) {
        passwd_label.style.color = "red";
        hr = false;
    } else {
        passwd_label.style.color = "white";
    }

    if (!g_image_selected) {
        filePicker.style.color = "red";
        hr = false;

    } else {
        filePicker.style.color = "white";
    }

    if (hr) {
        if (OnSubmit(username.value, passwd.value, g_img)) {
            div1.style.display = "none";
            div2.style.display = "";


            setTimeout(function () {
                window.location.href = "../login/login.html";
            }, 2000);
        }


    }

}
//modify here. When client create an account, the inputed _username, _password, _img path will be provided here.
function OnSubmit(username, password, img) {     
	console.log("img = " + img);

	socket.emit("reg", username, password, img); 

	socket.on("reg_status", function (status){
	    if (status){
	        alert("account created")
        }
	    else{
	        alert("account creation failed")
        }
    });
    //create succeed return true, otherwise return false
    return true;
}
