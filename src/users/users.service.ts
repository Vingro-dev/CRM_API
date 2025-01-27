import { ConflictException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User) private readonly UserRepository: Repository<User>,
    private readonly mailerService: MailerService
  ) { }


  async findByEmail(email: string): Promise<User | undefined> {

    console.log("emaildata", await this.UserRepository.findOne({ where: { email } }));

    return await this.UserRepository.findOne({ where: { email } });
  }

  async updatePassword(email: string, password: string): Promise<void> {
    await this.UserRepository.update({ email }, { password });
  }



  async create(createUserDto: any) {
    console.log(createUserDto);

    // Check if the user already exists
    const alreadyExists = await this.UserRepository.findOne({
      where: { name: createUserDto.name, email: createUserDto.email },
    });

    if (alreadyExists) throw new ConflictException('This user already exists');

    // Hash password (you can use a different method for password generation)
    const dobString = new Date(createUserDto.DOB).toISOString().split('T')[0].replace(/-/g, '');
    const hashPassword = await bcrypt.hash(dobString, 10);

    // Create a new user
    const newUser = this.UserRepository.create({
      name: createUserDto.name,
      password: hashPassword,
      email: createUserDto.email,
      role: 'user',
      DOB: createUserDto.DOB,
      mobile: createUserDto.mobile,
      address: createUserDto.address,
      gender: createUserDto.gender,
      profile: createUserDto.profile,
      createdby: createUserDto.user_id,
      des_id: createUserDto.des_id,
      cm_id: createUserDto.cm_id,
      isActive: true,
    });

    // Save the user
    await this.UserRepository.save(newUser);

    await this.mailerService.sendMail({
      to: newUser.email, // Send to the user's email
      subject: 'Your Account Has Been Created', // Subject
      template: 'account-created', // Handlebars template (make sure it's available)
      context: {
        name: newUser.name,
        loginId: newUser.email,
        password: dobString,
        //loginUrl: 'https://your-app-login-url.com', 
      },
    });

    // Return the created user with 201 status code
    return {
      statusCode: HttpStatus.CREATED,
      message: 'User created successfully',
      data: newUser,
    };
  }




  async findAll() {
    return this.UserRepository.find({
      select: ['user_id', 'name', 'email', 'DOB', 'mobile', 'profile', 'isActive'], // Select specific fields
      relations: ['designation', 'company'],
      order: { isActive: 'DESC', user_id: 'DESC' },

    }).then(users =>
      users.map(user => {
        const dob = new Date(user.DOB);
        const currentYear = new Date().getFullYear();
        const age = currentYear - dob.getFullYear();

        // Format DOB to "Apr 12, 1995"
        const formattedDOB = dob.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });

        return {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          DOB: formattedDOB, // Use the formatted date
          profile: user.profile ? user.profile : user.name,
          currentYear,
          age,
          mobile: user.mobile,
          designationName: user.designation?.DesginationName || null,
          companyName: user.company?.CompanyName || null,
          isactive: user.isActive
        };
      })
    );
  }


  async findOne(user_id: number) {
    return this.UserRepository.find({
      select: ['user_id', 'name', 'email', 'DOB', 'mobile', 'profile', 'gender'],
      relations: ['designation', 'company'],
      where: { user_id }
    }).then(users =>
      users.map(user => {
        const dob = new Date(user.DOB);
        const currentYear = new Date().getFullYear();
        const age = currentYear - dob.getFullYear();
        const formattedDOB = dob.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });

        return {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          gender: user.gender,
          DOB: formattedDOB,
          dateofbirth: user.DOB,
          profile: user.profile ? user.profile : null,
          currentYear,
          age,
          mobile: user.mobile,
          designationName: user.designation?.DesginationName || null,
          companyName: user.company?.CompanyName || null,
        };
      })
    );
  }

  async update(user_id: number, updateUserDto: UpdateUserDto) {

    const existingUser = await this.UserRepository.findOne({ where: { user_id } });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${user_id} not found`);
    }

    await this.UserRepository.update(user_id, updateUserDto);

    return `User with ID ${user_id} has been updated successfully`;
  }

  async remove(user_id: number) {

    return await this.UserRepository.delete({ user_id });
  }


  async isActiveuser(user_id: number, mood: string) {

    if (mood === 'InActive') {
      return await this.UserRepository.update({ user_id }, { isActive: false })

    }

    else {

      return await this.UserRepository.update({ user_id }, { isActive: true })
    }



  }


  async updateUserProfile_Useronly(user_id: number, mood: string, data: any) {



    if (!user_id && !mood && !data) {
      return
    }


    if (mood === 'profileimg') {

      return this.UserRepository.update({ user_id }, { profile: data.image })
    }

    if (mood === "profileDetails") {
      return this.UserRepository.update({ user_id }, {
        name: data.name,
        email: data.email,
        gender: data.gender,
        DOB: data.DOB,
        mobile: data.mobile,
        profile: data.image
      })
    }


  }



  async updateOnlineStatus(userId: number, isOnline: boolean) {



    console.log('api called for Update Online Status');


    try {
      const user = await this.UserRepository.findOne({ where: { user_id: userId } });

      if (!user) {
        throw new Error('User not found');
      }
      user.isOnline = isOnline;
      user.lastOnline = isOnline ? new Date() : new Date();
      await this.UserRepository.save(user);
      return { success: true, message: `User ${isOnline ? 'is now online' : 'is offline'}` };
    } catch (error) {
      console.error(error);
      throw new Error('Error updating online status');
    }
  }

}
