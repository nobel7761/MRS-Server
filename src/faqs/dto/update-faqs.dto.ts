import { PartialType } from '@nestjs/mapped-types';
import { CreateFaqsDto } from './create-faqs.dto';

export class UpdateFaqsDto extends PartialType(CreateFaqsDto) {}
