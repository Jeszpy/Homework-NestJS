import { Blog } from '../../src/modules/blog/models/blog.schema';
import { CreatePostWithBlogIdDto } from '../../src/modules/post/dto/create-post.dto';
import request from 'supertest';
import { CreateUserDto } from '../../src/modules/user/dto/create-user.dto';
import { endpoints } from './routing';
import { CreateBlogDto } from '../../src/modules/blog/dto/create-blog.dto';
import { BlogViewModel } from '../../src/modules/blog/models/blog-view-model';
import { PostViewModel } from '../../src/modules/post/models/post-view-model';

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
  defaultPostsCount: 5,

  generatePostInputData(blog: Blog): CreatePostWithBlogIdDto {
    return {
      ...preparedPost.valid,
      blogId: blog.id,
    };
  },
  generateNewPostInputData(blog: Blog): CreatePostWithBlogIdDto {
    return {
      ...preparedPost.newValid,
      blogId: blog.id,
    };
  },
};

type CreateUserTestType = {
  id: string;
  login: string;
  email: string;
  password: string;
};

type CreateAndLoginUserTestType = {
  id: string;
  login: string;
  email: string;
  password: string;
  accessToken: string;
  refreshToken: string;
};

export class TestingUser {
  constructor(private readonly server: any) {}

  async createUsers(countOfUsers: number): Promise<CreateUserTestType[]> {
    const users = [];
    for (let i = 0; i < countOfUsers; i++) {
      const inputUserData: CreateUserDto = {
        login: `user${i}`,
        email: `user${i}@email.com`,
        password: `password${i}`,
      };
      const response = await request(this.server)
        .post(endpoints.usersController)
        .auth(superUser.login, superUser.password, { type: 'basic' })
        .send(inputUserData);

      users.push({ id: response.body.id, ...inputUserData });
    }
    return users;
  }

  async createAndLoginUsers(
    countOfUsers: number,
  ): Promise<CreateAndLoginUserTestType[]> {
    const users = await this.createUsers(countOfUsers);
    const usersWithTokens = [];
    for (const u of users) {
      const userLoginData = { loginOrEmail: u.login, password: u.password };
      const response = await request(this.server)
        .post(endpoints.authController.login)
        .set('User-Agent', `UA${u.login}`)
        .send(userLoginData);
      const accessToken = response.body.accessToken;
      const refreshToken = response.headers['set-cookie'][0]
        .split(';')[0]
        .split('=')[1];
      usersWithTokens.push({ ...u, accessToken, refreshToken });
    }
    return usersWithTokens;
  }
}

export class TestingBlog {
  constructor(private readonly server: any) {}

  async createBlogs(countOfBlogs: number) {
    const blogs = [];
    for (let i = 0; i < countOfBlogs; i++) {
      const inputBlogData: CreateBlogDto = {
        name: `blog${i}`,
        description: `description${i}`,
        websiteUrl: `websiteUrl${i}@site.test`,
      };
      const response = await request(this.server)
        .post(endpoints.blogController)
        .auth(superUser.login, superUser.password, { type: 'basic' })
        .send(inputBlogData);
      blogs.push(response.body);
    }
    return blogs;
  }

  async createOneBlog() {
    const inputBlogData: CreateBlogDto = {
      name: `name`,
      description: `description`,
      websiteUrl: `websiteUrl@site.test`,
    };
    const response = await request(this.server)
      .post(endpoints.blogController)
      .auth(superUser.login, superUser.password, { type: 'basic' })
      .send(inputBlogData);
    return response.body;
  }
}

export class TestingPost {
  constructor(private readonly server: any) {}

  private testingBlog = new TestingBlog(this.server);

  async createBlogAndPosts(countOfPosts: number): Promise<PostViewModel[]> {
    const blog = await this.testingBlog.createOneBlog();
    return await this.createPostsForBlog(countOfPosts, blog);
  }

  async createBlogAndOnePost(): Promise<PostViewModel> {
    const blog = await this.testingBlog.createOneBlog();
    return await this.createOnePostForBlog(blog);
  }

  async createPostsForBlog(
    countOfPosts: number,
    blog: BlogViewModel,
  ): Promise<PostViewModel[]> {
    const posts = [];
    for (let i = 0; i < countOfPosts; i++) {
      const inputPostData: CreatePostWithBlogIdDto = {
        title: `title${i}`,
        shortDescription: `shortDescription${i}`,
        content: `content${i}`,
        blogId: blog.id,
      };
      const response = await request(this.server)
        .post(endpoints.postController)
        .auth(superUser.login, superUser.password, { type: 'basic' })
        .send(inputPostData);
      posts.push(response.body);
    }
    return posts;
  }

  async createOnePostForBlog(blog: BlogViewModel): Promise<PostViewModel> {
    const inputPostData: CreatePostWithBlogIdDto = {
      title: `title`,
      shortDescription: `shortDescription`,
      content: `content`,
      blogId: blog.id,
    };
    const response = await request(this.server)
      .post(endpoints.postController)
      .auth(superUser.login, superUser.password, { type: 'basic' })
      .send(inputPostData);
    return response.body;
  }
}
