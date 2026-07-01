import { Controller, Get, Put, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Put('me')
  @ApiOperation({ summary: 'Update own profile' })
  updateProfile(@Req() req: any, @Body() dto: any) {
    return this.usersService.updateProfile(req.user.id, dto);
  }

  // BUG-004 FIX: Admin-only routes protected by RolesGuard
  @Get('admin/all')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'List all users (admin only)' })
  findAll(@Query() query: any) {
    return this.usersService.findAll(query);
  }

  @Patch('admin/:id/suspend')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Suspend user account (admin only)' })
  suspend(@Param('id') id: string) {
    return this.usersService.suspend(id);
  }

  @Patch('admin/:id/activate')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Activate user account (admin only)' })
  activate(@Param('id') id: string) {
    return this.usersService.activate(id);
  }
}
