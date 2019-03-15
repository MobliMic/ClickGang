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
  const payload = {
    id: user,
    event,
    data
  };

  console.groupCollapsed(`Send: ${ event }`);
  console.log(payload);
  console.groupEnd();

  return JSON.stringify(payload);
};

(() => {
  const cgButton = document.getElementById('cg-action');

  // websocket config
  const connection = new WebSocket('wss://echo.websocket.org');

  // inform server of disconnect when user closes window
  window.addEventListener('beforeunload', () => {
    if (user) {
      connection.send(gameEvent({ event: 'disconnect' }));
    }
  });

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

    // debugging
    console.groupCollapsed(`Recieved: ${ event.event }`);
    console.log('response', msg);
    console.log('payload', event);
    console.groupEnd();

    switch (event.event) {
      case 'connect':
        user = get(event, 'data.id');
        break;
      case 'notify':
        new Notification(get(event, 'data.title'), {
          body: get(event, 'data.message')
        });
        break;
      case 'turn':
        cgButton.classList.add('active');
        break;
      default:
        console.log(event);
        break;
    }
  };

  // game button
  cgButton.addEventListener('click', () => {
    console.log('clicked');
    connection.send(
      gameEvent({
        event: 'turn',
        data: {
          some: 'data'
        }
      })
    );
  });
})();
