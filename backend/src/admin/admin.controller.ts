import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtGuard } from '../auth/jwt.guard';
import { ModerationService } from '../moderation/moderation.service';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(
    private adminService: AdminService,
    private moderationService: ModerationService,
  ) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get admin dashboard stats' })
  async getStats() {
    const stats = await this.adminService.getStats();
    return {
      success: true,
      data: stats,
      timestamp: new Date(),
    };
  }

  @Get('flagged-listings')
  @ApiOperation({ summary: 'Get flagged listings' })
  async getFlaggedListings(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const result = await this.adminService.getFlaggedListings(parseInt(page), parseInt(limit));
    return {
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        pages: result.pages,
      },
      timestamp: new Date(),
    };
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get transaction stats' })
  async getTransactionStats() {
    const stats = await this.adminService.getTransactionStats();
    return {
      success: true,
      data: stats,
      timestamp: new Date(),
    };
  }

  @Post('moderate/:flagId')
  @ApiOperation({ summary: 'Moderate a flagged listing' })
  async moderate(
    @Param('flagId') flagId: string,
    @Body() body: { action: 'approve' | 'reject'; reason?: string },
    @Request() req: any,
  ) {
    if (body.action === 'approve') {
      await this.moderationService.approveFlag(parseInt(flagId), req.user.id);
    } else {
      await this.moderationService.rejectFlag(parseInt(flagId), req.user.id, body.reason || '');
    }

    return {
      success: true,
      timestamp: new Date(),
    };
  }
}
