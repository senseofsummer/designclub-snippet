// reward.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('rewards')
export class Reward {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: number;

    @Column()
    reward_type: string; // 'referral', 'course_completion', 'workshop_attendance', etc.

    @Column('decimal', { precision: 10, scale: 2 })
    points: number;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    cash_value: number;

    @Column({ nullable: true })
    description: string;

    @Column({ default: 'pending' })
    status: string; // 'pending', 'approved', 'redeemed', 'expired'

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp', nullable: true })
    redeemed_at: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;
}

