import { IsString, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'username must be alphanumeric with underscores' })
  username?: string;
}
