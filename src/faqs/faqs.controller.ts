import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { FaqsService } from './faqs.service';
import { CreateFaqsDto } from './dto/create-faqs.dto';
import { UpdateFaqsDto } from './dto/update-faqs.dto';

@Controller('faqs')
export class FaqsController {
  constructor(private readonly faqsService: FaqsService) {}

  @Post()
  create(@Body() createFaqsDto: CreateFaqsDto) {
    return this.faqsService.create(createFaqsDto);
  }

  @Get()
  findAll(@Query('categoryId') categoryId?: string) {
    if (categoryId) {
      return this.faqsService.findByCategory(categoryId);
    }
    return this.faqsService.findAll();
  }

  @Get('homepage')
  findHomePageFaqs() {
    return this.faqsService.findHomePageFaqs();
  }

  @Get('with-categories')
  findAllWithCategories() {
    return this.faqsService.findAllWithCategories();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.faqsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFaqsDto: UpdateFaqsDto) {
    return this.faqsService.update(id, updateFaqsDto);
  }

  @Patch(':id/reorder')
  reorder(@Param('id') id: string, @Body('order') order: number) {
    return this.faqsService.reorder(id, order);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.faqsService.remove(id);
  }
}
