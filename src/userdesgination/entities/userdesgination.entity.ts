import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('Userdesgination')
export class Userdesgination {
    @PrimaryGeneratedColumn()
    Des_id: number;

    @Column()
    DesginationName: string;

    @CreateDateColumn()
    created_at: Date;

    @Column()
    createdby: number;

    @OneToMany(() => User, (user) => user.designation)
    users: User[];
}
