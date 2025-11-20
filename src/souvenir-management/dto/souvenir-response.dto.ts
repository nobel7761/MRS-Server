export class SouvenirResponseDto {
  _id: string;
  category: string;
  name: string;
  batch: string;
  group: string;
  phoneNumber: string;
  email: string;
  photoUrl: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class SouvenirListResponseDto {
  souvenirs: SouvenirResponseDto[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}
