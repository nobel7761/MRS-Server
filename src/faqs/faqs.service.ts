import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Faqs, FaqsDocument } from './schemas/faqs.schema';
import { FaqsCategoryService } from '../faqs-category/faqs-category.service';
import { CreateFaqsDto } from './dto/create-faqs.dto';
import { UpdateFaqsDto } from './dto/update-faqs.dto';

@Injectable()
export class FaqsService {
  constructor(
    @InjectModel(Faqs.name)
    private faqsModel: Model<FaqsDocument>,
    private faqsCategoryService: FaqsCategoryService,
  ) {}

  async create(createFaqsDto: CreateFaqsDto): Promise<Faqs> {
    // Validate that the category exists
    await this.faqsCategoryService.findOne(createFaqsDto.categoryId);

    // If showHomePage is true, check if we can add more FAQs to homepage
    if (createFaqsDto.showHomePage) {
      await this.validateHomePageLimit();
    }

    // Validate order uniqueness within the same category
    if (createFaqsDto.order !== undefined) {
      await this.validateOrderUniqueness(
        createFaqsDto.categoryId,
        createFaqsDto.order,
      );
    }

    const createdFaq = new this.faqsModel(createFaqsDto);
    return createdFaq.save();
  }

  async findAll(): Promise<Faqs[]> {
    return this.faqsModel
      .find()
      .populate('categoryId', 'name')
      .sort({ order: 1, createdAt: -1 })
      .exec();
  }

  async findByCategory(categoryId: string): Promise<Faqs[]> {
    // Validate that the category exists
    await this.faqsCategoryService.findOne(categoryId);

    return this.faqsModel
      .find({ categoryId })
      .populate('categoryId', 'name')
      .sort({ order: 1, createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Faqs> {
    const faq = await this.faqsModel
      .findById(id)
      .populate('categoryId', 'name')
      .exec();

    if (!faq) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }
    return faq;
  }

  async update(id: string, updateFaqsDto: UpdateFaqsDto): Promise<Faqs> {
    // If categoryId is being updated, validate that the new category exists
    if (updateFaqsDto.categoryId) {
      await this.faqsCategoryService.findOne(updateFaqsDto.categoryId);
    }

    // If showHomePage is being set to true, check if we can add more FAQs to homepage
    if (updateFaqsDto.showHomePage) {
      await this.validateHomePageLimit(id);
    }

    // Get the current FAQ to determine the category for order validation
    const currentFaq = await this.faqsModel.findById(id).exec();
    if (!currentFaq) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }

    // Determine which category to validate against
    const categoryId =
      updateFaqsDto.categoryId || currentFaq.categoryId.toString();

    // Validate order uniqueness within the same category
    if (updateFaqsDto.order !== undefined) {
      await this.validateOrderUniqueness(categoryId, updateFaqsDto.order, id);
    }

    const updatedFaq = await this.faqsModel
      .findByIdAndUpdate(id, updateFaqsDto, { new: true })
      .populate('categoryId', 'name')
      .exec();

    if (!updatedFaq) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }
    return updatedFaq;
  }

  async remove(id: string): Promise<void> {
    const result = await this.faqsModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }
  }

  async reorder(id: string, newOrder: number): Promise<Faqs> {
    // Get the current FAQ to determine the category
    const currentFaq = await this.faqsModel.findById(id).exec();
    if (!currentFaq) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }

    // Validate order uniqueness within the same category
    await this.validateOrderUniqueness(
      currentFaq.categoryId.toString(),
      newOrder,
      id,
    );

    const faq = await this.faqsModel
      .findByIdAndUpdate(id, { order: newOrder }, { new: true })
      .populate('categoryId', 'name')
      .exec();

    if (!faq) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }
    return faq;
  }

  async findAllWithCategories(): Promise<any[]> {
    const categories = await this.faqsCategoryService.findAll();
    const result: any[] = [];

    for (const category of categories) {
      const faqs = await this.faqsModel
        .find({ categoryId: (category as any)._id })
        .sort({ order: 1, createdAt: -1 })
        .exec();

      result.push({
        category: {
          _id: (category as any)._id,
          name: category.name,
        },
        faqs: faqs,
      });
    }

    return result;
  }

  async findHomePageFaqs(): Promise<Faqs[]> {
    return this.faqsModel
      .find({ showHomePage: true })
      .populate('categoryId', 'name')
      .sort({ order: 1, createdAt: -1 })
      .limit(5)
      .exec();
  }

  private async validateHomePageLimit(excludeId?: string): Promise<void> {
    const query = { showHomePage: true };
    if (excludeId) {
      query['_id'] = { $ne: excludeId };
    }

    const homePageFaqsCount = await this.faqsModel.countDocuments(query);

    if (homePageFaqsCount >= 5) {
      throw new BadRequestException(
        'Maximum 5 FAQs can be shown on the homepage. Please remove some existing homepage FAQs first.',
      );
    }
  }

  private async validateOrderUniqueness(
    categoryId: string,
    order: number,
    excludeId?: string,
  ): Promise<void> {
    const query = {
      categoryId: categoryId,
      order: order,
    };

    if (excludeId) {
      query['_id'] = { $ne: excludeId };
    }

    const existingFaq = await this.faqsModel.findOne(query).exec();

    if (existingFaq) {
      throw new BadRequestException(
        `An FAQ with order ${order} already exists in this category. Please choose a different order number.`,
      );
    }
  }
}
