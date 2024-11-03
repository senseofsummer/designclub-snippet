// app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { User } from './entities/user.entity';
import { AffiliateTree } from './entities/affiliate-tree.entity';
import { UpdateAffiliateTreesProcessor } from './jobs/UpdateAffiliateTreesProcessor';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'mysql', // or your preferred DB
            host: 'localhost',
            port: 3306,
            username: 'root',
            password: 'password',
            database: 'test_db',
            entities: [User, AffiliateTree],
            synchronize: true,
        }),
        TypeOrmModule.forFeature([User, AffiliateTree]),
        BullModule.forRoot({
            redis: {
                host: 'localhost',
                port: 6379,
            },
        }),
        BullModule.registerQueue({
            name: 'affiliate-trees-update',
        }),
    ],
    providers: [UpdateAffiliateTreesProcessor],
})
export class AppModule {}
