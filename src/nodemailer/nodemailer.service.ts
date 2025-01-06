import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { resolve } from 'path';
import { NodeMailerTargets } from './nodemailer.interface';
import { plainToInstance } from 'class-transformer';
import { NodemailerDto } from './dto/nodemailer.dto';
import { EnvType } from 'src/env/env.interface';
import { renderFile } from 'ejs';
@Injectable()
export class NodemailerService {
  private transporter: nodemailer.Transporter;
  private sender: string;
  private readonly texts: Record<
    NodeMailerTargets,
    Record<keyof NodemailerDto, string>
  > = {
    [NodeMailerTargets.EMAIL_CONFIRMATION]: {
      buttonTitle: 'Activate My Account',
      description: 'Tap the button below to Activate your email account',
      title: 'Activate Your Account',
      preheader: 'Tap the button below to Activate your email account',
    },
  };

  constructor(private readonly configService: ConfigService<EnvType, true>) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get('EMAIL.EMAIL_USERNAME', { infer: true }),
        pass: this.configService.get('EMAIL.EMAIL_PASSWORD', { infer: true }),
      },
      logger: false,
      debug: false,
    });
    this.sender = `Elegant Task |  <${this.configService.get('EMAIL.EMAIL_USERNAME', { infer: true })}>`;
  }

  async sendEmailNotify({
    email,
    link,
    target,
  }: {
    email: string;
    link: string;
    target: NodeMailerTargets;
  }) {
    const file = resolve('static/email-template/index.ejs');
    const payload = plainToInstance(
      NodemailerDto,
      { email, link, ...this.texts[target] },
      {
        enableImplicitConversion: true,
      },
    );
    try {
      const html = await renderFile(file, payload);
      await this.transporter.sendMail({
        from: this.sender,
        to: email,
        subject: 'Elegant Task | Confirm your email',
        html,
      });
      console.log(link, 'link');
    } catch (err) {
      console.log(err);

      throw new BadRequestException('Email could not send');
    }
    return true;
  }
}
