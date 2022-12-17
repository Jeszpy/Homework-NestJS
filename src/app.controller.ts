import { Controller, Get, Post } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  hello() {
    return { msg: 'Hello from Vercel' };
  }

  @Post()
  async helloYandex() {
    return 'hi';
  }
}
