export class UserViewModel {
  id: string;
  login: string;
  email: string;
  createdAt: string;
  constructor(id: string, login: string, email: string, createdAt: string) {
    this.id = id;
    this.login = login;
    this.email = email;
    this.createdAt = createdAt;
  }
}
