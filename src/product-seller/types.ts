import { ColorType } from '@prisma/client';

export interface IParameter {
  id: string;
  color: ColorType;
  quantity: number;
  size?: string;
}
