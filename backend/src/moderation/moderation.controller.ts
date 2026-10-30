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
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
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
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Flag a listing for review (sign-in required)' })
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

  @Post('flag/:flagId/appeal')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Appeal a rejected flag (listing owner only)' })
  async appealFlag(
    @Param('flagId') flagId: string,
    @Body() body: { reason: string },
    @Request() req: any,
  ) {
    if (!body?.reason || body.reason.trim().length < 10) {
      throw new BadRequestException('Please explain your appeal (at least 10 characters)');
    }
    const flag = await this.moderationService.appealFlag(
      parseInt(flagId),
      req.user.id,
      body.reason.trim(),
    );
    return { success: true, data: flag, timestamp: new Date() };
  }

  @Get('appeals')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List appeals by status (admin only)' })
  async getAppeals(@Query('status') status: string, @Request() req: any) {
    if (req.user.role !== 'staff') {
      throw new ForbiddenException('Admin access required');
    }
    const appeals = await this.moderationService.getAppeals(status || 'pending');
    return { success: true, data: appeals, timestamp: new Date() };
  }

  @Post('appeal/:flagId/resolve')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Decide an appeal (admin only)' })
  async resolveAppeal(
    @Param('flagId') flagId: string,
    @Body() body: { decision: 'upheld' | 'overturned'; note: string },
    @Request() req: any,
  ) {
    if (req.user.role !== 'staff') {
      throw new ForbiddenException('Admin access required');
    }
    if (body?.decision !== 'upheld' && body?.decision !== 'overturned') {
      throw new BadRequestException("decision must be 'upheld' or 'overturned'");
    }
    const flag = await this.moderationService.resolveAppeal(
      parseInt(flagId),
      req.user.id,
      body.decision,
      body.note ?? '',
    );
    return { success: true, data: flag, timestamp: new Date() };
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
