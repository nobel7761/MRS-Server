import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  FaqsCategory,
  FaqsCategoryDocument,
} from './schemas/faqs-category.schema';
import { Faqs, FaqsDocument } from '../faqs/schemas/faqs.schema';
import { CreateFaqsCategoryDto } from './dto/create-faqs-category.dto';
import { UpdateFaqsCategoryDto } from './dto/update-faqs-category.dto';

@Injectable()
export class FaqsCategoryService {
  constructor(
    @InjectModel(FaqsCategory.name)
    private faqsCategoryModel: Model<FaqsCategoryDocument>,
    @InjectModel(Faqs.name)
    private faqsModel: Model<FaqsDocument>,
  ) {}

  async create(
    createFaqsCategoryDto: CreateFaqsCategoryDto,
  ): Promise<FaqsCategory> {
    // Check if category with same name already exists
    const existingCategory = await this.faqsCategoryModel
      .findOne({ name: createFaqsCategoryDto.name })
      .exec();

    if (existingCategory) {
      throw new ConflictException(
        `Category with name "${createFaqsCategoryDto.name}" already exists`,
      );
    }

    // Handle order conflict by shifting existing categories
    if (createFaqsCategoryDto.order !== undefined) {
      await this.shiftCategoriesOrder(createFaqsCategoryDto.order);
    }

    const createdCategory = new this.faqsCategoryModel(createFaqsCategoryDto);
    return createdCategory.save();
  }

  async findAll(): Promise<FaqsCategory[]> {
    return this.faqsCategoryModel.find().sort({ order: 1 }).exec();
  }

  async findOne(id: string): Promise<FaqsCategory> {
    const category = await this.faqsCategoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException(`FAQ category with ID ${id} not found`);
    }
    return category;
  }

  async update(
    id: string,
    updateFaqsCategoryDto: UpdateFaqsCategoryDto,
  ): Promise<FaqsCategory> {
    // Check if name is being updated and if it conflicts with existing category
    if (updateFaqsCategoryDto.name) {
      const existingCategory = await this.faqsCategoryModel
        .findOne({
          name: updateFaqsCategoryDto.name,
          _id: { $ne: id }, // Exclude current category from check
        })
        .exec();

      if (existingCategory) {
        throw new ConflictException(
          `Category with name "${updateFaqsCategoryDto.name}" already exists`,
        );
      }
    }

    // Handle order conflict by shifting existing categories
    if (updateFaqsCategoryDto.order !== undefined) {
      await this.shiftCategoriesOrder(updateFaqsCategoryDto.order, id);
    }

    const updatedCategory = await this.faqsCategoryModel
      .findByIdAndUpdate(id, updateFaqsCategoryDto, { new: true })
      .exec();

    if (!updatedCategory) {
      throw new NotFoundException(`FAQ category with ID ${id} not found`);
    }
    return updatedCategory;
  }

  async remove(
    id: string,
  ): Promise<{ message: string; deletedFaqsCount: number }> {
    // First, delete all FAQs that belong to this category
    const deleteFaqsResult = await this.faqsModel
      .deleteMany({ categoryId: id })
      .exec();

    // Then delete the category
    const result = await this.faqsCategoryModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`FAQ category with ID ${id} not found`);
    }

    return {
      message: `Category "${result.name}" and ${deleteFaqsResult.deletedCount} related FAQs deleted successfully`,
      deletedFaqsCount: deleteFaqsResult.deletedCount,
    };
  }

  private async shiftCategoriesOrder(
    newOrder: number,
    excludeId?: string,
  ): Promise<void> {
    const filter: any = { order: { $gte: newOrder } };
    if (excludeId) {
      filter._id = { $ne: excludeId };
    }

    // Increment order for all categories with order >= newOrder
    await this.faqsCategoryModel
      .updateMany(filter, { $inc: { order: 1 } })
      .exec();
  }
}
