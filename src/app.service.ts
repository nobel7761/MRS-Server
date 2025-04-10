import { Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection, ConnectionStates } from "mongoose";

@Injectable()
export class AppService {
  constructor(@InjectConnection() private connection: Connection) {}

  getHello(): string {
    const isConnected =
      this.connection.readyState === ConnectionStates.connected;
    return `Hello World! MongoDB ${isConnected ? "is" : "is not"} connected`;
  }
}
