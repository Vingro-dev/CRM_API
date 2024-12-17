import { IsOptional } from "class-validator";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('usertask')
export class UserTask {

    @PrimaryGeneratedColumn()
    taskid: number

    @Column()
    Taskname: string;

    @Column()
    TaskStatus: string;

    @Column()
    Description: string;

    @IsOptional()
    @Column({ type: "text", nullable: true })
    taskprofile: string;


    @Column()
    user_id: number;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => User, (user) => user.usertask)
    @JoinColumn({ name: 'user_id' })
    user: User;

}
