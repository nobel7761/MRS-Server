import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FaqsCategoryService } from './faqs-category.service';
import { CreateFaqsCategoryDto } from './dto/create-faqs-category.dto';
import { UpdateFaqsCategoryDto } from './dto/update-faqs-category.dto';

@Controller('faqs-category')
export class FaqsCategoryController {
  constructor(private readonly faqsCategoryService: FaqsCategoryService) {}

  @Post()
  create(@Body() createFaqsCategoryDto: CreateFaqsCategoryDto) {
    return this.faqsCategoryService.create(createFaqsCategoryDto);
  }

  @Get()
  findAll() {
    return this.faqsCategoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.faqsCategoryService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFaqsCategoryDto: UpdateFaqsCategoryDto,
  ) {
    return this.faqsCategoryService.update(id, updateFaqsCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.faqsCategoryService.remove(id);
  }
}
