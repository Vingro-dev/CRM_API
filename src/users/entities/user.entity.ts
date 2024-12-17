import { IsOptional } from "class-validator";
import { Attendance } from "src/attendance/entities/attendance.entity";
import { Companymaster } from "src/companymaster/entities/companymaster.entity";
import { UserTask } from "src/user-task/entities/user-task.entity";
import { Userdesgination } from "src/userdesgination/entities/userdesgination.entity";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from "typeorm";

export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
}

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

    @Column()
    DOB: Date;

    @Column()
    mobile: string;

    @Column({ nullable: true })
    address: string;

    @Column({ type: 'varchar', length: 10, nullable: true })
    gender: Gender;

    @IsOptional()
    @Column({ type: "text", nullable: true })
    profile: string;

    @CreateDateColumn()
    created_at: Date;

    @Column()
    createdby: number;

    @Column({ nullable: true })
    isActive: boolean;

    @OneToMany(() => Attendance, (attendance) => attendance.user)
    attendance: Attendance[];

    @OneToMany(() => UserTask, (usertask) => usertask.user)
    usertask: Attendance[];

    @ManyToOne(() => Userdesgination, (designation) => designation.users, { eager: true })
    @JoinColumn({ name: 'des_id' })
    designation: Userdesgination;

    @Column({ nullable: true })
    des_id: number;

    @ManyToOne(() => Companymaster, (company) => company.users, { eager: true })
    @JoinColumn({ name: 'cm_id' })
    company: Companymaster;

    @Column({ nullable: true })
    cm_id: number;
}
