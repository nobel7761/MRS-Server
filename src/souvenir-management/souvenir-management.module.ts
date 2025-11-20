import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { SouvenirManagementService } from './souvenir-management.service';
import { SouvenirManagementController } from './souvenir-management.controller';
import { Souvenir, SouvenirSchema } from './schemas/souvenir.schema';
import { CloudinaryService } from './services/cloudinary.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Souvenir.name, schema: SouvenirSchema },
    ]),
    ConfigModule,
  ],
  controllers: [SouvenirManagementController],
  providers: [SouvenirManagementService, CloudinaryService],
  exports: [SouvenirManagementService, CloudinaryService],
})
export class SouvenirManagementModule {}
