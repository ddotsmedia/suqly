import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['listings'],
    });

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    return user;
  }

  async findByPhone(phone: string): Promise<User> {
    return this.usersRepository.findOne({ where: { phone } });
  }

  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({ where: { email } });
  }

  // Only profile fields are editable; role, password and verification flags are not.
  async updateUser(
    id: number,
    updateData: Partial<User>,
  ): Promise<User> {
    const { displayName, bio, avatarUrl, language } = updateData;
    const allowed: Partial<User> = {};
    if (displayName !== undefined) allowed.displayName = displayName;
    if (bio !== undefined) allowed.bio = bio;
    if (avatarUrl !== undefined) allowed.avatarUrl = avatarUrl;
    if (language !== undefined) allowed.language = language;
    if (Object.keys(allowed).length) {
      await this.usersRepository.update(id, allowed);
    }
    return this.findById(id);
  }

  async getPublicProfile(id: number): Promise<Partial<User>> {
    const user = await this.findById(id);
    return {
      id: user.id,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      role: user.role,
      sellerScore: user.sellerScore,
      responseRate: user.responseRate,
      createdAt: user.createdAt,
    };
  }

  async getSellerStats(id: number): Promise<any> {
    const user = await this.findById(id);
    const listings = user.listings || [];

    return {
      userId: id,
      totalListings: listings.length,
      activeListings: listings.filter((l) => l.status === 'active').length,
      sellerScore: user.sellerScore || 0,
      responseRate: user.responseRate || 0,
    };
  }
}
