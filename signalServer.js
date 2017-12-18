var WebSocketServer = require('ws').Server;

const MESSAGE_TYPES = {
  LOGIN : 'login',
  LOGOUT : 'logout',
  OFFER : 'offer',
  ANSWER : 'answer',
  CANDIDATE : 'candidate',
  USERS : 'users'
};


class ChatSignallingServer {

  constructor() {
    let port = process.env.PORT || 3000;
    this.server = new WebSocketServer({port : port});
    this.users = {};
    this.authActions = [
      MESSAGE_TYPES.LOGOUT,
      MESSAGE_TYPES.OFFER,
      MESSAGE_TYPES.ANSWER,
      MESSAGE_TYPES.CANDIDATE,
      MESSAGE_TYPES.USERS,
    ];

    console.log(`Listening on ${port}`);
  }

  parseMessage(message) {
    try {
      return JSON.parse(message);
    } catch (e) {
      return null
    }
  }

  send(connection, data) {
    connection.send(JSON.stringify(data));
  }

  getAllConnections(filter = [], exclude = []) {
    let connections = Object.keys(this.users)
      .filter(name => filter.length ? filter.indexOf(name) !== -1 : true)
      .filter(name => exclude.length ? exclude.indexOf(name) === -1 : true)
      .map(name => this.users[name]);

    return connections;
  }

  getUserConnection(name) {
    return this.users[name];
  }

  addUserConnection(name, connection) {
    connection.name = name;
    this.users[name] = connection;
  }

  removeUserConnection(name) {

    let userConnection = this.users[name];
    if (userConnection) userConnection.terminate();
    delete this.users[name];
  }

  isLoggedIn(name) {
    return !!this.getUserConnection(name);
  }


  checkForLogin(type, name, connection) {

    if (this.authActions.indexOf(type) !== -1 && !this.isLoggedIn(name)) {
      this.send(connection, {
        type : type,
        success : false,
        reason : 'Not logged in'
      });

      return false;
    }
    return true;
  }


  login(connection, data) {
    console.log(`User '${data.name}' is trying to login.`);

    let userConnection = this.getUserConnection(data.name);

    if (userConnection) {
      this.send(userConnection,
        {
          type : MESSAGE_TYPES.LOGIN,
          success : false,
          reason : "Username is already taken. Try different one."
        });
    } else {
      this.addUserConnection(data.name, connection);
      this.send(connection, {
        type : MESSAGE_TYPES.LOGIN,
        success : true
      });
    }
  }

  logout(connection, data) {

    console.log(`Disconnecting '${data.name}'`);
    if (this.isLoggedIn(data.name)) {
      this.removeUserConnection(data.name);
      this.getAllConnections([], [data.name])
        .forEach(conn => this.send(conn, {
          type : MESSAGE_TYPES.LOGOUT,
          success : true,
          name : data.name
        }));
    }
  }

  offer(connection, data) {
    // data.name - name of user that sends offer
    // data.peername - name of user to whom this offer
    if (!this.isLoggedIn(data.peername)) return;

    let userConnection = this.getUserConnection(data.peername);
    this.send(userConnection, {
      type : MESSAGE_TYPES.OFFER,
      success : true,
      offer : data.offer,
      name : data.name
    })
  }

  answer(connection, data) {
    // data.name - name of user which sends answer
    // data.peername - name of user to whom this answer
    if (!this.isLoggedIn(data.peername)) return;

    let userConnection = this.getUserConnection(data.peername);
    this.send(userConnection, {
      type : MESSAGE_TYPES.ANSWER,
      success : true,
      answer : data.answer,
      name : data.name
    });

  }


  getUsers(connection, data) {
    // data.name - name of user which sends request
    if (!this.isLoggedIn(data.name)) return;
    this.send(connection, {
      type : MESSAGE_TYPES.USERS,
      success : true,
      users : Object.keys(this.users)
    });

  }


  processRequest(connection, message) {
    let data = this.parseMessage(message);
    if (data === null) return;

    console.log(`New request \n${message}`);
    this.checkForLogin(data.type, data.name, connection);

    switch (data.type) {
      case MESSAGE_TYPES.LOGIN:
        this.login(connection, data);
        break;
      case MESSAGE_TYPES.LOGOUT:
        this.logout(connection, data);
        break;
      case MESSAGE_TYPES.OFFER:
        this.offer(connection, data);
        break;
      case MESSAGE_TYPES.ANSWER:
        this.answer(connection, data);
        break;
      case MESSAGE_TYPES.CANDIDATE:
        break;
      case MESSAGE_TYPES.USERS:
        this.getUsers(connection, data);
        break;
      default:
        this.send(connection, {
          type : data.type,
          success : false,
          reason : `Unknown action '${data.type}'.`
        });
        break;
    }

  }

  init() {
    this.server.on('connection', (connection) => {
      connection.on('message', (message) => this.processRequest(connection, message));
      connection.on("close", () => {
        this.logout(connection, {
          name : connection.name
        })
      });
    })
  }
}

let server = new ChatSignallingServer();
server.init();

