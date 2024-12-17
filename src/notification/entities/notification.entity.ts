import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column()
    expoPushToken: string;

    @Column()
    notificationTitle: string;

    @Column()
    notificationBody: string;

    @Column()
    scheduleDateTime: Date;

    @Column({ default: false })
    isSent: boolean;
}

