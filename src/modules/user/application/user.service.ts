import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserRepositoryMongodb } from '../infrastructure/user.repository.mongodb';
import { UserEntity } from '../models/user.schema';
import { randomUUID, randomBytes, scrypt } from 'crypto';
import { UserViewModel } from '../models/user-view-model';
import { UserQueryRepositoryMongodb } from '../infrastructure/user-query.repository.mongodb';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepositoryMongodb,
    private readonly userQueryRepository: UserQueryRepositoryMongodb,
  ) {}

  private async generatePasswordSaltAndHash(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const salt = randomBytes(16).toString('hex');
      scrypt(password, salt, 64, (err, derivedKey) => {
        if (err) reject(err);
        resolve(salt + ':' + derivedKey.toString('hex'));
      });
    });
  }

  private async verifyPasswords(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const [salt, key] = hash.split(':');
      scrypt(password, salt, 64, (err, derivedKey) => {
        if (err) reject(err);
        resolve(key == derivedKey.toString('hex'));
      });
    });
  }

  private async getNewUserData(
    createUserDto: CreateUserDto,
  ): Promise<UserEntity> {
    const passwordHash = await this.generatePasswordSaltAndHash(
      createUserDto.password,
    );
    return {
      id: randomUUID(),
      accountData: {
        login: createUserDto.login,
        email: createUserDto.email,
        passwordHash,
        createdAt: new Date().toISOString(),
      },
      emailInfo: {
        isConfirmed: false,
        confirmationCode: randomUUID(),
      },
      passwordRecoveryInfo: {
        isConfirmed: true,
        recoveryCode: null,
      },
    };
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserViewModel> {
    const newUser = await this.getNewUserData(createUserDto);
    const result = await this.userRepository.createUser({ ...newUser });
    if (!result) throw new BadRequestException();
    return new UserViewModel(
      newUser.id,
      newUser.accountData.login,
      newUser.accountData.email,
      newUser.accountData.createdAt,
    );
  }

  async registerUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const newUser = await this.getNewUserData(createUserDto);
    const result = await this.userRepository.createUser({ ...newUser });
    if (!result) throw new BadRequestException();
    return newUser;
  }

  async deleteUserById(userId: string) {
    const isDeleted = await this.userRepository.deleteOneUserById(userId);
    if (!isDeleted) throw new NotFoundException();
    // TODO: можно добавить логики на удаление блогов\постов\комментов\лайков
    return isDeleted;
  }

  async validateUserByLoginOrEmail(
    loginOrEmail: string,
    password: string,
  ): Promise<UserEntity> {
    const user = await this.userQueryRepository.findUserByLoginOrEmail(
      loginOrEmail,
    );
    if (!user) throw new UnauthorizedException();
    const comparePasswords = await this.verifyPasswords(
      password,
      user.accountData.passwordHash,
    );
    if (!comparePasswords) throw new UnauthorizedException();
    return user;
  }

  async confirmUserEmail(code: string) {
    const user = await this.userQueryRepository.findUserByConfirmationCode(
      code,
    );
    if (!user) throw new BadRequestException('user');
    if (user.emailInfo.isConfirmed) throw new BadRequestException('code');
    await this.userRepository.confirmUserEmailByUserId(user.id);
    return;
  }

  async recoveryPassword(userId) {
    const recoveryCode = randomUUID();
    await this.userRepository.updateRecoveryPasswordInfo(userId, recoveryCode);
    return recoveryCode;
  }

  async updatePasswordByUserId(userId: string, newPassword: string) {
    const passwordHash = await this.generatePasswordSaltAndHash(newPassword);
    return this.userRepository.updateUserPasswordByUserId(userId, passwordHash);
  }
}
