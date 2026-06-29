import { IsNumber, Max, Min } from 'class-validator';

export class SpinDto {
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'bet must be a number with up to 2 decimal places' })
  @Min(1)
  @Max(500)
  bet!: number;
}
