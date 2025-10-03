import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);

//   //! Enable CORS
//   app.enableCors({
//     origin: true, // Allows requests from any origin (domain). If set to a specific URL like 'http://localhost:3000', only that origin would be allowed
//     credentials: true, // Allows cookies and authentication headers to be sent with cross-origin requests. Required for handling auth tokens
//   });

//   //! Enable cookie parsing middleware
//   // This allows the application to parse cookies from incoming requests
//   // Necessary for handling authentication tokens stored in cookies (like refresh tokens)
//   app.use(cookieParser());

//   //! Enable validation
//   // Enable global validation pipe with the following options:
//   // - whitelist: true - Automatically removes any properties from request bodies that don't have validation decorators
//   // - transform: true - Automatically transforms payloads to be instances of their respective DTO classes
//   app.useGlobalPipes(
//     new ValidationPipe({
//       whitelist: true,
//       transform: true,
//     }),
//   );

//   //! Set a global prefix 'api' for all routes
//   // This means all endpoints will be prefixed with '/api'
//   // For example: '/users' becomes '/api/users'
//   app.setGlobalPrefix('api');

//   //! Start the application on the specified port or default to 3333
//   // process.env.PORT is used to get the port from environment variables
//   // If not set, it defaults to 3333
//   // This allows the application to be run on different ports for different environments
//   // For example, in development, you might run 'npm run start:dev' which sets the port to 3000
//   // In production, you might run 'npm run start' which sets the port to 3333
//   await app.listen(process.env.PORT || 3333);
// }

// //! Bootstrap the application and handle any errors
// // This function is the entry point for the NestJS application
// // It creates the NestJS application instance and starts the server
// // If there are any errors during the bootstrap process, it will catch them and log them
// // This ensures the application can start correctly and handle errors gracefully
// void bootstrap().catch((error) => {
//   console.error('Failed to start application:', error);
//   process.exit(1);
// });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT || 3333);
}

void bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
