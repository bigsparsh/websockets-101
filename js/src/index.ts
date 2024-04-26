import User from "./User";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

const userName = prompt("Enter your name") as string;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let text = "Hello World";
let myID = "";

const myPos = { x: 0, y: 0 };

canvas.style.backgroundColor = "black";
const userArray: User[] = [];

const ws = new WebSocket("ws://localhost:8080");
ws.onopen = () => {
  // send connection request to the ws server with username
  ws.send(
    JSON.stringify({
      type: "connection",
      payload: {
        username: userName,
      },
    }),
  );
  // listen for messages from the ws server
  ws.onmessage = (message) => {
    const data = JSON.parse(message.data);
    // if the message is a list of all users
    if (data.type === "all users") {
      data.payload.users.forEach((user: any) => {
        if (user.id !== myID) userArray.push(new User(user.id, user.username));
      });
    }
    // setting your own myID
    if (data.type === "your info") {
      myID = data.payload.id;
      text = data.payload.message;
      myPos.x = data.payload.x;
      myPos.y = data.payload.y;
      setTimeout(() => {
        text = "";
      }, 2000);
    }
    // if the message is a player join message
    if (data.type === "player join") {
      text = data.payload.message;
      userArray.push(new User(data.payload.id, data.payload.username));
      setTimeout(() => {
        text = "";
      }, 2000);
    }
    // if other player moves then update message
    if (data.type === "player move") {
      const user = userArray.find((user) => user.id === data.payload.id);
      if (user) {
        user.posx = data.payload.x;
        user.posy = data.payload.y;
      }
    }
    // if other player disconnects then update messages
    if (data.type === "player leave") {
      const user = userArray.find((user) => user.id === data.payload.id);
      if (user) {
        text = data.payload.message;
        setTimeout(() => {
          text = "";
        }, 3000);
        userArray.splice(userArray.indexOf(user), 1);
      }
    }
  };
  console.log(userArray);
};

const doUpates = () => {
  window.onkeydown = (e) => {
    if (e.key == "ArrowUp" && myPos.y > 0) {
      myPos.y -= 50;
    }
    if (e.key == "ArrowDown" && myPos.y < canvas.height - 50) {
      myPos.y += 50;
    }
    if (e.key == "ArrowLeft" && myPos.x > 0) {
      myPos.x -= 50;
    }
    if (e.key == "ArrowRight" && myPos.x < canvas.width - 50) {
      myPos.x += 50;
    }
    ws.send(
      JSON.stringify({
        type: "move",
        payload: {
          id: myID,
          x: myPos.x,
          y: myPos.y,
        },
      }),
    );
  };
};

const drawSquare = () => {
  userArray.forEach((user) => {
    if (user) {
      ctx.fillStyle = "blue";
      ctx.fillRect(user.posx, user.posy, 50, 50);
      ctx.fillStyle = "white";
      ctx.font = "20px Arial";
      if (user.username)
        ctx.fillText(String(user.username), user.posx - 2, user.posy - 10);
    }
  });
  ctx.fillStyle = "red";
  ctx.fillRect(myPos.x, myPos.y, 50, 50);
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(userName, myPos.x - 2, myPos.y - 10);
};

const gameLoop = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "green";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText(String(text), 100, 100);

  doUpates();
  drawSquare();

  requestAnimationFrame(gameLoop);
};
gameLoop();
