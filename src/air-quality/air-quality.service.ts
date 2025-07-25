import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HttpService } from '@nestjs/axios';
import { Model } from 'mongoose';
import { Location } from './schemas/location.schema';

@Injectable()
export class AirQualityService {
  private readonly TTL = 5 * 60 * 1000; // 5 minutos
  private readonly API_URL = 'https://api.openaq.org/v3/locations?countries_id=67&bbox=-18.2000,27.6000,-13.2000,29.6000';
  private readonly API_KEY = '18ad3e98f226c8e0d63da91aed6e89ae1ef5e2fd38c8e45ba66bb5454807a5e4';

  constructor(
    @InjectModel(Location.name) private locationModel: Model<Location>,
    private http: HttpService,
  ) { }

  async getLocations(): Promise<any[]> {
    const fiveMinutesAgo = new Date(Date.now() - this.TTL);

    // Buscar en la base de datos si hay datos actualizados recientemente
    const recent = await this.locationModel.find({
      updatedAt: { $gte: fiveMinutesAgo },
    });

    if (recent.length > 0) {
      console.log('✅ Devolviendo datos desde MongoDB');
      return recent;
    }

    try {
      const response = await this.http.get(this.API_URL, {
        headers: { 'x-api-key': this.API_KEY },
      }).toPromise();

      const results = response?.data?.results;

      if (!Array.isArray(results)) {
        console.warn('⚠ No se recibieron datos válidos de la API');
        return [];
      }

      // Normalizar fechas y guardar
      const processed = results.map((location) => {
        if (location.datetimeFirst?.utc) {
          location.datetimeFirst = new Date(location.datetimeFirst.utc);
        }
        if (location.datetimeLast?.utc) {
          location.datetimeLast = new Date(location.datetimeLast.utc);
        }

        return {
          ...location,
          updatedAt: new Date(),
        };
      });

      // Guardar uno por uno (puedes usar insertMany si prefieres más velocidad)
      for (const location of processed) {
        await this.locationModel.findOneAndUpdate(
          { id: location.id },
          location,
          { upsert: true, new: true }
        );
      }

      console.log('✅ Datos guardados en MongoDB desde la API');
      return processed;
    } catch (error) {
      console.error('❌ Error al llamar a la API:', error.message);
      return [];
    }
  }
  // Obtiene los datos de una ubicación específica desde la API externa por su ID
  // id: número identificador de la ubicación
  // Retorna los datos obtenidos de la API o un array vacío si hay error
  async fetchByIdFromExternalApi(id: number): Promise<any> {
    // Construye la URL para la petición usando el ID proporcionado
    const url = `https://api.openaq.org/v3/locations/${id}/latest`;
    const DTO: any[] = [];

    // Realiza la petición HTTP GET a la API externa con la API KEY
    const response = await this.http.get(url, {
      headers: { 'x-api-key': this.API_KEY },
    }).toPromise();

    // Si no se recibe respuesta válida, muestra advertencia y retorna array vacío
    if (!response) {
      console.warn('⚠ No se recibieron datos válidos de la API');
      return [];
    }

    // Si la respuesta contiene un array de resultados, procesa cada elemento
    if (Array.isArray(response.data.results)) {
      await Promise.all(response.data.results.map(async (item: any) => {
        // Si el elemento tiene sensorsId, lo muestra por consola
        if (item.sensorsId) {
          console.log(item.sensorsId);
          const sensors = await this.http.get(`https://api.openaq.org/v3/sensors/${item.sensorsId}`, {
            headers: { 'x-api-key': this.API_KEY },
          }).toPromise();
          if (!sensors) {
            return [];
          }
          console.log(sensors.data.results);

            if (!DTO[0]) {
            DTO[0] = { sensors: [] };
            }
            DTO[0].sensors.push(sensors.data.results[0]);
        }
      }));
    }
    DTO.push({measurements:response.data.results});
    console.log('DTO', DTO);
    // Retorna los datos obtenidos de la API
    return DTO;
  }

}
