import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/common';
import { ModerationService } from './moderation.service';
import { JwtGuard } from '../auth/jwt.guard';

@ApiTags('Moderation')
@Controller('moderation')
export class ModerationController {
  constructor(private moderationService: ModerationService) {}

  @Get('queue')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get moderation queue (admin only)' })
  async getQueue(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Request() req?: any,
  ) {
    if (req.user.role !== 'staff') {
      throw new ForbiddenException('Admin access required');
    }

    const result = await this.moderationService.getQueue(
      status || 'pending',
      page ? parseInt(page) : 1,
    );

    return {
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        total: result.total,
        limit: result.limit,
        pages: result.pages,
      },
      timestamp: new Date(),
    };
  }

  @Get('stats')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get moderation stats (admin only)' })
  async getStats(@Request() req: any) {
    if (req.user.role !== 'staff') {
      throw new ForbiddenException('Admin access required');
    }

    const stats = await this.moderationService.getStats();
    return {
      success: true,
      data: stats,
      timestamp: new Date(),
    };
  }

  @Post('flag/:listingId')
  @ApiOperation({ summary: 'Flag a listing for review' })
  async flagListing(
    @Param('listingId') listingId: string,
    @Body() body: { reason: string },
    @Request() req?: any,
  ) {
    const flag = await this.moderationService.flagListing(
      parseInt(listingId),
      body.reason,
      req?.user?.id,
    );

    return {
      success: true,
      data: flag,
      timestamp: new Date(),
    };
  }

  @Get('listing/:listingId')
  @ApiOperation({ summary: 'Get flags for a listing' })
  async getListingFlags(@Param('listingId') listingId: string) {
    const flags = await this.moderationService.getListingFlags(
      parseInt(listingId),
    );

    return {
      success: true,
      data: flags,
      timestamp: new Date(),
    };
  }

  @Post('approve/:flagId')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve flag (admin only)' })
  async approveFlag(
    @Param('flagId') flagId: string,
    @Request() req: any,
  ) {
    if (req.user.role !== 'staff') {
      throw new ForbiddenException('Admin access required');
    }

    const flag = await this.moderationService.approveFlag(
      parseInt(flagId),
      req.user.id,
    );

    return {
      success: true,
      data: flag,
      timestamp: new Date(),
    };
  }

  @Post('reject/:flagId')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject flag (admin only)' })
  async rejectFlag(
    @Param('flagId') flagId: string,
    @Body() body: { reason: string },
    @Request() req: any,
  ) {
    if (req.user.role !== 'staff') {
      throw new ForbiddenException('Admin access required');
    }

    const flag = await this.moderationService.rejectFlag(
      parseInt(flagId),
      req.user.id,
      body.reason,
    );

    return {
      success: true,
      data: flag,
      timestamp: new Date(),
    };
  }
}
