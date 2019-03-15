window.addEventListener("load", function() {
  // At first, let's check if we have permission for notification
  // If not, let's ask for i
  console.log('load', window.Notification, Notification.permission);
  if (window.Notification && Notification.permission !== "granted") {
    Notification.requestPermission().then(function(status) {
      if (Notification.permission !== status) {
        Notification.permission = status;
      }
    });
  }
});

(() => {
  console.log("init");

  // websocket config
  const clickGangSocket = new WebSocket("wss://echo.websocket.org");

  clickGangSocket.onmessage = msg => {
    console.log(JSON.parse(msg.data).message);
    const notif = new Notification(JSON.parse(msg.data).message, {
      body: "QUICK! CLICK!"
    });
    console.log(msg, msg.data, notif);
  };

  // game actions

  // game button
  document.getElementById("cg-action").addEventListener("click", () => {
    console.log("clicked");
    console.log(Notification.permission);
    clickGangSocket.send(
      JSON.stringify({
        message: "click action",
        id: 123
      })
    );
  });
})();
