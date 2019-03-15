const { get } = _;

window.addEventListener('load', function () {
  // At first, let's check if we have permission for notification
  // If not, let's ask for i
  console.log('load', window.Notification, Notification.permission);
  if (window.Notification && Notification.permission !== 'granted') {
    Notification.requestPermission().then(function (status) {
      if (Notification.permission !== status) {
        Notification.permission = status;
      }
    });
  }
});

let user;

gameEvent = ({ event = 'heartbeat', data }) => {
  return JSON.stringify({
    id: user,
    event,
    ...data
  });
};

(() => {
  console.log('init');

  // websocket config
  const connection = new WebSocket('wss://echo.websocket.org');

  connection.onopen = msg => {
    // send connect event
    // recieve user id
    connection.send(JSON.stringify({
      event: 'connect',
      data: {
        id: 123
      }
    }));
  };

  connection.onmessage = msg => {
    const event = JSON.parse(msg.data);
    switch (event.event) {
      case 'connect':
        user = get(event, 'data.id');
        break;
      case 'notify':
        new Notification(get(event, 'data.title'), {
          body: get(event, 'data.message')
        });
        break;
      default:
        console.log(event);
        break;
    }
  };


  // game button
  document.getElementById('cg-action').addEventListener('click', () => {
    console.log('clicked');
    connection.send(
      gameEvent({
        event: 'click',
        data: {
          some: 'data'
        }
      })
    );
  });
})();
