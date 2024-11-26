import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateClientVistDto } from './dto/create-client_vist.dto';
import { UpdateClientVistDto } from './dto/update-client_vist.dto';
import { Repository } from 'typeorm';
import { ClientVist } from './entities/client_vist.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from 'src/client/entities/client.entity';
import { ServicesOffer } from 'src/services_offer/entities/services_offer.entity';
import { endOfDay, startOfDay } from 'date-fns';


@Injectable()
export class ClientVistService {

  constructor(
    @InjectRepository(ClientVist) private readonly ClientVistRepository: Repository<ClientVist>,
    @InjectRepository(Client) private readonly clientRepository: Repository<Client>,
    @InjectRepository(ServicesOffer) private readonly servicesOfferRepository: Repository<ServicesOffer>
  ) { }

  create(createClientVistDto: CreateClientVistDto) {

    const newClientVist = this.ClientVistRepository.create(createClientVistDto);
    return this.ClientVistRepository.save(newClientVist);
  }

  async newEnquiry(data: CreateClientVistDto) {

    const existingClient = await this.clientRepository.findOne({
      where: {
        email: data.email,
        company_name: data.company_name,
      },
    });


    if (existingClient) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          error: 'Client with this email already exists',
        },
        HttpStatus.CONFLICT,
      );
    }


    if (data.Followup_type === 'Close') {


      const newClient = this.clientRepository.create({
        company_name: data.company_name,
        client_name: data.client_name,
        client_address: data.client_address,
        contact: data.contact,
        email: data.email,
        created_by: data.user_id,
        services: data.services,
      });

      const savedClient = await this.clientRepository.save(newClient);
      return savedClient;
    }


    // if (data.visit_type === 'LiveVisit') {

    const newClient = this.clientRepository.create({
      company_name: data.company_name,
      client_name: data.client_name,
      client_address: data.client_address,
      contact: data.contact,
      email: data.email,
      created_by: data.user_id,
      services: data.services
    });

    const savedClient = await this.clientRepository.save(newClient);

    const clientId = savedClient.client_id;


    const existingClientVisit = await this.ClientVistRepository.findOne({
      where: { user_id: data.user_id, client_id: clientId },
    });

    if (existingClientVisit) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          error: 'Client visit for this user and client already exists',
        },
        HttpStatus.CONFLICT,
      );
    }

    // Create and save the client visit
    const newClientVisit = this.ClientVistRepository.create({
      user_id: Number(data.user_id),
      client_id: Number(clientId),
      services: data.services,
      images: data.images,
      visit_type: data.visit_type,
      Followup_type: data.Followup_type,
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
      followup_Date: data.followup_Date,
      Status: 'P',
    });

    const savedClientVisit = await this.ClientVistRepository.save(newClientVisit);

    return { savedClient, savedClientVisit };

    // }





  }




  async FollowUpOneGet(client_id: number) {
    const followUp = await this.ClientVistRepository.createQueryBuilder('clientVisit')
      .innerJoin('clientVisit.client', 'client')
      .innerJoin('clientVisit.services', 'services')
      .select([
        'clientVisit.cv_id AS cv_id',
        'clientVisit.visit_type AS visit_type',
        'clientVisit.Followup_type AS Followup_type',
        'clientVisit.followup_Date AS followup_Date',
        'clientVisit.latitude AS latitude',
        'clientVisit.longitude AS longitude',
        'clientVisit.Status AS Status',
        'client.company_name AS company_name',
        'client.client_name AS client_name',
        'client.contact AS contact',
        'client.email AS email',
        'services.servicename AS servicename',
      ])
      .where('client.client_id = :client_id', { client_id })
      .getRawMany(); // Use getRawMany to get the raw result with joined data

    if (!followUp.length) {
      throw new NotFoundException(`No follow-ups found for client with ID ${client_id}`);
    }

    return { followUp };
  }


  async FollowUPSave(FollowupData: any, ClientData: any, user_id: number) {

    const client_id = (await this.ClientVistRepository.findOne({ where: { cv_id: ClientData.cv_id } })).client_id;


    const service = FollowupData.Services === '' ? (await this.servicesOfferRepository.findOne({ where: { servicename: ClientData.servicename } })).s_id : FollowupData.Services

    // Logic for 'ClientApproval' Followup_type
    if (FollowupData.Followup_type === 'ClientApproval') {




      const newEntry = this.ClientVistRepository.create({
        user_id: user_id,
        client_id: Number(client_id),
        services: service,
        images: FollowupData.images,
        visit_type: FollowupData.visit_type,
        Followup_type: FollowupData.Followup_type,
        latitude: FollowupData.latitude || 0,
        longitude: FollowupData.longitude || 0,
        //followup_Date: FollowupData.followup_Date,
        Status: 'C',
        CallStatus: FollowupData.CallStatus,
        TeleCallType: FollowupData.TeleCallMode,
        Remarks: FollowupData.Remarks,
      });

      const savedClientVisit = await this.ClientVistRepository.save(newEntry);


      console.log('Updating rows with:', {
        client_id: Number(client_id),
        user_id: user_id,
      });


      const rowsToUpdate = await this.ClientVistRepository.find({
        where: { client_id: Number(client_id), user_id: user_id },
      });
      console.log('Rows to update:', rowsToUpdate);


      const updateALL = await this.ClientVistRepository.update(
        { client_id: Number(client_id), user_id: user_id },
        { Status: 'C' }
      );


      console.log(updateALL);


      return { savedClientVisit, updateALL };
    }

    // Logic for 'Followup' Followup_type
    if (FollowupData.Followup_type === 'Followup') {

      const newEntry = this.ClientVistRepository.create({
        user_id: user_id,
        client_id: Number(client_id),
        services: service,
        images: FollowupData.images,
        visit_type: FollowupData.visit_type,
        Followup_type: FollowupData.Followup_type,
        latitude: FollowupData.latitude || 0,
        longitude: FollowupData.longitude || 0,
        followup_Date: FollowupData.followup_Date,
        Status: 'P',
        CallStatus: FollowupData.CallStatus,
        TeleCallType: FollowupData.TeleCallMode,
        Remarks: FollowupData.Remarks,
      });

      const savedClientVisit = await this.ClientVistRepository.save(newEntry);

      return savedClientVisit;
    }
  }


  async newClinetView(created_by: number) {

    const todayStart = startOfDay(new Date());

    const todayEnd = endOfDay(new Date());

    const newClient = await this.clientRepository.createQueryBuilder('clients')
      .innerJoin('clients.services', 'services')
      .select([
        'clients.company_name AS company_name', // Correct alias
        'clients.client_name AS client_name',   // Correct alias
        'clients.contact AS contact',   // Correct alias
        'services.servicename AS servicename'   // Correct alias
      ])
      .where('clients.created_by = :created_by', { created_by })
      .andWhere('clients.created_at BETWEEN :todayStart AND :todayEnd', { todayStart, todayEnd })
       .orderBy('clients.created_at', 'DESC') // Adding ORDER BY clause
      .getRawMany();

    return { newClient };
  }

}
