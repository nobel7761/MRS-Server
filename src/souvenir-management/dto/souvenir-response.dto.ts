export class SouvenirResponseDto {
  _id: string;
  category: string;
  name: string;
  batch: string;
  group: string;
  phoneNumber: string;
  email: string;
  photoUrl?: string; // For non-photo-gallery categories
  photoUrls?: string[]; // For photo-gallery category
  content?: string; // Optional for photo-gallery
  professionalDetails?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class SouvenirListResponseDto {
  souvenirs: SouvenirResponseDto[];
  total: number;
}
