import {
  IsString,
  IsOptional,
  IsMongoId,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class CreateFaqsDto {
  @IsMongoId()
  categoryId: string;

  @IsString()
  question: string;

  @IsString()
  answer: string;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsBoolean()
  @IsOptional()
  showHomePage?: boolean;
}
