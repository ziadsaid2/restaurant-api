import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard) 
  findAll() {
    return this.ordersService.findAll();
  }

  @Get('my-orders')
  @UseGuards(JwtAuthGuard) 
  findMyOrders(@Request() req: any) {
    const userId = req.user.id;
    return this.ordersService.findByUserId(userId);
  }


  @Get('cart')
  @UseGuards(JwtAuthGuard)
  getCart(@Request() req: any) {
    return this.ordersService.getCart(req.user.id);
  }

  @Post('cart')
  @UseGuards(JwtAuthGuard)
  addToCart(@Body() addToCartDto: AddToCartDto, @Request() req: any) {
    return this.ordersService.addToCart(req.user.id, addToCartDto);
  }

  @Patch('cart/items/:menuItemId')
  @UseGuards(JwtAuthGuard)
  updateCartItem(
    @Param('menuItemId') menuItemId: string,
    @Body() updateDto: UpdateCartItemDto,
    @Request() req: any,
  ) {
    return this.ordersService.updateCartItem(req.user.id, menuItemId, updateDto);
  }

  @Delete('cart/items/:menuItemId')
  @UseGuards(JwtAuthGuard)
  removeFromCart(@Param('menuItemId') menuItemId: string, @Request() req: any) {
    return this.ordersService.removeFromCart(req.user.id, menuItemId);
  }

  @Delete('cart')
  @UseGuards(JwtAuthGuard)
  clearCart(@Request() req: any) {
    return this.ordersService.clearCart(req.user.id);
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  checkout(@Body() checkoutDto: CheckoutDto, @Request() req: any) {
    return this.ordersService.checkout(req.user.id, checkoutDto);
  }


  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminGuard) 
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard) 
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard) 
  remove(@Param('id') id: string, @Request() req: any) {
    return this.ordersService.remove(id, req.user.id);
  }
}
