// user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { AffiliateTree } from './affiliate-tree.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    referrer_id: number;

    @OneToMany(() => AffiliateTree, (affiliateTree) => affiliateTree.user)
    affiliateTrees: AffiliateTree[];
}
