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

  async createUser(createUserDto: CreateUserDto): Promise<UserViewModel> {
    const passwordHash = await this.generatePasswordSaltAndHash(
      createUserDto.password,
    );
    const newUser: UserEntity = {
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
    };
    const result = await this.userRepository.createUser({ ...newUser });
    if (!result) throw new BadRequestException();
    return new UserViewModel(
      newUser.id,
      newUser.accountData.login,
      newUser.accountData.email,
      newUser.accountData.createdAt,
    );
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
}
