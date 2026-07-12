import { IsString, IsNumber, IsOptional, IsBoolean, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty() @IsString() title: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() shortDesc?: string;
  @ApiProperty() @IsNumber() @Min(0) @Type(() => Number) price: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Type(() => Number) comparePrice?: number;
  @ApiProperty({ default: 'XOF' }) @IsOptional() @IsString() currency?: string;
  @ApiProperty({ enum: ['EBOOK','COURSE','AUDIO','TEMPLATE','SOFTWARE','SERVICE','SUBSCRIPTION','OTHER'] })
  @IsOptional() @IsEnum(['EBOOK','COURSE','AUDIO','TEMPLATE','SOFTWARE','SERVICE','SUBSCRIPTION','OTHER']) type?: string;
  @ApiProperty({ enum: ['DRAFT','PUBLISHED','PRIVATE'] }) @IsOptional() status?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() categoryId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() coverImage?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() contentUrl?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() contentNote?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isMarketplace?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() downloadLimit?: number;
}
