import { Blog } from './blog.schema';

export class BlogViewModel {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  constructor(blogModel: Blog) {
    this.id = blogModel.id;
    this.name = blogModel.name;
    this.description = blogModel.description;
    this.websiteUrl = blogModel.websiteUrl;
    this.createdAt = blogModel.createdAt;
  }
}
