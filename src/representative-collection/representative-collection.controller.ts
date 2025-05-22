import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RepresentativeCollectionService } from './representative-collection.service';
import { CreateRepresentativeCollectionDto } from './dto/create-representative-collection.dto';

@Controller('representative-collection')
export class RepresentativeCollectionController {
  constructor(
    private readonly representativeCollectionService: RepresentativeCollectionService,
  ) {}

  @Post()
  create(@Body() createDto: CreateRepresentativeCollectionDto) {
    return this.representativeCollectionService.create(createDto);
  }

  @Get()
  findAll() {
    return this.representativeCollectionService.findAll();
  }

  @Get('dashboard')
  getDashboardStats() {
    return this.representativeCollectionService.getDashboardStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.representativeCollectionService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: CreateRepresentativeCollectionDto,
  ) {
    return this.representativeCollectionService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.representativeCollectionService.remove(id);
  }
}
