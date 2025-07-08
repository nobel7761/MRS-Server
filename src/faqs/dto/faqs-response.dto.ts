import { FaqsCategory } from '../../faqs-category/schemas/faqs-category.schema';

export class FaqsResponseDto {
  _id: string;
  question: string;
  answer: string;
  categoryId: FaqsCategory;
  isActive: boolean;
  order: number;
  showHomePage: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class FaqsWithCategoriesResponseDto {
  category: {
    _id: string;
    name: string;
    description: string;
  };
  faqs: FaqsResponseDto[];
}
