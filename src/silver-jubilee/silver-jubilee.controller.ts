import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SilverJubileeService } from './silver-jubilee.service';
import {
  CreateSilverJubileeParticipantDto,
  UpdateSilverJubileeParticipantDto,
  BatchGroupQueryDto,
} from './dto/silver-jubilee.dto';

@Controller('silver-jubilee')
export class SilverJubileeController {
  constructor(private readonly silverJubileeService: SilverJubileeService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateSilverJubileeParticipantDto) {
    return this.silverJubileeService.create(createDto);
  }

  @Get()
  async findAll() {
    return this.silverJubileeService.findAll();
  }

  @Get('by-batch-group')
  async findByBatchAndGroup(@Query() queryDto: BatchGroupQueryDto) {
    return this.silverJubileeService.findByBatchAndGroup(
      queryDto.batch,
      queryDto.group,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.silverJubileeService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSilverJubileeParticipantDto,
  ) {
    return this.silverJubileeService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.silverJubileeService.remove(id);
  }
}
