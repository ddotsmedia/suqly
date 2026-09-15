import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  Request,
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtGuard } from '../auth/jwt.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get user profile (public)' })
  async getUserProfile(@Param('id') id: string) {
    const profile = await this.usersService.getPublicProfile(parseInt(id));
    return {
      success: true,
      data: profile,
      timestamp: new Date(),
    };
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get seller stats' })
  async getSellerStats(@Param('id') id: string) {
    const stats = await this.usersService.getSellerStats(parseInt(id));
    return {
      success: true,
      data: stats,
      timestamp: new Date(),
    };
  }

  @Put(':id')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile (authenticated)' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateData: any,
    @Request() req: any,
  ) {
    // Only allow users to update their own profile
    if (req.user.id !== parseInt(id)) {
      return {
        success: false,
        error: 'Unauthorized',
        timestamp: new Date(),
      };
    }

    const updated = await this.usersService.updateUser(
      parseInt(id),
      updateData,
    );
    return {
      success: true,
      data: updated,
      timestamp: new Date(),
    };
  }
}
