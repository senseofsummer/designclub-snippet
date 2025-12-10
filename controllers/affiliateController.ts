// affiliate.controller.ts
import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { AffiliateTree } from '../entities/affiliate-tree.entity';
import { Reward } from '../entities/reward.entity';
import { Analytics } from '../entities/analytics.entity';

@Controller('affiliates')
export class AffiliateController {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,

        @InjectRepository(AffiliateTree)
        private affiliateTreeRepository: Repository<AffiliateTree>,

        @InjectRepository(Reward)
        private rewardRepository: Repository<Reward>,

        @InjectRepository(Analytics)
        private analyticsRepository: Repository<Analytics>,
    ) {}

    @Get('tree/:userId')
    async getAffiliateTree(@Param('userId') userId: number) {
        const trees = await this.affiliateTreeRepository.find({
            where: { user_id: userId },
            relations: ['referrer'],
            order: { level: 'ASC' },
        });

        return {
            userId,
            tree: trees.map(tree => ({
                referrerId: tree.referrer_id,
                level: tree.level,
            })),
        };
    }

    @Get('stats/:userId')
    async getAffiliateStats(@Param('userId') userId: number) {
        const [directReferrals, totalReferrals, rewards, totalEarnings] = await Promise.all([
            this.userRepository.count({ where: { referrer_id: userId } }),
            this.affiliateTreeRepository.count({ where: { referrer_id: userId } }),
            this.rewardRepository.find({
                where: { user_id: userId, reward_type: 'referral' },
                order: { created_at: 'DESC' },
                take: 10,
            }),
            this.rewardRepository
                .createQueryBuilder('reward')
                .select('SUM(reward.cash_value)', 'total')
                .where('reward.user_id = :userId', { userId })
                .andWhere('reward.status = :status', { status: 'approved' })
                .getRawOne(),
        ]);

        return {
            userId,
            stats: {
                directReferrals,
                totalReferrals,
                totalEarnings: totalEarnings?.total || 0,
                recentRewards: rewards,
            },
        };
    }

    @Post('referral')
    async createReferral(
        @Body() body: { referrerId: number; newUserId: number },
    ) {
        // Track analytics
        await this.analyticsRepository.save({
            user_id: body.referrerId,
            event_type: 'referral',
            event_data: JSON.stringify({ referredUserId: body.newUserId }),
        });

        // Create reward for referrer
        await this.rewardRepository.save({
            user_id: body.referrerId,
            reward_type: 'referral',
            points: 100,
            cash_value: 10.0,
            description: `Referral reward for user ${body.newUserId}`,
            status: 'pending',
        });

        return { success: true, message: 'Referral tracked and reward created' };
    }

    @Get('rewards/:userId')
    async getUserRewards(
        @Param('userId') userId: number,
        @Query('status') status?: string,
    ) {
        const where: any = { user_id: userId };
        if (status) {
            where.status = status;
        }

        const rewards = await this.rewardRepository.find({
            where,
            order: { created_at: 'DESC' },
        });

        return {
            userId,
            rewards,
            totalPoints: rewards
                .filter(r => r.status === 'approved')
                .reduce((sum, r) => sum + Number(r.points), 0),
        };
    }
}

