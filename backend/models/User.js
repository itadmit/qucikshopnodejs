import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export class User {
  static async create(userData) {
    const { email, password, firstName, lastName, phone, planType = 'BASIC' } = userData;
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, config.bcryptRounds);
    
    // Set trial period
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14); // 14 days trial
    
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        phone,
        planType,
        trialEndsAt
      }
    });
    
    return { id: user.id, email, firstName, lastName };
  }

  static async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
      include: { stores: true }
    });
  }

  static async findById(id) {
    return await prisma.user.findUnique({
      where: { id },
      include: { stores: true }
    });
  }

  static async authenticate(email, password) {
    const user = await this.findByEmail(email);
    if (!user) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return null;
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    // Remove password hash from response
    delete user.passwordHash;
    
    return { user, token };
  }

  static async updateSubscription(userId, planType, subscriptionEndsAt) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        planType,
        subscriptionStatus: 'ACTIVE',
        subscriptionEndsAt
      }
    });
  }

  static async isTrialExpired(userId) {
    const user = await this.findById(userId);
    if (!user) return true;
    
    return user.trialEndsAt && new Date() > new Date(user.trialEndsAt);
  }

  static async isSubscriptionActive(userId) {
    const user = await this.findById(userId);
    if (!user) return false;
    
    // Check if in trial period
    if (user.subscriptionStatus === 'TRIAL' && !await this.isTrialExpired(userId)) {
      return true;
    }
    
    // Check if subscription is active and not expired
    if (user.subscriptionStatus === 'ACTIVE') {
      return !user.subscriptionEndsAt || new Date() < new Date(user.subscriptionEndsAt);
    }
    
    return false;
  }
}