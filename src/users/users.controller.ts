import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {

    @UseGuards(JwtAuthGuard)
    @Get('currentuser')
    getProfile(@Req() req: Request) {
        return req.user;
    }
}
