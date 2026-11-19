import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ShopCompletionDto {
  @IsOptional()
  @IsString()
  conversationId?: string;

  @IsString()
  @IsNotEmpty()
  modelId!: string;

  @IsString()
  @IsNotEmpty()
  message!: string;
}

export class ShopProviderPatchDto {
  @IsIn(['digikala', 'torob', 'snapp'])
  id!: 'digikala' | 'torob' | 'snapp';

  @IsBoolean()
  enabled!: boolean;
}