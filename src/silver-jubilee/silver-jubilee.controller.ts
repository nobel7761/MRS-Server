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
  UseGuards,
} from '@nestjs/common';
import { SilverJubileeService } from './silver-jubilee.service';
import {
  CreateSilverJubileeParticipantDto,
  UpdateSilverJubileeParticipantDto,
  BatchGroupQueryDto,
} from './dto/silver-jubilee.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { JwtPayload } from '../auth/jwt-payload';

@Controller('silver-jubilee')
export class SilverJubileeController {
  constructor(private readonly silverJubileeService: SilverJubileeService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createDto: CreateSilverJubileeParticipantDto,
    @AuthUser() user: JwtPayload,
  ) {
    return this.silverJubileeService.create(createDto, user);
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

  @Post(':id/send-email')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async sendEmail(@Param('id') id: string, @AuthUser() user: JwtPayload) {
    return this.silverJubileeService.sendParticipantEmail(id, user);
  }
}
