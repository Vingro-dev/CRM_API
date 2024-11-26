
import { Client } from "src/client/entities/client.entity";
import { ClientVist } from "src/client_vist/entities/client_vist.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('service_offer')
export class ServicesOffer {

    @PrimaryGeneratedColumn()
    s_id: number;

    @Column()
    servicename: string;

    @Column()
    createdBy: number;

    @Column()
    createdAt: Date;

    @OneToMany(() => ClientVist, (clientVist) => clientVist.services)
    clientVisits: ClientVist[];

    // @OneToMany(() => Client, (client) => client.services)
    // client: ClientVist[];
}
