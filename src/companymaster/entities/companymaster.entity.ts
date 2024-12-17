import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('Companymaster')
export class Companymaster {

    @PrimaryGeneratedColumn()
    cm_id: number

    @Column()
    CompanyName: string


    @CreateDateColumn()
    created_at: Date;

    @Column()
    createdby: number;

    @OneToMany(() => User, (user) => user.company)
    users: User[];
}
