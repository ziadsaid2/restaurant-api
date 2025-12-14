import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Booking } from './entities/booking.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private readonly bookingModel: Model<Booking>,
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
  ) { }

  // إنشاء حجز جديد (للمستخدمين العاديين)
  async create(createBookingDto: CreateBookingDto, userId: string) {
    const bookingDateTime = new Date(`${createBookingDto.date}T${createBookingDto.time}`);
    const now = new Date();

    if (bookingDateTime < now) {
      throw new BadRequestException('Booking date and time cannot be in the past');
    }

    const existingBooking = await this.bookingModel.findOne({
      date: createBookingDto.date,
      time: createBookingDto.time,
      tableNumber: createBookingDto.tableNumber,
      status: { $ne: 'Rejected' },
    }).exec();

    if (existingBooking) {
      throw new BadRequestException(`Table ${createBookingDto.tableNumber} is already booked at this time`);
    }

    const newBooking = new this.bookingModel({
      ...createBookingDto,
      date: new Date(createBookingDto.date),
      userId: new Types.ObjectId(userId),
      status: 'Pending',
    });

    const savedBooking = await newBooking.save();

    // ننشئ إشعار للمستخدم إن الحجز تم إنشاؤه
    await this.notificationsService.create(
      userId,
      'Your booking has been received!',
      `Your booking for table ${createBookingDto.tableNumber} on ${createBookingDto.date} at ${createBookingDto.time} has been received and will be reviewed shortly.`,
      'booking',
      savedBooking._id.toString(),
      { bookingId: savedBooking._id.toString(), status: 'Pending' },
    );

    // ننشئ إشعار لجميع الأدمن
    const admins = await this.usersService.findAllAdmins();
    if (admins.length > 0) {
      const adminIds = admins.map(admin => admin._id.toString());
      await this.notificationsService.notifyAllAdmins(
        adminIds,
        'New Booking Received',
        `A new booking for table ${createBookingDto.tableNumber} on ${createBookingDto.date} at ${createBookingDto.time} has been received and needs review.`,
        'booking',
        savedBooking._id.toString(),
        { bookingId: savedBooking._id.toString(), status: 'Pending' },
      );
    }

    return savedBooking;
  }


  // جلب كل الحجوزات (للـ admin)
  async findAll() {
    return await this.bookingModel.find().populate('userId', 'name email phone').exec(); // populate يعني نجيب بيانات الـ user مع الحجز
  }

  // جلب حجوزات مستخدم معين (للـ user نفسه)
  async findByUserId(userId: string) {
    return await this.bookingModel.find({ userId: new Types.ObjectId(userId) }).exec();
  }

  // جلب حجز واحد بالـ ID
  async findOne(id: string) {
    const booking = await this.bookingModel.findById(id).populate('userId', 'name email phone').exec();
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }
    return booking;
  }

  // تحديث حالة الحجز (للـ admin: Accept أو Reject)
  async update(id: string, updateBookingDto: UpdateBookingDto) {
    const booking = await this.bookingModel.findById(id).exec();
    
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    const oldStatus = booking.status;
    const updatedBooking = await this.bookingModel
      .findByIdAndUpdate(id, updateBookingDto, { new: true })
      .populate('userId', 'name email phone')
      .exec();

    // لو تغيرت الحالة، ننشئ إشعار للمستخدم
  // If the booking status has changed
if (updateBookingDto.status && updateBookingDto.status !== oldStatus) {
  // Predefined messages for each status
  const statusMessages: Record<string, string> = {
    'Accepted': 'Your booking has been accepted!',
    'In Progress': 'Your booking is being prepared',
    'Delivered': 'Your booking has been successfully delivered!',
    'Rejected': 'Your booking has been rejected',
  };

  // Create a notification for the user
  await this.notificationsService.create(
    booking.userId.toString(), // User ID as string
    `Booking Status Update #${id.slice(-6)}`, // Notification title
    statusMessages[updateBookingDto.status] || `Your booking status has been updated to: ${updateBookingDto.status}`, // Notification message
    'booking', // Type of notification
    id, // Related entity ID (the booking ID)
    { bookingId: id, status: updateBookingDto.status }, // Extra data payload
  );
}


    return updatedBooking;
  }

  // حذف حجز (المستخدم يحذف حجزه فقط)
  async remove(id: string, userId?: string) {
    const booking = await this.bookingModel.findById(id).exec();
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    // لو في userId، نتحقق إن الحجز بتاعه
    if (userId && booking.userId.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own bookings');
    }

    const deletedBooking = await this.bookingModel.findByIdAndDelete(id).exec();
    return { message: 'Booking deleted successfully' };
  }
}
