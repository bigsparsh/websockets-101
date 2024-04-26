import WebSocket from "ws";
class User {
  id: String;
  ws: WebSocket;
  posx: number = rand(0, 800);
  posy: number = rand(0, 600);
  username: String | undefined;
  constructor(id: string, ws: WebSocket) {
    this.id = id;
    this.ws = ws;
  }
  move(x: number, y: number) {
    this.posx = x;
    this.posy = y;
  }
}
export default User;
const rand = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};
