import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Location extends Document {
  @Prop([Number])
  bounds: number[]; // [-0.19968, 5.58389, -0.19968, 5.58389]

  @Prop({
    type: {
      latitude: Number,
      longitude: Number,
    },
  })
  coordinates: {
    latitude: number;
    longitude: number;
  };

  @Prop({
    type: {
      id: Number,
      code: String,
      name: String,
    },
  })
  country: {
    id: number;
    code: string;
    name: string;
  };

  @Prop({ default: null })
  datetimeFirst: Date;

  @Prop({ default: null })
  datetimeLast: Date;

  @Prop({ default: null })
  distance: number;

  @Prop({ required: true })
  declare id: number;

  @Prop({ type: Array })
  instruments: any[]; // Puedes definir subesquema si conoces la estructura

  @Prop({ default: false })
  isMobile: boolean;

  @Prop({ default: false })
  isMonitor: boolean;

  @Prop({ type: Object })
  licenses: any;

  @Prop({ default: null })
  locality: string;

  @Prop({ required: true })
  name: string;

  @Prop({
    type: {
      id: Number,
      name: String,
    },
  })
  owner: {
    id: number;
    name: string;
  };

  @Prop({
    type: {
      id: Number,
      name: String,
    },
  })
  provider: {
    id: number;
    name: string;
  };

  @Prop({ type: Array })
  sensors: any[];

  @Prop()
  timezone: string;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const LocationSchema = SchemaFactory.createForClass(Location);
