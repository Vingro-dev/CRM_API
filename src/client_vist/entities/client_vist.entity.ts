import { IsOptional } from "class-validator";
import { Client } from "src/client/entities/client.entity";
import { ServicesOffer } from "src/services_offer/entities/services_offer.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('client_Vist')
export class ClientVist {

    @PrimaryGeneratedColumn()
    cv_id: number;

    @Column()
    user_id: number;

    @Column()
    client_id: number;

    @IsOptional()
    @Column({ nullable: true })
    conversation_sttime: number;

    @IsOptional()
    @Column({ nullable: true })
    conversation_endtime: number;

    @ManyToOne(() => ServicesOffer, (servicesOffer) => servicesOffer.clientVisits, { cascade: true })
    @JoinColumn({ name: 's_id' })
    services: ServicesOffer;

    @IsOptional()
    @Column({ type: "text", nullable: true })
    images: string;

    @IsOptional()
    @Column()
    visit_type: string;

    @IsOptional()
    @Column({ nullable: true })
    TeleCallType: string;

    @IsOptional()
    @Column({ nullable: true })
    CallStatus: string;

    @IsOptional()
    @Column()
    Followup_type: string;


    @IsOptional()
    @Column({ type: 'decimal', precision: 10, scale: 7 })
    latitude: number;

    @IsOptional()
    @Column({ type: 'decimal', precision: 10, scale: 7 })
    longitude: number;

    @IsOptional()
    @Column({ nullable: true })
    Status: string;

    @IsOptional()
    @Column({ nullable: true })
    followup_Date: Date;


    @IsOptional()
    @Column({ type: "text", nullable: true })
    Remarks: string;

    @CreateDateColumn() // Automatically set to the current date and time
    created_at: Date;


    @ManyToOne(() => Client, client => client.clientVists)
    @JoinColumn({ name: 'client_id' })
    client: Client;
}
