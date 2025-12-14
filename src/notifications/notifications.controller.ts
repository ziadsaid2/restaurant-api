import { Controller, Get, Patch, Param, Delete, Request, UseGuards, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard) // كل الـ endpoints محتاجة authentication
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }
    
    @Get()
    findAll(@Request() req: any) {
        return this.notificationsService.findAll(req.user.id);
    }

    @Get('count')
    getCount(@Request() req: any) {
        return this.notificationsService.getCount(req.user.id);
    }

    @Delete()
    clearAll(@Request() req: any) {
        return this.notificationsService.clearAll(req.user.id);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req: any) {
        return this.notificationsService.remove(id, req.user.id);
    }
}
