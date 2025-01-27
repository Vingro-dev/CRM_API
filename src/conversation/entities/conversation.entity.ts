import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { User } from "src/users/entities/user.entity"; // Adjust the import path as necessary

@Entity("Conversation")
export class Conversation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "text" })
    message: string;

    @Column({ default: false })
    isUser: boolean; // Indicates whether the message is from the user

    @Column({ default: false })
    isRead: boolean; // Indicates whether the message has been read

    @CreateDateColumn()
    createdAt: Date;

    // New column: Links the conversation to a user
    @ManyToOne(() => User, (user) => user.conversations, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userid" })
    user: User;

    @Column()
    userid: number;

    // Optional: Sender type (e.g., user, admin, system)
    @Column({ type: "varchar", length: 50, nullable: true })
    sender_type: string;


    @Column()
    createdby: number;



}
