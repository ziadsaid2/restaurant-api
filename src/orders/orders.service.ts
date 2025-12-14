import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order } from './entities/order.entity';
import { Cart } from './entities/cart.entity';
import { Menu } from '../menu/entities/menu.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    @InjectModel(Cart.name) private readonly cartModel: Model<Cart>,
    @InjectModel(Menu.name) private readonly menuModel: Model<Menu>,
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
  ) { }

  async findAll() {
    return await this.orderModel
      .find()
      .populate('userId', 'name email phone')
      .populate('items.menuItemId', 'name price')
      .exec();
  }

  async findByUserId(userId: string) {
    return await this.orderModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('items.menuItemId', 'name price image')
      .exec();
  }

  async findOne(id: string) {
    const order = await this.orderModel
      .findById(id)
      .populate('userId', 'name email phone')
      .populate('items.menuItemId', 'name price image description')
      .exec();

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  // تحديث حالة الطلب (للـ admin: Accepted, In Progress, Delivered, Rejected)
  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const order = await this.orderModel.findById(id).exec();
    
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const oldStatus = order.status;
    const updatedOrder = await this.orderModel
      .findByIdAndUpdate(id, updateOrderDto, { new: true })
      .populate('userId', 'name email phone')
      .populate('items.menuItemId', 'name price')
      .exec();

    // لو تغيرت الحالة، ننشئ إشعار للمستخدم
    if (updateOrderDto.status && updateOrderDto.status !== oldStatus) {
      const statusMessages: Record<string, string> = {
        'Accepted': 'Your order has been accepted!',
        'In Progress': 'Your order is being prepared',
        'Delivered': 'Your order has been successfully delivered!',
        'Rejected': 'Your order has been rejected',
      };
      
      // Create a notification for the user
      await this.notificationsService.create(
        order.userId.toString(), // Recipient user ID
        `Order Update #${id.slice(-6)}`, // number not slice id
        statusMessages[updateOrderDto.status] || `Your order status has been updated to: ${updateOrderDto.status}`, // Notification message
        'order', // Notification type
        id, // Related order ID
        { orderId: id, status: updateOrderDto.status } // Additional metadata for frontend
      );
      
    }

    return updatedOrder;
  }

  async remove(id: string, userId?: string) {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // If userId is provided, check if the order belongs to the user
    if (userId && order.userId.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own orders');
    }

    // Cannot delete orders that are already accepted, in progress, or delivered
    if (order.status === 'Accepted' || order.status === 'Delivered' || order.status === 'In Progress') {
      throw new BadRequestException('Cannot delete order that is already accepted, in progress, or delivered');
    }

    const deletedOrder = await this.orderModel.findByIdAndDelete(id).exec();
    return { message: 'Order deleted successfully' };
  }

  async getCart(userId: string) {
    let cart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) }).exec();
  
    if (!cart) {
      // If not found, create a new cart
      cart = new this.cartModel({
        userId: new Types.ObjectId(userId),
        items: [],
        totalPrice: 0,
      });
      await cart.save();
    }
  
    // Calculate the total price
    this.calculateTotalPrice(cart);
    await cart.save(); // Save the updated total price
  
    // Populate after saving
    return await this.cartModel
      .findById(cart._id)
      .populate('items.menuItemId', 'name price image description')
      .exec();
  }

  // Add a menu item to the cart
  async addToCart(userId: string, addToCartDto: AddToCartDto) {
    // Check if the menu item exists
    const menuItem = await this.menuModel.findById(addToCartDto.menuItemId).exec();
    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    // Get or create the cart
    let cart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) }).exec();

    if (!cart) {
      cart = new this.cartModel({
        userId: new Types.ObjectId(userId),
        items: [],
        totalPrice: 0,
      });
    }

    // Check if the item exists in the cart
    const existingItemIndex = cart.items.findIndex(
      item => item.menuItemId.toString() === addToCartDto.menuItemId
    );

    if (existingItemIndex >= 0) {
      // If exists, increase the quantity
      cart.items[existingItemIndex].quantity += addToCartDto.quantity;
    } else {
      // If not exists, add it new
      cart.items.push({
        menuItemId: new Types.ObjectId(addToCartDto.menuItemId),
        quantity: addToCartDto.quantity,
        price: menuItem.price, // Save the current price
      });
    }

    // Calculate the total price
    this.calculateTotalPrice(cart);
    await cart.save();

    return cart.populate('items.menuItemId', 'name price image description');
  }

  // Update the quantity of a menu item in the cart
  async updateCartItem(userId: string, menuItemId: string, updateDto: UpdateCartItemDto) {
    const cart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) }).exec();
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const itemIndex = cart.items.findIndex(
      item => item.menuItemId.toString() === menuItemId
    );

    if (itemIndex < 0) {
      throw new NotFoundException('Item not found in cart');
    }

    cart.items[itemIndex].quantity = updateDto.quantity;
    this.calculateTotalPrice(cart);
    await cart.save();

    return cart.populate('items.menuItemId', 'name price image description');
  }

  async removeFromCart(userId: string, menuItemId: string) {
    const cart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) }).exec();
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    if (cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }
    const itemIndex = cart.items.findIndex(item => item.menuItemId.toString() === menuItemId);
    if (itemIndex < 0) {
      throw new NotFoundException('Item not found in cart');
    }
    cart.items.splice(itemIndex, 1);
    this.calculateTotalPrice(cart);
    await cart.save();
    // Populate after saving
    const populatedCart = await this.cartModel
      .findById(cart._id)
      .populate('items.menuItemId', 'name price image description')
      .exec();
    return { message: 'Item removed from cart successfully', cart: populatedCart };
  }

  async clearCart(userId: string) {
    const cart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) }).exec();
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
  
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();
  
    // Return the cart after clearing
    return {
      message: 'Cart cleared successfully',
      cart: await this.cartModel
        .findById(cart._id)
        .populate('items.menuItemId', 'name price image description')
        .exec(),
    };
  }

  // Convert the cart to an order (Checkout)
  async checkout(userId: string, checkoutDto: CheckoutDto) {
    const cart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) })
      .populate('items.menuItemId')
      .exec();

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Convert the cart items to order items
    const orderItems = cart.items.map(item => ({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      price: item.price,
    }));

    // Create the order
    const newOrder = new this.orderModel({
      userId: new Types.ObjectId(userId),
      items: orderItems,
      deliveryAddress: checkoutDto.deliveryAddress,
      phone: checkoutDto.phone,
      paymentMethod: checkoutDto.paymentMethod,
      notes: checkoutDto.notes,
      status: 'Pending',
      totalPrice: cart.totalPrice,
    });

    await newOrder.save();

    // Create a notification for the user
    await this.notificationsService.create(
      userId,
      'Your order has been successfully created!',
      `Your order #${newOrder._id.toString().slice(-6)} has been received and will be reviewed shortly.`,
      'order',
      newOrder._id.toString(),
      { orderId: newOrder._id.toString(), status: 'Pending' },
    );

    // Create a notification for all admins
    const admins = await this.usersService.findAllAdmins();
    if (admins.length > 0) {
      const adminIds = admins.map(admin => admin._id.toString());
      await this.notificationsService.notifyAllAdmins(
        adminIds,
        'New Order Received',
        `A new order #${newOrder._id.toString().slice(-6)} has been placed and needs review.`,
        'order',
        newOrder._id.toString(),
        { orderId: newOrder._id.toString(), status: 'Pending' },
      );
    }

    // Clear the cart after creating the order
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    return newOrder.populate('items.menuItemId', 'name price image description');
  }

  // Helper function to calculate the total price
  private calculateTotalPrice(cart: Cart) {
    cart.totalPrice = cart.items.reduce(
      (total, item) => total + (item.price * item.quantity),
      0
    );
  }
}
