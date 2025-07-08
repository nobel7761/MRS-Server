import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import configuration from './config/configuration';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { RepresentativeCollectionModule } from './representative-collection/representative-collection.module';
import { FaqsCategoryModule } from './faqs-category/faqs-category.module';
import { FaqsModule } from './faqs/faqs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI as string),
    UsersModule,
    AuthModule,
    RepresentativeCollectionModule,
    FaqsCategoryModule,
    FaqsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
