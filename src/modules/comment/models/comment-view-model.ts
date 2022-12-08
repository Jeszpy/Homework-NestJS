export class CommentViewModel {
  id: string;
  content: string;
  userId: string;
  userLogin: string;
  createdAt: string;
  constructor(
    id: string,
    content: string,
    userId: string,
    userLogin: string,
    createdAt: string,
  ) {
    this.id = id;
    this.content = content;
    this.userId = userId;
    this.userLogin = userLogin;
    this.createdAt = createdAt;
  }
}
