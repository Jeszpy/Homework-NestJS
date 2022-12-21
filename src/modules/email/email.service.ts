import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  private emailConfirmationUrl = this.configService.get<string>(
    'EMAIL_CONFIRMATION_URL',
  );

  async sendRegistrationEmail(
    email: string,
    login: string,
    confirmationCode: string,
  ) {
    const confirmUrl = `${this.emailConfirmationUrl}/registration-confirmation?code=${confirmationCode}`;

    await this.mailerService.sendMail({
      to: email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: 'Регаистрация в Jeszpy APP',
      template: './registration',
      context: {
        name: login,
        confirmUrl,
      },
    });
  }

  async sendEmailWithNewConfirmationCode(
    email: string,
    login: string,
    confirmationCode: string,
  ) {
    const confirmUrl = `${this.emailConfirmationUrl}/registration-confirmation?code=${confirmationCode}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Повторная отправка кода подтверждения',
      template: './email-resending',
      context: {
        name: login,
        confirmUrl,
      },
    });
  }

  async sendPasswordRecoveryCode(
    email: string,
    login: string,
    recoveryCode: string,
  ) {
    const recoveryUrl = `${this.emailConfirmationUrl}/password-recovery?recoveryCode=${recoveryCode}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Восстановления пароля',
      template: './password-recovery',
      context: {
        name: login,
        recoveryUrl,
      },
    });
  }
}
