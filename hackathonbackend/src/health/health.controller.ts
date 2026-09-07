import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  @SkipThrottle() // Pas de limitation de débit sur la surveillance santé
  @ApiOperation({ summary: 'Health check endpoint' })
  check() {
    const mongoStatus = this.connection.readyState === 1 ? 'connected' : 'disconnected';
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      services: {
        mongodb: mongoStatus,
      },
    };
  }
}
