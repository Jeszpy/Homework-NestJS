import { Blog } from '../../src/modules/blog/models/blogs.schema';
import { Post } from '../../src/modules/post/models/post.schema';
import { CreatePostDto } from '../../src/modules/post/dto/create-post.dto';

export const superUser = {
  login: 'admin',
  password: 'qwerty',
};

export const preparedBlog = {
  valid: {
    name: 'valid name',
    description: 'valid description',
    websiteUrl: 'https://it-incubator.io/',
  },
  newValid: {
    name: 'new valid name',
    description: 'new valid description',
    websiteUrl: 'https://it-incubator.io/new',
  },
  invalid: {
    name: '',
    description: '',
    websiteUrl: '',
  },
};

export const preparedPost = {
  valid: {
    title: 'valid title',
    shortDescription: 'valid shortDescription',
    content: 'valid content',
  },
  newValid: {
    title: 'new valid title',
    shortDescription: 'new valid shortDescription',
    content: 'new valid content',
  },
  invalid: {
    title: '',
    shortDescription: '',
    content: '',
    blogId: '',
  },
  generatePostInputData(blog: Blog): CreatePostDto {
    return {
      ...preparedPost.valid,
      blogId: blog.id,
    };
  },
  generateNewPostInputData(blog: Blog): CreatePostDto {
    return {
      ...preparedPost.newValid,
      blogId: blog.id,
    };
  },
};
