"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const uuid_1 = require("uuid");
const User_1 = __importDefault(require("./User"));
const wss = new ws_1.WebSocketServer({ port: 8080 });
const userArray = [];
wss.on("connection", (ws) => {
    userArray.push(new User_1.default((0, uuid_1.v4)(), ws));
    ws.on("message", (message) => {
        const data = JSON.parse(message.toString());
        // if the message is a connection message
        if (data.type === "connection") {
            const user = userArray.find((user) => user.ws === ws);
            if (user) {
                user.username = data.payload.username;
                ws.send(JSON.stringify({
                    type: "your info",
                    payload: {
                        message: (user === null || user === void 0 ? void 0 : user.username) + " has joined the game",
                        x: user === null || user === void 0 ? void 0 : user.posx,
                        y: user === null || user === void 0 ? void 0 : user.posy,
                        id: user === null || user === void 0 ? void 0 : user.id,
                        username: user === null || user === void 0 ? void 0 : user.username,
                    },
                }));
            }
            // send user join message to every client
            wss.clients.forEach(function each(client) {
                if (client !== ws) {
                    client.send(JSON.stringify({
                        type: "player join",
                        payload: {
                            message: (user === null || user === void 0 ? void 0 : user.username) + " has joined the game",
                            id: user === null || user === void 0 ? void 0 : user.id,
                            username: user === null || user === void 0 ? void 0 : user.username,
                        },
                    }));
                }
            });
            // send all users to the new user
            ws.send(JSON.stringify({
                type: "all users",
                payload: {
                    users: userArray.map((user) => ({
                        id: user.id,
                        username: user.username,
                    })),
                },
            }));
        }
        // if the message is a move message
        if (data.type === "move") {
            const user = userArray.find((user) => user.ws === ws);
            if (user) {
                // send move message to every client
                console.log("Client amt: " + wss.clients.size);
                wss.clients.forEach(function each(client) {
                    if (client !== ws)
                        client.send(JSON.stringify({
                            type: "player move",
                            payload: {
                                id: user.id,
                                x: data.payload.x,
                                y: data.payload.y,
                            },
                        }));
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
                    client.send(JSON.stringify({
                        type: "player leave",
                        payload: {
                            message: (user === null || user === void 0 ? void 0 : user.username) + " has left the game",
                            id: user === null || user === void 0 ? void 0 : user.id,
                        },
                    }));
                }
            });
        }
    });
});
