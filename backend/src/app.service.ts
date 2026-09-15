import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(private dataSource: DataSource) {}

  async getHealth(): Promise<any> {
    const dbHealthy = this.dataSource.isInitialized;

    return {
      status: 'healthy',
      timestamp: new Date(),
      database: dbHealthy ? 'connected' : 'disconnected',
      uptime: process.uptime(),
      version: '0.1.0',
    };
  }

  getInfo(): any {
    return {
      name: 'Suqly API',
      description: 'Suqly UAE Marketplace API',
      version: '0.1.0',
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
