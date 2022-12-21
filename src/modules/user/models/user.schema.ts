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

@Schema({ _id: false, id: false, versionKey: false })
class PasswordRecoveryInfo {
  @Prop({ required: true, type: Boolean, default: true })
  isConfirmed: boolean;
  @Prop({ type: String })
  recoveryCode: string;
}

const PasswordRecoveryInfoSchema =
  SchemaFactory.createForClass(PasswordRecoveryInfo);

export type UserDocument = HydratedDocument<UserEntity>;

@Schema({ id: false, versionKey: false })
export class UserEntity {
  @Prop({ required: true, unique: true, type: String })
  id: string;
  @Prop({ required: true, type: AccountDataSchema })
  accountData: AccountData;
  @Prop({ required: true, type: EmailInfoSchema })
  emailInfo: EmailInfo;
  @Prop({ required: true, type: PasswordRecoveryInfoSchema })
  passwordRecoveryInfo: PasswordRecoveryInfo;
}

export const UserSchema = SchemaFactory.createForClass(UserEntity);
