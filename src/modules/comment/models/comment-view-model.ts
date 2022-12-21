import { LikesInfo } from './comment.schema';

export class CommentViewModel {
  id: string;
  content: string;
  userId: string;
  userLogin: string;
  createdAt: string;
  likesInfo: LikesInfo;
  constructor(
    id: string,
    content: string,
    userId: string,
    userLogin: string,
    createdAt: string,
    likesInfo: LikesInfo,
  ) {
    this.id = id;
    this.content = content;
    this.userId = userId;
    this.userLogin = userLogin;
    this.createdAt = createdAt;
    this.likesInfo = likesInfo;
  }
}
