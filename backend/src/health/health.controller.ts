import { Controller, Get } from '@nestjs/common';
import packageJson from '../../package.json' with { type: 'json' };

@Controller('health')
export class HealthController {
  @Get()
  check(): { status: 'ok'; version: string } {
    return { status: 'ok', version: packageJson.version };
  }
}
