import { User } from 'src/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';

@Entity('user_sessions')
export class UserSession {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (user) => user.sessions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ type: 'varchar', length: 255 })
    deviceId: string;

    @Column({ type: 'longtext' })  // Works for both MySQL and MSSQL
    deviceInfo: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    ipAddress: string;

    @Column({ type: 'varchar', length: 500 })
    token: string;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @Column({ type: 'timestamp' })
    expiresAt: Date;

    @Column({ type: 'int' })
    user_id: number;
}