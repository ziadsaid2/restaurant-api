import { Injectable, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.userModel.findOne({ email: createUserDto.email });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      role: 'user', 
    });

    const user = await createdUser.save();

    return {
      id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
    };
  }
  // Find a user by email
  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  // Get all users (for admin only)
  async findAll() {
    const users = await this.userModel.find().select('-password').exec(); 
    return users;
  }

  // Find a user by id
  async findOne(id: string) {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new ConflictException(`User with ID ${id} not found`);
    }
    return user;
  }

  // Update user's data
  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new ConflictException(`User with ID ${id} not found`);
    }

    // If there is a new password, check the current password first
    if (updateUserDto.password) {
      if (!updateUserDto.currentPassword) {
        throw new ConflictException('Current password is required to change password');
      }

      // Check the current password
      const isPasswordValid = await bcrypt.compare(
        updateUserDto.currentPassword,
        user.password
      );

      if (!isPasswordValid) {
        throw new ConflictException('Current password is incorrect');
      }

      // Hash the new password
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Remove currentPassword from the data sent to the database
    const { currentPassword, ...dataToUpdate } = updateUserDto;

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, dataToUpdate, { new: true })
      .select('-password')
      .exec();

    return updatedUser;
  }

  async remove(id: string) {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    if (!deletedUser) {
      throw new ConflictException(`User with ID ${id} not found`);
    }
    return { message: 'User deleted successfully' };
  }

  // Get all admins
  async findAllAdmins() {
    return this.userModel.find({ role: 'admin' }).select('-password').exec();
  }
}
