import { User } from 'src/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { ConfigService } from '@nestjs/config';


console.log(process.env.DB_TYPE, 'process.env.DB_TYPE');


@Entity('user_sessions')
export class UserSession {




    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (user) => user.sessions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column()
    deviceId: string;


    // @Column({
    //     type: process.env.DB_TYPE === 'mssql' ? 'nvarchar' : 'longtext',
    //     length: process.env.DB_TYPE === 'mssql' ? 'max' : ''
    // })

    @Column({ type: 'nvarchar'})

    deviceInfo: string;

    @Column({ nullable: true })
    ipAddress: string;

    @Column()
    token: string;

    @CreateDateColumn()
    createdAt: Date;

    @Column()
    expiresAt: Date;

    @Column()
    user_id: number;
}
