import { Attendance } from "src/attendance/entities/attendance.entity";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";


@Entity('users')
export class User {

    @PrimaryGeneratedColumn()
    user_id: number;

    @Column({ length: 100 })
    name: string;

    @Column({ length: 100, unique: true })
    email: string;

    @Column({ length: 255 })
    password: string;

    @Column()
    role: string;

    @CreateDateColumn()
    created_at: Date;

    @Column()
    createdby: number;

    // Define the reverse relationship (one-to-many)
    @OneToMany(() => Attendance, (attendance) => attendance.user)
    attendance: Attendance[];  // An array of Attendance records for each User
}
