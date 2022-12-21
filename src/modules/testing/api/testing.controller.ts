import { Controller, Delete, HttpCode } from '@nestjs/common';
import { TestingService } from '../application/testing.service';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('testing')
export class TestingController {
  constructor(private readonly testingService: TestingService) {}

  @Delete('all-data')
  @HttpCode(204)
  wipeAllData() {
    return this.testingService.wipeAllData();
  }
}
