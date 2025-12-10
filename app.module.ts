// app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { User } from './entities/user.entity';
import { AffiliateTree } from './entities/affiliate-tree.entity';
import { Reward } from './entities/reward.entity';
import { Analytics } from './entities/analytics.entity';
import { UpdateAffiliateTreesProcessor } from './jobs/UpdateAffiliateTreesProcessor';
import { AffiliateController } from './controllers/affiliateController';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306'),
            username: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'password',
            database: process.env.DB_NAME || 'test_db',
            entities: [User, AffiliateTree, Reward, Analytics],
            synchronize: process.env.NODE_ENV !== 'production',
        }),
        TypeOrmModule.forFeature([User, AffiliateTree, Reward, Analytics]),
        BullModule.forRoot({
            redis: {
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT || '6379'),
            },
        }),
        BullModule.registerQueue({
            name: 'affiliate-trees-update',
        }),
    ],
    controllers: [AffiliateController],
    providers: [UpdateAffiliateTreesProcessor],
})
export class AppModule {}
