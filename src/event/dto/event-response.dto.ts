import { EventStatus, EventVisibility } from '../enums/event.enum';

export interface PricingRange {
  batchRange: string;
  fee: number;
  description: string;
  isPopular?: boolean;
}

export interface SocialMediaLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
}

export class EventResponseDto {
  _id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  bannerImage: string;
  date: Date;
  startsTime: string;
  venue: string;
  googleMapLink?: string;
  organizerName: string;
  organizerContactInfo: string;
  specialGuests: string[];
  isPaidEvent: boolean;
  pricingRanges: PricingRange[];
  seatLimit: number;
  socialMediaLinks: SocialMediaLinks;
  status: EventStatus;
  visibility: EventVisibility;
  registeredCount: number;
  registeredUsers: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class EventListResponseDto {
  events: EventResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
