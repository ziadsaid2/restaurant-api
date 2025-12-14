import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Menu } from './entities/menu.entity';

@Injectable()
export class MenuService {
  constructor(@InjectModel(Menu.name) private readonly menuModel: Model<Menu>) {}

  async create(createMenuDto: CreateMenuDto) {
    const newMenu = new this.menuModel(createMenuDto);
    return await newMenu.save(); 
  }

  async findAll(category?: string) {
    const query = category ? { category } : {};  
    return await this.menuModel.find(query).exec(); 
  }

  async findOne(id: string) {
    const menu = await this.menuModel.findById(id).exec();
    if (!menu) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }
    return menu;
  }

  async update(id: string, updateMenuDto: UpdateMenuDto) {
    const updatedMenu = await this.menuModel
      .findByIdAndUpdate(id, updateMenuDto, { new: true }) 
      .exec();
    
    if (!updatedMenu) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }
    
    return updatedMenu;
  }

  async remove(id: string) {
    const deletedMenu = await this.menuModel.findByIdAndDelete(id).exec();
    
    if (!deletedMenu) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }
    
    return { message: 'Menu item deleted successfully' };
  }
}
