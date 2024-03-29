const { get } = _;

let user;

gameEvent = ({ event = 'heartbeat', data }) => {
  const payload = {
    event,
    timestamp: new Date().toISOString(),
    id: user,
    data: {
      ...data,
    }
  };

  console.groupCollapsed(`Send: ${ event }`);
  console.log(payload);
  console.groupEnd();

  return JSON.stringify(payload);
};

handleDisconnect = (serverTriggered) => {
  if (serverTriggered) {
    console.log('server triggered disconnect');
  } else {
    console.log('disconnect');
  }
};

initClickGang = () => {
  const cgButton = document.getElementById('cg-action');

  // websocket config
  const connection = new WebSocket('ws://localhost:3117/game');

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
    }));
  };

  connection.onclose = () => {
    handleDisconnect();
  };

  connection.onerror = (msg) => {
    throw new Error('Websocket connection error');
  };

  connection.onmessage = msg => {
    const event = JSON.parse(msg.data);

    // debugging
    console.groupCollapsed(`Recieved: ${ event.event }`);
    console.log('response', msg);
    console.log('payload', event);
    console.groupEnd();

    switch (event.event) {
      case 'connected':
        // {"event": "connected", "data": { "id": "xxxx-xxxxxxxx-xxx–xxxxxx" }}
        user = get(event, 'data.id');
        break;
      case 'disconnected':
        // {"event": "disconnected"}
        handleDisconnect(true);
        break;
      case 'round_started':
        // {"event": "round_started", "data": {"timestamp": "..."}}
        break;
      case 'round_ended':
        // {"event": "round_ended", "data": {"timestamp": "..."}}
        break;
      case 'round_crashed':
        // {"event": "round_crashed", "data":{"timestamp": "..."}}
        break;
      case 'round_tick':
        // game pause logic
        //{"event": "round_tick", "data": {"total_players": 60, "remaining_players": 35, "timestamp":"..."}}
        break;
      case 'notify':
        new Notification(get(event, 'data.title'), {
          body: get(event, 'data.message')
        });
        break;
      case 'click_requested':
        cgButton.classList.add('active');
        break;
      default:
        console.log(event);
        break;
    }
  };


  // click response
  // game button
  cgButton.addEventListener('click', () => {
    console.log('clicked');
    connection.send(
      gameEvent({
        event: 'click_response',
      })
    );
  });
};

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

  initClickGang();
});
