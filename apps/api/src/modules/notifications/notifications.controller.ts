import { Controller, Get, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get() findAll(@Req() req: any) { return this.notificationsService.findAll(req.user.id); }
  @Get('unread-count') getUnreadCount(@Req() req: any) { return this.notificationsService.getUnreadCount(req.user.id); }
  @Patch(':id/read') markRead(@Req() req: any, @Param('id') id: string) { return this.notificationsService.markRead(id, req.user.id); }
  @Patch('read-all') markAllRead(@Req() req: any) { return this.notificationsService.markAllRead(req.user.id); }
}
