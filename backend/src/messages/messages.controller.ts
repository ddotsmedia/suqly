import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { JwtGuard } from '../auth/jwt.guard';

@ApiTags('Messages')
@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get('conversations')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all conversations for user' })
  async getConversations(@Request() req: any) {
    const conversations =
      await this.messagesService.getUserConversations(req.user.id);
    return {
      success: true,
      data: conversations,
      timestamp: new Date(),
    };
  }

  @Get('listing/:listingId')
  @ApiOperation({ summary: 'Get all messages for a listing' })
  async getListingMessages(
    @Param('listingId') listingId: string,
    @Query('page') page?: string,
  ) {
    const result = await this.messagesService.getMessagesForListing(
      parseInt(listingId),
      page ? parseInt(page) : 1,
    );
    return {
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        total: result.total,
        limit: result.limit,
      },
      timestamp: new Date(),
    };
  }

  @Get(':userId')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get conversation with specific user' })
  async getConversation(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Request() req?: any,
  ) {
    const result = await this.messagesService.getConversation(
      req.user.id,
      parseInt(userId),
      page ? parseInt(page) : 1,
    );
    return {
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        total: result.total,
        limit: result.limit,
      },
      timestamp: new Date(),
    };
  }
}
