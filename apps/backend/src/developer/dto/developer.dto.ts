import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateApiTokenDto {
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  name!: string;
}