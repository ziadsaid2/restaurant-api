import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private readonly notificationModel: Model<Notification>,
  ) { }

  async create(userId: string, title: string, message: string, type: string = 'general', relatedId?: string, data?: any) {
    const notification = new this.notificationModel({
      userId: new Types.ObjectId(userId) ,
      title,
      message,
      type,
      relatedId,
      data,
    });

    return await notification.save();
  }

  async findAll(userId: string) {
    const query: any = { userId: new Types.ObjectId(userId) };

    return await this.notificationModel
      .find(query)
      .sort({ createdAt: -1 }) // الأحدث أولاً
      .exec();
  }

  async remove(id: string, userId: string) {
    const notification = await this.notificationModel.findOneAndDelete({
      _id: id,
      userId: new Types.ObjectId(userId),
    }).exec();

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return { message: 'Notification deleted successfully' };
  }

  async clearAll(userId: string) {
   const x = await this.notificationModel
      .deleteMany({ userId: new Types.ObjectId(userId) })
      .exec();
    return {message: 'Notifications deleted successfully' }
  }

  async getCount(userId: string) {
    const count = await this.notificationModel
      .countDocuments({ userId: new Types.ObjectId(userId) })
      .exec();
    return { count };
  }

  async notifyAllAdmins(adminIds: string[], title: string, message: string, type: string = 'general', relatedId?: string, data?: any) {
    const notifications = adminIds.map(adminId => ({
      userId: new Types.ObjectId(adminId),
      title,
      message,
      type,
      relatedId,
      data,
    }));

    if (notifications.length > 0) {
      await this.notificationModel.insertMany(notifications);
    }
  }
}
