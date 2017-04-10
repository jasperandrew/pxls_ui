var App = window.App;

App.attemptPlace_ = App.attemptPlace;
App.attemptPlace = function(x, y) {
  var oldColor = App.color;
  App.attemptPlace_(x, y);

  if (handReset.prop("checked")) {
    App.switchColor(oldColor);
  }
};

$("<link/>", {rel: "stylesheet", href: "/admin/admin.css"}).appendTo(document.head);

var adminRoot = $("<div></div>").addClass("ui").appendTo(document.body);

var adminPanel = $("<div></div>").addClass("admin").appendTo(adminRoot);
$("<h1/>").text("MOD").appendTo(adminPanel);

var handReset = $("<input/>", {type: 'checkbox', id: 'admin-hr', checked: 'checked'}).appendTo(adminPanel);
$("<label/>", {for: 'admin-hr', text: 'Disable hand reset'}).appendTo(adminPanel);

$("<br/>").appendTo(adminPanel);

var cooldownOverride = $("<input/>", {type: 'checkbox', id: 'admin-co', checked: 'checked'}).appendTo(adminPanel);
$("<label/>", {for: 'admin-co', text: "Override cooldown"}).appendTo(adminPanel);

var adminCDOverride = function() {
  var state = cooldownOverride.prop("checked");
  App.socket.send(JSON.stringify({type: "admin_cdoverride", override: state}));
};

cooldownOverride.onclick = adminCDOverride;
window.onload = adminCDOverride;
