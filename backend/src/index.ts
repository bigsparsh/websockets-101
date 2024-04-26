import { WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";
import User from "./User";

const wss = new WebSocketServer({ port: 8080 });

const userArray: User[] = [];

wss.on("connection", (ws) => {
  userArray.push(new User(uuidv4(), ws));

  ws.on("message", (message) => {
    const data = JSON.parse(message.toString());
    // if the message is a connection message
    if (data.type === "connection") {
      const user = userArray.find((user) => user.ws === ws);
      if (user) {
        user.username = data.payload.username;
        ws.send(
          JSON.stringify({
            type: "your info",
            payload: {
              message: user?.username + " has joined the game",
              x: user?.posx,
              y: user?.posy,
              id: user?.id,
              username: user?.username,
            },
          }),
        );
      }
      // send user join message to every client
      wss.clients.forEach(function each(client) {
        if (client !== ws) {
          client.send(
            JSON.stringify({
              type: "player join",
              payload: {
                message: user?.username + " has joined the game",
                id: user?.id,
                username: user?.username,
              },
            }),
          );
        }
      });
      // send all users to the new user
      ws.send(
        JSON.stringify({
          type: "all users",
          payload: {
            users: userArray.map((user) => ({
              id: user.id,
              username: user.username,
            })),
          },
        }),
      );
    }
    // if the message is a move message
    if (data.type === "move") {
      const user = userArray.find((user) => user.ws === ws);
      if (user) {
        // send move message to every client
        console.log("Client amt: " + wss.clients.size);
        wss.clients.forEach(function each(client) {
          if (client !== ws)
            client.send(
              JSON.stringify({
                type: "player move",
                payload: {
                  id: user.id,
                  x: data.payload.x,
                  y: data.payload.y,
                },
              }),
            );
        });
      }
    }
  });

  ws.on("close", () => {
    const user = userArray.find((user) => user.ws === ws);
    if (user) {
      userArray.splice(userArray.indexOf(user), 1);
      // send user leave message to every client
      wss.clients.forEach(function each(client) {
        if (client !== ws) {
          client.send(
            JSON.stringify({
              type: "player leave",
              payload: {
                message: user?.username + " has left the game",
                id: user?.id,
              },
            }),
          );
        }
      });
    }
  });
});
