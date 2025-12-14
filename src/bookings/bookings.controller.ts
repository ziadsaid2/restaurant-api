import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, ForbiddenException } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createBookingDto: CreateBookingDto, @Request() req: any) {
    const userId = req.user.id; 
    return this.bookingsService.create(createBookingDto, userId);
  }


  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard) 
  findAll() {
    return this.bookingsService.findAll();
  }

  
  @Get('my-bookings')
  @UseGuards(JwtAuthGuard) 
  findMyBookings(@Request() req: any) {
    const userId = req.user.id;
    return this.bookingsService.findByUserId(userId);
  }

  // الادمن بس الي يقدر يجيب اي حجز بالاي دي عشان الخصوصيه بتاع المستخدم
  @Get(':id')
  @UseGuards(JwtAuthGuard,AdminGuard) 
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }


  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard) 
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingsService.update(id, updateBookingDto);
  }

  // حذف حجز (المستخدم يحذف حجزه فقط)
  @Delete(':id')
  @UseGuards(JwtAuthGuard) // لازم يكون مسجل دخول
  remove(@Param('id') id: string, @Request() req: any) {
    if(req.user.role == 'admin') {
      return this.bookingsService.remove(id);
    }
    return this.bookingsService.remove(id);
  }
}
