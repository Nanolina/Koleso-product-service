import { ColorType } from '@prisma/client';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isValidColor', async: false })
export class IsValidColorConstraint implements ValidatorConstraintInterface {
  validate(color: any) {
    const colorValues = Object.values(ColorType) as string[];
    return typeof color === 'string' && colorValues.includes(color);
  }

  defaultMessage() {
    return 'The color is incorrect';
  }
}
