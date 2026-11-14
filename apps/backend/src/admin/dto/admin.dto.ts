import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class PatchAdminUserDto {
  @IsOptional()
  @IsIn(['free', 'pro'])
  plan?: 'free' | 'pro';

  @IsOptional()
  @IsIn(['user', 'admin'])
  role?: 'user' | 'admin';

  @IsOptional()
  @IsBoolean()
  suspended?: boolean;
}

export class PatchUpgradeRequestDto {
  @IsIn(['pending', 'approved', 'rejected'])
  status!: 'pending' | 'approved' | 'rejected';
}

export class PatchAdminModelDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  displayName?: string;
}