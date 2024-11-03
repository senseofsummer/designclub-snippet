// some.service.ts
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SomeService {
    constructor(
        @InjectQueue('affiliate-trees-update') private affiliateTreesQueue: Queue
    ) {}

    async updateAffiliateTrees(userId: number) {
        await this.affiliateTreesQueue.add({ userId });
    }
}
