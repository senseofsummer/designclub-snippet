// update-affiliate-trees.processor.ts
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { AffiliateTree } from '../entities/affiliate-tree.entity';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

@Injectable()
@Processor('affiliate-trees-update')
export class UpdateAffiliateTreesProcessor {
    private readonly logger = new Logger(UpdateAffiliateTreesProcessor.name);

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,

        @InjectRepository(AffiliateTree)
        private affiliateTreesRepository: Repository<AffiliateTree>,

        private dataSource: DataSource
    ) {}

    @Process()
    async handle(job: Job<{ userId: number }>) {
        const { userId } = job.data;
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const user = await this.userRepository.findOneBy({ id: userId });
            if (user?.referrer_id) {
                // Delete existing affiliate trees
                await this.affiliateTreesRepository.delete({ user_id: userId });

                // Fetch referrers in ascending order of level
                const referrers = await this.affiliateTreesRepository.find({
                    where: { user_id: user.referrer_id },
                    order: { level: 'ASC' },
                });

                // Add the user's direct referrer
                await this.affiliateTreesRepository.save({
                    user_id: userId,
                    referrer_id: user.referrer_id,
                    level: 1,
                });

                // Add the rest of the referrers
                for (const referrer of referrers) {
                    await this.affiliateTreesRepository.save({
                        user_id: userId,
                        referrer_id: referrer.referrer_id,
                        level: referrer.level + 1,
                    });
                }
            }

            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Failed to update affiliate trees: ${error.message}`);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}
