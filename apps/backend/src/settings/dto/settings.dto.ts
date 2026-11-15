import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import type { UserPreferences } from '../preferences.types';

export class PatchPreferencesDto implements UserPreferences {
  @IsOptional()
  @IsString()
  @MaxLength(32)
  displayName?: string;

  @IsOptional()
  @IsIn(['comfortable', 'compact'])
  density?: 'comfortable' | 'compact';

  @IsOptional()
  @IsBoolean()
  showSuggestionChips?: boolean;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsBoolean()
  reduceMotionOverride?: boolean | null;

  @IsOptional()
  @IsIn(['dark', 'light'])
  chatTheme?: 'dark' | 'light';

  @IsOptional()
  @IsString()
  @MaxLength(64)
  defaultModelId?: string;
}

export class UpgradeRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}

export class SupportInquiryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  subject!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(4000)
  message!: string;
}