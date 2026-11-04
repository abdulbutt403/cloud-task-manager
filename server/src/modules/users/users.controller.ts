import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Patch,
  Param,
  ParseUUIDPipe,
  Put,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { CreateUserDto } from './dto/create-user.dto.js';
import { ReplaceUserDto } from './dto/replace-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UsersService } from './users.service.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  createUser(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }

  @Get(':id')
  getUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, dto);
  }

  @Put(':id')
  replaceUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReplaceUserDto,
  ) {
    return this.usersService.replaceUser(id, dto);
  }

  @Get()
  getUsers(
    @Query('page') page: string | undefined,
    @Query('limit') limit: string | undefined,
  ) {
    return { page, limit };
  }

  @Get('debug/request')
  getRequestDetails(@Req() request: Request) {
    return {
      method: request.method,
      url: request.url,
      userAgent: request.get('user-agent'),
    };
  }

  @Get('debug/response')
  sendDebugResponse(@Res() response: Response) {
    return response.status(200).json({ message: 'Debug response sent' });
  }

  @Get('debug/headers')
  getRequestHeaders(@Headers('user-agent') userAgent: string | undefined) {
    return { userAgent };
  }

  @Get('debug/status')
  @HttpCode(HttpStatus.ACCEPTED)
  getAcceptedStatus() {
    return { message: 'Request accepted' };
  }
}
