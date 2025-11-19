import { Body, Controller, Headers, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthHelper } from './auth.helper';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authHelper: AuthHelper,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user with email and password' })
  register(@Body() dto: RegisterDto) {
    return this.usersService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  login(@Body() dto: LoginDto) {
    return this.usersService.login(dto);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout current user' })
  logout(@Headers('authorization') auth: string) {
    const token = auth?.replace('Bearer ', '');
    return this.usersService.logout(token);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate session token' })
  validateSession(@Headers('authorization') auth: string) {
    const token = auth?.replace('Bearer ', '');
    return this.usersService.validateSession(token);
  }

  @Post('auth/license')
  @ApiOperation({ summary: 'Get user by license key' })
  getUserByLicense(@Body('licenseKey') licenseKey: string) {
    return this.authHelper.getUserByLicense(licenseKey);
  }
}
