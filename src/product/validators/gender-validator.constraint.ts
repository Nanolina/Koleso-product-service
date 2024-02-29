import { GenderType } from '@prisma/client';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isValidGender', async: false })
export class IsValidGenderConstraint implements ValidatorConstraintInterface {
  validate(gender: any) {
    if (gender === '') return true;
    const genderValues = Object.values(GenderType) as string[];
    return typeof gender === 'string' && genderValues.includes(gender);
  }

  defaultMessage() {
    return 'The gender is incorrect';
  }
}
