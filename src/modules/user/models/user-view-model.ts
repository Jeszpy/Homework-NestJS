import { BanInfo } from './user.schema';

export class UserViewModel {
  id: string;
  login: string;
  email: string;
  createdAt: string;
  banInfo: BanInfo;
  constructor(
    id: string,
    login: string,
    email: string,
    createdAt: string,
    banInfo: BanInfo,
  ) {
    this.id = id;
    this.login = login;
    this.email = email;
    this.createdAt = createdAt;
    this.banInfo = banInfo;
  }
}
