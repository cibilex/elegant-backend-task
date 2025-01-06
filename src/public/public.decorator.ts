import { Reflector } from '@nestjs/core';

export const Public = Reflector.createDecorator<boolean>();
export const Admin = Reflector.createDecorator<boolean>();
