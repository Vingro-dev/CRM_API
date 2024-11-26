import { ClientVist } from 'src/client_vist/entities/client_vist.entity';
import { ServicesOffer } from 'src/services_offer/entities/services_offer.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, OneToMany, JoinColumn } from 'typeorm';

@Entity('clients')
export class Client {

  @PrimaryGeneratedColumn()
  client_id: number;

  @Column({ length: 100 })
  company_name: string;

  @Column({ length: 100 })
  client_name: string;

  @Column({ length: 255 })
  client_address: string;

  @Column({ length: 50 })
  contact: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column()
  created_by: number;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => ClientVist, clientVist => clientVist.client)
  clientVists: ClientVist[];

  @ManyToOne(() => ServicesOffer, (servicesOffer) => servicesOffer.clientVisits, { cascade: true })
  @JoinColumn({ name: 's_id' })
  services: ServicesOffer;


  // @OneToMany(type => ClientVist, clientVist => clientVist.client)
  // clientVists: ClientVist[];

  
}
