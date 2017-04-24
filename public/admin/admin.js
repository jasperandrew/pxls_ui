$("<link/>", {rel: "stylesheet", href: "/admin/admin.css"}).appendTo(document.head);
var modPanelHTML =
"<div class='admin panel'>"+
  "<h1>MOD</h1>"+
  "<div>"+
    "<input type='checkbox' id='admin-hr'>"+
    "<label for='admin-hr'>Disable hand reset</label>"+
  "</div>"+
  "<div>"+
    "<input type='checkbox' id='admin-co'>"+
    "<label for='admin-co'>Override cooldown</label>"+
  "</div>"+
  "<input id='admin-ban' type='text' placeholder='Ban user (24h)'>"+
  "<input id='admin-unban' type='text' placeholder='Unban user (24h)'>"+
  "<input id='admin-checkrole' type='text' placeholder='Check user'>"+
"</div>";

var lookupPanelHTML =
"<div class='admin-lookup'>"+
  "<div><b>Coords: </b><span id='lookup-coords'></span></div>"+
  "<div><b>Username: </b><span id='lookup-user'></span></div>"+
  "<div><b>Login: </b><span id='lookup-login'></span></div>"+
  "<div><b>Time: </b><span id='lookup-time'></span></div>"+
  "<div><input id='lookup-msg' placeholder='Send alert...'></div>"+
  "<div>"+
    "<div class='button' id='lookup-ban'>Ban (24h)</div>"+
    "<div class='button' id='lookup-close'>Close</div>"+
  "</div>"+
"</div>";

function initAdmin(admin) {
    function addAdminPanel() {
        var adminRoot = $("<div></div>").appendTo(document.body).html(modPanelHTML);

        var handReset = $("#admin-hr").change(function () {
            var state = this.checked;
            admin.place.setAutoReset(!state);
        });

        var cooldownOverride = $("#admin-co").change(function () {
            var state = this.checked;
            admin.socket.send({type: "admin_cdoverride", override: state});
        });

        var banInput = $("#admin-ban").on("keydown", function (evt) {
            if (evt.which === 13) {
                $.post("/admin/ban", {username: banInput.val(), reason: prompt("Ban reason")}, function () {
                });
                banInput.val("");
            }
            evt.stopPropagation();
        });

        var unbanInput = $("#admin-unban").on("keydown", function (evt) {
            if (evt.which === 13) {
                $.post("/admin/unban", {username: unbanInput.val()}, function () {
                });
                unbanInput.val("");
            }
            evt.stopPropagation();
        });

        var checkInput = $("#admin-checkrole").on("keydown", function (evt) {
            if (evt.which === 13) {
                $.post("/admin/check", {username: checkInput.val()}, function (data) {
                    var delta = (data.ban_expiry - (new Date()).getTime()) / 1000,
                        secs = Math.floor(delta % 60),
                        secsStr = secs < 10 ? "0" + secs : secs,
                        minutes = Math.floor((delta / 60)) % 60,
                        minuteStr = minutes < 10 ? "0" + minutes : minutes,
                        hours = Math.floor(delta / 3600),
                        hoursStr = hours < 10 ? "0" + hours : hours,
                        banned = data.banned,
                        bannedStr = "",
                        expiracyStr = hoursStr+":"+minuteStr+":"+secsStr;
                    if (data.role == "SHADOWBANNED") {
                        bannedStr = "shadow";
                        banned = true;
                        expiracyStr = "never";
                    } else {
                        bannedStr = banned ? "yes" : "no";
                    }
                    //console.log(delta);
                    admin.alert.show("Username: "+data.name+"<br>"+
                        "Role: "+data.role+"<br>"+
                        "Banned: "+bannedStr+(banned?"<br>"+
                            "Ban Reason: "+$("<div>").text(data.ban_reason).html()+"<br>"+
                            "Ban Expiracy: "+expiracyStr
                        :"")
                    );
                    //console.log(data);
                }).fail(function () {
                    admin.alert.show("User not found");
                });
                checkInput.val("");
            }
            evt.stopPropagation();
        })

        if (admin.user.getRole() !== "ADMIN") {
            banInput.hide();
            unbanInput.hide();
        }
    }

    function addLookupPanel() {
        var u = {u: null};
        var lookupPanel = $("<div />").html(lookupPanelHTML).hide().appendTo(document.body);

        var coords = $("#lookup-coords");
        var user = $("#lookup-user");
        var login = $("#lookup-login");
        var time = $("#lookup-time");
        var message = $("#lookup-msg").on("keydown", function (evt) {
            if (evt.which === 13) {
                admin.socket.send({
                    type: "admin_message",
                    username: u.u.username,
                    message: $(this).val()
                });
                message.val("");
            }
            evt.stopPropagation();
        });

        var ban = $("#lookup-ban").on("click", function () {
            $.post("/admin/ban", {username: u.u.username, reason: prompt("Ban reason")}, function () {
            });

            lookupPanel.fadeOut(200);
            u.u = null;
        });
        if (admin.user.getRole() !== "ADMIN") {
            ban.hide();
        }

        var close = $("#lookup-close").on("click", function () {
            lookupPanel.fadeOut(200);
            u.u = null;
        });

        admin.board.getRenderBoard().on("click", function (evt) {
            if (evt.shiftKey) {
                var pos = admin.board.fromScreen(evt.clientX, evt.clientY);

                $.get("/lookup", {x: Math.floor(pos.x), y: Math.floor(pos.y)}, function (data) {
                    if (data) {
                        u.u = data;
                        lookupPanel.fadeIn(200);

                        coords.text("(" + data.x + ", " + data.y + ")");
                        user.text(data.username);
                        login.text(data.login);
                        time.text(new Date(data.time).toLocaleString());
                    }
                });
            }
        });
    }

    setTimeout(function () {
        addAdminPanel();
        addLookupPanel();
    }, 2000);
}
