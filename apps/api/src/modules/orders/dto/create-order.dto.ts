import { IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty() @IsString() productId: string;
  @ApiProperty() @IsEmail() customerEmail: string;
  @ApiProperty() @IsString() customerName: string;
  @ApiProperty() @IsString() paymentMethod: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() couponCode?: string;
}
