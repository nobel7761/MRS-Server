import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SilverJubileeParticipant,
  SilverJubileeParticipantDocument,
} from './schemas/silver-jubilee.schema';
import {
  CreateSilverJubileeParticipantDto,
  UpdateSilverJubileeParticipantDto,
} from './dto/silver-jubilee.dto';

@Injectable()
export class SilverJubileeService {
  constructor(
    @InjectModel(SilverJubileeParticipant.name)
    private participantModel: Model<SilverJubileeParticipantDocument>,
  ) {}

  async create(createDto: CreateSilverJubileeParticipantDto) {
    try {
      // Validate required fields based on participant category
      await this.validateParticipantData(createDto);

      // Check if participant with same email or phone already exists (only for non-guests and non-babies)
      if (
        createDto.participantCategory !== 'Guest' &&
        createDto.participantCategory !== 'Baby' &&
        (createDto.email || createDto.phoneNumber)
      ) {
        const existingParticipant = await this.participantModel.findOne({
          $or: [
            { email: createDto.email },
            { phoneNumber: createDto.phoneNumber },
          ],
        });

        if (existingParticipant) {
          throw new BadRequestException(
            'Participant with this email or phone number already registered',
          );
        }
      }

      // Generate unique secret code
      const secretCode = await this.generateUniqueSecretCode(createDto);

      const participant = new this.participantModel({
        ...createDto,
        secretCode,
      });
      const savedParticipant = await participant.save();
      return savedParticipant;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to create participant: ${error.message}`,
      );
    }
  }

  private async generateUniqueSecretCode(
    createDto: CreateSilverJubileeParticipantDto,
  ): Promise<string> {
    let secretCode: string = '';
    let isUnique = false;

    while (!isUnique) {
      secretCode = this.generateSecretCode(createDto);

      // Check if secret code already exists
      const existingParticipant = await this.participantModel.findOne({
        secretCode,
      });

      if (!existingParticipant) {
        isUnique = true;
      }
    }

    return secretCode;
  }

  private generateSecretCode(
    createDto: CreateSilverJubileeParticipantDto,
  ): string {
    // Get batch (last 2 digits of year, padded with zeros)
    let batchYear: number;
    if (
      createDto.participantCategory === 'Guest' ||
      createDto.participantCategory === 'Baby'
    ) {
      batchYear = createDto.mainParticipantBatch || 0;
    } else {
      batchYear = createDto.hscPassingYear || 0;
    }

    // Get last 2 digits and pad with leading zero if needed
    const batch = String(batchYear % 100).padStart(2, '0');

    // Get group code (01=Science, 02=Business Studies, 03=Humanities)
    let groupCode: string;
    const group =
      createDto.participantCategory === 'Guest' ||
      createDto.participantCategory === 'Baby'
        ? createDto.mainParticipantGroup
        : createDto.group;

    switch (group) {
      case 'Science':
        groupCode = '01';
        break;
      case 'Business Studies':
        groupCode = '02';
        break;
      case 'Humanities':
        groupCode = '03';
        break;
      default:
        groupCode = '00';
    }

    // Get current date and month
    const now = new Date();
    const date = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');

    // Generate 6-digit random number
    const randomNumber = String(Math.floor(Math.random() * 1000000)).padStart(
      6,
      '0',
    );

    // Format: {batch}-{groupCode}-{date}-{month}-{randomNumber}
    return `${batch}-${groupCode}-${date}-${month}-${randomNumber}`;
  }

  private async validateParticipantData(
    createDto: CreateSilverJubileeParticipantDto,
  ): Promise<void> {
    const { participantCategory } = createDto;

    if (participantCategory === 'Guest') {
      // Validate guest-specific fields
      if (!createDto.mainParticipantBatch) {
        throw new BadRequestException(
          'Main participant batch is required for guests',
        );
      }
      if (!createDto.mainParticipantGroup) {
        throw new BadRequestException(
          'Main participant group is required for guests',
        );
      }
      if (!createDto.guestName) {
        throw new BadRequestException('Guest name is required for guests');
      }
      if (!createDto.guestMobileNumber) {
        throw new BadRequestException(
          'Guest mobile number is required for guests',
        );
      }

      // If mainParticipantId is provided, fetch and store main participant details
      if (createDto.mainParticipantId) {
        const mainParticipant = await this.participantModel
          .findById(createDto.mainParticipantId)
          .exec();

        if (!mainParticipant) {
          throw new BadRequestException(
            `Main participant with ID ${createDto.mainParticipantId} not found`,
          );
        }

        // Store main participant's name and ID
        createDto.mainParticipantName = mainParticipant.fullName;
      }
    } else if (participantCategory === 'Baby') {
      // Validate baby-specific fields
      if (!createDto.mainParticipantBatch) {
        throw new BadRequestException(
          'Main participant batch is required for babies',
        );
      }
      if (!createDto.mainParticipantGroup) {
        throw new BadRequestException(
          'Main participant group is required for babies',
        );
      }
      if (!createDto.mainParticipantId) {
        throw new BadRequestException(
          'Main participant ID is required for babies',
        );
      }
      if (!createDto.babyName) {
        throw new BadRequestException('Baby name is required for babies');
      }
      if (!createDto.babyPhone) {
        throw new BadRequestException('Baby phone is required for babies');
      }

      // Fetch and store main participant details
      const mainParticipant = await this.participantModel
        .findById(createDto.mainParticipantId)
        .exec();

      if (!mainParticipant) {
        throw new BadRequestException(
          `Main participant with ID ${createDto.mainParticipantId} not found`,
        );
      }

      // Store main participant's name and ID
      createDto.mainParticipantName = mainParticipant.fullName;
    } else {
      // Validate personal information for non-guest participants
      const requiredFields = [
        { field: 'fullName', message: 'Full name is required' },
        { field: 'phoneNumber', message: 'Phone number is required' },
        { field: 'email', message: 'Email is required' },
        { field: 'hscPassingYear', message: 'HSC passing year is required' },
        { field: 'group', message: 'Group is required' },
        { field: 'gender', message: 'Gender is required' },
        { field: 'bloodGroup', message: 'Blood group is required' },
        { field: 'fatherName', message: 'Father name is required' },
        {
          field: 'fatherPhoneNumber',
          message: 'Father phone number is required',
        },
        {
          field: 'fatherOccupation',
          message: 'Father occupation is required',
        },
        { field: 'motherName', message: 'Mother name is required' },
        {
          field: 'motherPhoneNumber',
          message: 'Mother phone number is required',
        },
        {
          field: 'motherOccupation',
          message: 'Mother occupation is required',
        },
      ];

      for (const { field, message } of requiredFields) {
        if (!createDto[field]) {
          throw new BadRequestException(message);
        }
      }
    }
  }

  async findAll() {
    try {
      // Execute query - get all participants sorted by creation date (newest first)
      const participants = await this.participantModel
        .find()
        .sort({ createdAt: -1 })
        .exec();

      // Return array directly
      return participants;
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch participants: ${error.message}`,
      );
    }
  }

  async findOne(id: string) {
    try {
      const participant = await this.participantModel.findById(id).exec();

      if (!participant) {
        throw new NotFoundException(`Participant with ID ${id} not found`);
      }

      return participant;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to fetch participant: ${error.message}`,
      );
    }
  }

  async update(id: string, updateDto: UpdateSilverJubileeParticipantDto) {
    try {
      // If email or phone is being updated, check for duplicates
      if (updateDto.email || updateDto.phoneNumber) {
        const filter: any = {
          _id: { $ne: id },
        };

        if (updateDto.email || updateDto.phoneNumber) {
          filter.$or = [];
          if (updateDto.email) {
            filter.$or.push({ email: updateDto.email });
          }
          if (updateDto.phoneNumber) {
            filter.$or.push({ phoneNumber: updateDto.phoneNumber });
          }
        }

        const existingParticipant = await this.participantModel.findOne(filter);

        if (existingParticipant) {
          throw new BadRequestException(
            'Participant with this email or phone number already exists',
          );
        }
      }

      const updatedParticipant = await this.participantModel
        .findByIdAndUpdate(id, updateDto, {
          new: true,
          runValidators: true,
        })
        .exec();

      if (!updatedParticipant) {
        throw new NotFoundException(`Participant with ID ${id} not found`);
      }

      return updatedParticipant;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to update participant: ${error.message}`,
      );
    }
  }

  async remove(id: string) {
    try {
      const deletedParticipant = await this.participantModel
        .findByIdAndDelete(id)
        .exec();

      if (!deletedParticipant) {
        throw new NotFoundException(`Participant with ID ${id} not found`);
      }

      return { message: 'Participant deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to delete participant: ${error.message}`,
      );
    }
  }

  async findByBatchAndGroup(batch: number, group: string) {
    try {
      const participants = await this.participantModel
        .find({
          hscPassingYear: batch,
          group: group,
        })
        .sort({ fullName: 1 })
        .exec();

      if (!participants || participants.length === 0) {
        throw new NotFoundException(
          `No participants found for batch ${batch} and group ${group}`,
        );
      }

      return {
        batch,
        group,
        total: participants.length,
        participants,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to fetch participants by batch and group: ${error.message}`,
      );
    }
  }
}
