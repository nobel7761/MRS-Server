import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import configuration from './config/configuration';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { RepresentativeCollectionModule } from './representative-collection/representative-collection.module';
import { FaqsCategoryModule } from './faqs-category/faqs-category.module';
import { FaqsModule } from './faqs/faqs.module';
import { EventModule } from './event/event.module';
import { SilverJubileeModule } from './silver-jubilee/silver-jubilee.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI as string),
    UsersModule,
    AuthModule,
    EmailModule,
    RepresentativeCollectionModule,
    FaqsCategoryModule,
    FaqsModule,
    EventModule,
    SilverJubileeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
