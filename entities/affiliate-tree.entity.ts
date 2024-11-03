// affiliate-tree.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('affiliate_trees')
export class AffiliateTree {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: number;

    @Column()
    referrer_id: number;

    @Column()
    level: number;

    @ManyToOne(() => User, (user) => user.affiliateTrees)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'referrer_id' })
    referrer: User;
}
