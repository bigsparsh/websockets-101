class User {
  id: String;
  posx: number = 0;
  posy: number = 0;
  username: String | undefined;
  constructor(id: string, username: string) {
    this.username = username;
    this.id = id;
  }
}
export default User;
