import { Blog } from './blog.schema';

export class BlogBySaViewModel {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  blogOwnerInfo: {
    userId: string;
    userLogin: string;
  };
  constructor(blogModel: Blog, userId, userLogin) {
    this.id = blogModel.id;
    this.name = blogModel.name;
    this.description = blogModel.description;
    this.websiteUrl = blogModel.websiteUrl;
    this.createdAt = blogModel.createdAt;
    this.blogOwnerInfo.userId = userId;
    this.blogOwnerInfo.userLogin = userLogin;
  }
}
