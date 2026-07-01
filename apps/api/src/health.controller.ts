import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from './database/database.service';

@Controller('health')
export class HealthController {
  constructor(private db: DatabaseService) {}

  @Get()
  check() {
    // Quick DB ping
    const row = this.db.get<{ v: number }>('SELECT 1 as v');
    return { status: 'ok', db: row?.v === 1 ? 'ok' : 'error', ts: new Date().toISOString() };
  }
}
