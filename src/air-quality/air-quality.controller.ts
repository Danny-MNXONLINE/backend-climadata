import { Controller, Get } from '@nestjs/common';
import { AirQualityService } from './air-quality.service';
import { Query } from '@nestjs/common/decorators/http/route-params.decorator';

@Controller('air-quality')
export class AirQualityController {
  constructor(private readonly airQualityService: AirQualityService) { }

  @Get('locations')
  async getLocations() {
    return this.airQualityService.getLocations();
  }
  @Get('locations/fetch')
  async fetchFromApi(@Query('id') id: number) {
    return this.airQualityService.fetchByIdFromExternalApi(id);
  }

}

