class UIUserListItem {
    ui_dt   //dt, item container
    ui_img      //image
    ui_username  //username
    ui_parent   //parent dl
    ui_newMsgTag   //new message tag(div)

    constructor(parent) {
        this.parent = parent;

        this.ui_dt = document.createElement("dt");
        this.ui_img = document.createElement("img");
        this.ui_username = document.createElement("div");
        this.ui_newMsgTag = document.createElement("div");

        this.ui_dt.classList.add("user_list_item")
        this.ui_img.classList.add("user_list_item_img");
        this.ui_username.classList.add("user_list_item_username");
        this.ui_newMsgTag.classList.add("user_list_item_newMsgTag");

        parent.appendChild(this.ui_dt);
        this.ui_dt.appendChild(this.ui_img);
        this.ui_dt.appendChild(this.ui_username);
        this.ui_dt.appendChild(this.ui_newMsgTag);

        this.ui_dt.onclick = function () {
            var item = null;

            for (var [k, v] of g_ui_userlist.map_user_list) {
                if (k != this) {
                    v.setBackgroundColor("");
                } else {
                    v.setBackgroundColor("rgba(0,255,0,0.2)");
                    v.setNewMsgTag(false);
                    item = v;
                }
            }

            ChatMgr_OnUserListSelected(item, item.getUsername());
        };

    }

    setUsername(username) {
        this.ui_username.textContent = username;
    }

    setImg(img) {
        this.ui_img.setAttribute("src", img);
    }

    getUsername() {
        return this.ui_username.textContent;
    }

    setNewMsgTag(bool_value) {
        if (bool_value) {
            this.ui_newMsgTag.style.backgroundColor = "red";
        } else {
            this.ui_newMsgTag.style.backgroundColor = "";
        }
    }

    setBackgroundColor(color) {
        this.ui_dt.style.backgroundColor = color;
    }

}

class UIUserList {
    ui_parent;   //parent dl
    map_user_list; //{ui_dt, UIUserListItem}

    constructor() {
        this.ui_parent = document.getElementById("user_list");
        this.map_user_list = new Map();
    }


    addItem(username) {
        var item = new UIUserListItem(this.ui_parent);
        item.setUsername(username);

        this.map_user_list.set(item.ui_dt, item);

        return item;
    }

    getItem(username) {
        for (var [k, v] of this.map_user_list) {
            if (k.textContent == username) {
                return v;
            }
        }

        return null;
    }

    removeItem(username) {
        for (var [k, v] of this.map_user_list) {
            if (k.textContent == username) {
                this.ui_parent.removeChild(k);
                this.map_user_list.delete(v);
            }
        }
    }

}

class UIChatBar {
    ui_div  //chat bar

    constructor() {
        this.ui_div = document.getElementById("chatbar");
    }

    scrollToBottom() {
        this.ui_div.scrollTop = this.ui_div.scrollHeight;
    }

    clear() {
        this.ui_div.innerHTML = "";
    }

    addMsg(is_self, msg) {
        var item = document.createElement("dt");

        item.classList.add("bubble");
        item.textContent = msg;
        item.style.backgroundColor = !is_self ? "rgba(255,255,255,0.3)" : "rgba(0,255,255,0.3)";

        this.ui_div.appendChild(item);
    }

    loadMsg(username) {
        if (g_msg.has(username)) {
            for (var i of g_msg.get(username)) {
                this.addMsg(i.sender == g_myself, i.msg);
            }
        }
    }
}

class ChatMgr {
    addMsg(username, msg) {
        if (username == g_myself) {
            if (!g_msg.has(g_selected_user)) {
                g_msg.set(g_selected_user, []);
            }
            g_msg.get(g_selected_user).push({ sender: g_myself, msg: msg });
            g_ui_chatbar.addMsg(true, msg);

        } else {
            if (!g_msg.has(username)) {
                g_msg.set(username, []);
            }
            g_msg.get(username).push({ sender: username, msg: msg });

            if (g_selected_user == username) {
                g_ui_chatbar.addMsg(false, msg);
            } else {
                var item = g_ui_userlist.getItem(username);
                item.setNewMsgTag(true);
            }
        }
    }

    addUser(username, img = null) {
        var item = g_ui_userlist.addItem(username);
        if (img) {
            item.setImg(img);
        }
    }

    setUserImg(username, img) {
        var item = g_ui_userlist.getItem(username);
        if (item) {
            item.setImg(img);
        }
    }

    removeUser(username) {
        g_ui_userlist.removeItem(username);
        if (g_msg.has(username)) {
            g_msg.delete(username);
        }

        if (g_selected_user == username) {
            g_ui_chatbar.clear();
            g_selected_user = null;

            var label = document.getElementById("current_user");
            label.textContent = g_selected_user;
        }
    }
}

function send_btn_click() {
    if (g_selected_user) {
        var textbox = document.getElementById("textbox");

        g_chatMgr.addMsg(g_myself, textbox.value);
        g_ui_chatbar.scrollToBottom();

        OnSend(g_selected_user, textbox.value);

        textbox.value = "";
    }
}

function clear_btn_click() {

    g_ui_chatbar.clear();
    if (g_msg.has(g_selected_user)) {
        g_msg.set(g_selected_user, []);
    }


}

function logout_btn_click(user){
    OnLogout(user);
}


function showChatWindow(bool_value) {

    curStatus = bool_value;

    const cookieValue = document.cookie.split('; ');
    client_name = '';
    for(y = 0; y < cookieValue.length; y++) {
        if (cookieValue[y].startsWith("clientname=")) {
            if (cookieValue[y].split('=')[1] == '') {
            } else {
                client_name = (cookieValue[y].split('=')[1]);
            }
        }
    }
    socket.emit("chat_bar_setting", bool_value, client_name);

    var div = document.getElementById("chatwindow");
    var btn = document.getElementById("showbutton");

    if (bool_value) {
        onResize();
        var btn = document.getElementById("showbutton");
        btn.textContent = "Show Chat Window";
        div.style.display = "block";
        btn.style.display = "none";
    } else {
        div.style.display = "none";
        btn.style.display = "block";
    }
}

function onResize() {
    var chatWindow = document.getElementById("chatwindow");

    var w_page = document.body.offsetWidth;

    if (w_page < 1006) {
        chatWindow.style.left = 0;
    } else {
        chatWindow.style.left = (w_page - 1006) / 2;
    }

}