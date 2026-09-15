import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  async getHealth() {
    const health = await this.appService.getHealth();
    return {
      success: true,
      data: health,
      timestamp: new Date(),
    };
  }

  @Get('info')
  @ApiOperation({ summary: 'API information' })
  getInfo() {
    return {
      success: true,
      data: this.appService.getInfo(),
      timestamp: new Date(),
    };
  }
}
