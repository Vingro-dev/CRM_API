import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from 'src/client/entities/client.entity';
import { ClientVist } from 'src/client_vist/entities/client_vist.entity';
import { Brackets, Repository } from 'typeorm';

@Injectable()
export class DashboardService {

    constructor(
        @InjectRepository(Client)
        private readonly clientRepository: Repository<Client>,
        @InjectRepository(ClientVist)
        private readonly clientVistRepository: Repository<ClientVist>
    ) { }

    async getDashboardCount(userId: any) {
        const user_id = Number(userId);

        const date = new Date();
        const formattedDate = date.toISOString().split('T')[0];

        console.log(userId, formattedDate, "today date");

        const newClientsCount = await this.clientRepository
            .createQueryBuilder('client')
            .where('client.created_by = :user_id', { user_id }) // Use parameterized query
            .andWhere('CONVERT(date, client.created_at) = :formattedDate', { formattedDate }) // Use parameterized query
            .getCount();


        const followUpClients = await this.clientVistRepository
            .createQueryBuilder('clientVist')
            .select(['DISTINCT client.client_id',
                'client.client_id as id',
                'client.company_name AS company_name',
                'client.client_name AS clientName',
                'clientVist.Status AS Status',
                'clientVist.followup_Date AS followupDate'  // Retrieve raw date
            ])
            .innerJoin('clientVist.client', 'client')
            .where('clientVist.user_id = :user_id', { user_id })
            .andWhere(
                new Brackets(qb => {
                    qb.where('clientVist.Status = :status', { status: 'P' })
                        .andWhere('CONVERT(date, clientVist.followup_Date) <= :formattedDate', { formattedDate });
                })
            )
            .getRawMany();  // Return raw data

        const formattedFollowUpClients = followUpClients.map(client => ({
            id: client.id,
            Status: client.Status,
            company_name: client.company_name,
            client_name: client.clientName,
            followup_Date: new Date(client.followupDate).toISOString().split('T')[0]  // Format date to YYYY-MM-DD
        }));

        return {
            newClientsCount: newClientsCount,
            followUpClientsCount: formattedFollowUpClients.length,
            followUpClients: formattedFollowUpClients
        };


    }



}
