import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  findAll() {
    return this.usersService.findAll();
  }

  // Get the current user's profile
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: any) {
    return this.usersService.findOne(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard,AdminGuard)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req: any) {
    
    // The user can only update his own profile, or the admin can update any user
    if (req.user.id !== id && req.user.role !== 'admin') {
      throw new ForbiddenException('You can only update your own profile');
    }

    // If the regular user wants to change role for himself - rejected (security)
    if (req.user.role !== 'admin' && updateUserDto.role) {
      throw new ForbiddenException('Only admins can change user roles');
    }

    return this.usersService.update(id, updateUserDto);
  }

  // Delete user (for admin only)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
