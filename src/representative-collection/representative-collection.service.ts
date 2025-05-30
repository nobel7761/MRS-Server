import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  RepresentativeCollection,
  RepresentativeCollectionDocument,
} from './schemas/representative-collection.schema';
import { CreateRepresentativeCollectionDto } from './dto/create-representative-collection.dto';

@Injectable()
export class RepresentativeCollectionService {
  constructor(
    @InjectModel(RepresentativeCollection.name)
    private representativeCollectionModel: Model<RepresentativeCollectionDocument>,
  ) {}

  async create(
    createDto: CreateRepresentativeCollectionDto,
  ): Promise<RepresentativeCollection> {
    const existing = await this.representativeCollectionModel.findOne({
      phone: createDto.phone,
    });
    if (existing) {
      throw new BadRequestException('Phone number already exists');
    }

    const data = await this.representativeCollectionModel.create(createDto);
    return data;
  }

  async findAll(): Promise<RepresentativeCollection[]> {
    return this.representativeCollectionModel
      .find()
      .sort({ createdAt: 1 })
      .exec();
  }

  async findOne(id: string): Promise<RepresentativeCollection> {
    const representative = await this.representativeCollectionModel
      .findById(id)
      .exec();
    if (!representative) {
      throw new NotFoundException(`Representative with ID ${id} not found`);
    }
    return representative;
  }

  async update(
    id: string,
    updateDto: CreateRepresentativeCollectionDto,
  ): Promise<RepresentativeCollection> {
    const updated = await this.representativeCollectionModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Representative with ID ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<RepresentativeCollection> {
    const deleted = await this.representativeCollectionModel
      .findByIdAndDelete(id)
      .exec();
    if (!deleted) {
      throw new NotFoundException(`Representative with ID ${id} not found`);
    }
    return deleted;
  }

  async getDashboardStats() {
    const [totalSubmissions, genderStats, hscYearStats, hscGroupStats] =
      await Promise.all([
        // Total submissions
        this.representativeCollectionModel.countDocuments(),

        // Gender statistics
        this.representativeCollectionModel.aggregate([
          {
            $group: {
              _id: '$gender',
              count: { $sum: 1 },
            },
          },
        ]),

        // HSC Year statistics
        this.representativeCollectionModel.aggregate([
          {
            $group: {
              _id: '$hscYear',
              count: { $sum: 1 },
            },
          },
          {
            $sort: { _id: -1 },
          },
        ]),

        // HSC Group statistics
        this.representativeCollectionModel.aggregate([
          {
            $group: {
              _id: '$hscGroup',
              count: { $sum: 1 },
            },
          },
        ]),
      ]);

    // Transform gender stats into a more usable format
    const genderCounts = genderStats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    // Transform HSC Year stats into a more usable format
    const hscYearCounts = hscYearStats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    // Transform HSC Group stats into a more usable format
    const hscGroupCounts = hscGroupStats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    return {
      totalSubmissions,
      genderStats: {
        male: genderCounts['Male'] || 0,
        female: genderCounts['Female'] || 0,
      },
      hscYearStats: hscYearCounts,
      hscGroupStats: hscGroupCounts,
    };
  }
}
