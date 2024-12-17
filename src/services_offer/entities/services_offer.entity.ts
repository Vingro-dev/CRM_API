
import { Client } from "src/client/entities/client.entity";
import { ClientVist } from "src/client_vist/entities/client_vist.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('service_offer')
export class ServicesOffer {

    @PrimaryGeneratedColumn()
    s_id: number;

    @Column()
    servicename: string;

    @Column()
    createdBy: number;

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => ClientVist, (clientVist) => clientVist.services)
    clientVisits: ClientVist[];

    // @OneToMany(() => Client, (client) => client.services)
    // client: ClientVist[];
}
