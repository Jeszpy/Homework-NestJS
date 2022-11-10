import { Controller, Get } from '@nestjs/common';

@Controller('app')
export class AppController {
  @Get()
  hello() {
    return { msg: 'hello from Vercel' };
  }
}
