import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ _id: false, id: false, versionKey: false })
class AccountData {
  @Prop({ required: true, unique: true, type: String })
  login: string;
  @Prop({ required: true, unique: true, type: String })
  email: string;
  @Prop({ required: true, type: String })
  passwordHash: string;
  @Prop({ required: true, type: String })
  createdAt: string;
}

const AccountDataSchema = SchemaFactory.createForClass(AccountData);

@Schema({ _id: false, id: false, versionKey: false })
class EmailInfo {
  @Prop({ required: true, type: Boolean, default: false })
  isConfirmed: boolean;
  @Prop({ required: true, type: String })
  confirmationCode: string;
}

const EmailInfoSchema = SchemaFactory.createForClass(EmailInfo);

export type UserDocument = HydratedDocument<User>;

@Schema({ id: false, versionKey: false })
export class User {
  @Prop({ required: true, unique: true, type: String })
  id: string;
  @Prop({ required: true, type: AccountDataSchema })
  accountData: AccountData;
  @Prop({ required: true, type: EmailInfoSchema })
  emailInfo: EmailInfo;
}

export const UserSchema = SchemaFactory.createForClass(User);