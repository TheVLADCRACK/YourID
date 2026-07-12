// marketplace.module.ts - paste into apps/api/src/modules/marketplace/
import { Module } from '@nestjs/common';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';

@Module({ controllers: [MarketplaceController], providers: [MarketplaceService] })
export class MarketplaceModule {}
