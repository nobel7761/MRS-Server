import { PartialType } from '@nestjs/mapped-types';
import { CreateFaqsCategoryDto } from './create-faqs-category.dto';

export class UpdateFaqsCategoryDto extends PartialType(CreateFaqsCategoryDto) {}
