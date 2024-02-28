import { ColorType } from '@prisma/client';

export const changeToColorType = (color: string): ColorType | null => {
  if (Object.values(ColorType).includes(color as ColorType)) {
    return color as ColorType;
  }
  return null;
};
