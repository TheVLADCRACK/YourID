import { IsEmail, IsString, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Kofi' })
  @IsString()
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ example: 'Mensah' })
  @IsString()
  @MaxLength(50)
  lastName: string;

  @ApiProperty({ example: 'kofimensah' })
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-z0-9_]+$/, {
    message: "Le nom d'utilisateur ne peut contenir que des lettres minuscules, chiffres et underscores",
  })
  username: string;

  @ApiProperty({ example: 'kofi@example.com' })
  @IsEmail({}, { message: 'Adresse email invalide' })
  email: string;

  @ApiProperty({ example: 'SecurePass@2025' })
  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre',
  })
  password: string;

  @ApiProperty({ example: 'Digital Africa' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  storeName: string;

  @ApiProperty({ example: 'digitalafrica' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets',
  })
  storeSlug: string;

  @ApiProperty({ example: 'XOF' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ example: 'SN' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ example: '#00A86B' })
  @IsOptional()
  @IsString()
  primaryColor?: string;
}
