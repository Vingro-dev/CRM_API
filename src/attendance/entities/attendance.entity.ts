import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, CreateDateColumn, AfterLoad } from "typeorm";
import { IsOptional } from "class-validator";
import { User } from "src/users/entities/user.entity";

@Entity('Attendance')
export class Attendance {

    @PrimaryGeneratedColumn()
    att_id: number;

    @ManyToOne(() => User, (user) => user.attendance)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column()
    user_id: number;

    @Column({ type: 'datetime', nullable: true })
    intime: Date;

    @Column({ type: 'datetime', nullable: true })
    outime: Date;

    @IsOptional()
    @Column({ type: 'decimal', precision: 10, scale: 7 })
    latitude: number;

    @IsOptional()
    @Column({ type: 'decimal', precision: 10, scale: 7 })
    longitude: number;

    @CreateDateColumn()  // Automatically set to the current date and time
    created_at: Date;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    total_hours: number;  // Store the total working hours as decimal


    @Column({ nullable: true })
    DeviceID: string;

    @AfterLoad()
    calculateWorkingHours() {
        if (this.intime && this.outime) {
            const start = new Date(this.intime).getTime();
            const end = new Date(this.outime).getTime();
            const diffInMillis = end - start;

            const totalHours = diffInMillis / (1000 * 60 * 60);
            this.total_hours = Math.round(totalHours * 100) / 100;
        }
    }
}
