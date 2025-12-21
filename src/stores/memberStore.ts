import { create } from 'zustand';
import type { Member } from '../types';
import { generateId } from '../lib/utils';

interface MemberStore {
  members: Member[];
  addMember: (member: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMember: (id: string, member: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  getMemberById: (id: string) => Member | undefined;
  bulkAddMembers: (members: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
}

const initialMembers: Member[] = [
  {
    id: '1',
    firstName: 'Rahul',
    lastName: 'Sharma',
    email: 'rahul.sharma@email.com',
    phone: '+91 98765 43210',
    dateOfBirth: '1990-05-15',
    gender: 'male',
    address: {
      street: '123 MG Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India',
    },
    emergencyContact: {
      name: 'Priya Sharma',
      phone: '+91 98765 43211',
      relation: 'Wife',
    },
    membershipStartDate: '2024-01-01',
    membershipEndDate: '2024-12-31',
    subscriptionPlan: 'yearly',
    status: 'active',
    payment: {
      method: 'card',
      status: 'paid',
      amount: 25000,
      paidAmount: 25000,
      dueDate: '2024-01-01',
      lastPaymentDate: '2024-01-01',
    },
    workoutProgram: {
      goal: 'muscle-building',
      startDate: '2024-01-01',
      trainerId: '1',
      notes: 'Focus on upper body strength',
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    firstName: 'Anjali',
    lastName: 'Patel',
    email: 'anjali.patel@email.com',
    phone: '+91 87654 32109',
    dateOfBirth: '1995-08-22',
    gender: 'female',
    address: {
      street: '456 Park Street',
      city: 'Delhi',
      state: 'Delhi',
      zipCode: '110001',
      country: 'India',
    },
    emergencyContact: {
      name: 'Vikram Patel',
      phone: '+91 87654 32108',
      relation: 'Brother',
    },
    membershipStartDate: '2024-06-01',
    membershipEndDate: '2024-08-31',
    subscriptionPlan: 'quarterly',
    status: 'active',
    payment: {
      method: 'upi',
      status: 'paid',
      amount: 8000,
      paidAmount: 8000,
      dueDate: '2024-06-01',
      lastPaymentDate: '2024-06-01',
    },
    workoutProgram: {
      goal: 'weight-loss',
      startDate: '2024-06-01',
      trainerId: '2',
      notes: 'Cardio focused program',
    },
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
  },
  {
    id: '3',
    firstName: 'Amit',
    lastName: 'Kumar',
    email: 'amit.kumar@email.com',
    phone: '+91 76543 21098',
    dateOfBirth: '1988-03-10',
    gender: 'male',
    address: {
      street: '789 Lake View',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
      country: 'India',
    },
    emergencyContact: {
      name: 'Sunita Kumar',
      phone: '+91 76543 21097',
      relation: 'Mother',
    },
    membershipStartDate: '2024-03-01',
    membershipEndDate: '2024-05-31',
    subscriptionPlan: 'quarterly',
    status: 'expired',
    payment: {
      method: 'cash',
      status: 'paid',
      amount: 8000,
      paidAmount: 8000,
      dueDate: '2024-03-01',
      lastPaymentDate: '2024-03-01',
    },
    workoutProgram: {
      goal: 'general-fitness',
      startDate: '2024-03-01',
      notes: 'General fitness maintenance',
    },
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z',
  },
  {
    id: '4',
    firstName: 'Sneha',
    lastName: 'Reddy',
    email: 'sneha.reddy@email.com',
    phone: '+91 65432 10987',
    dateOfBirth: '1992-11-28',
    gender: 'female',
    address: {
      street: '321 Hill Road',
      city: 'Hyderabad',
      state: 'Telangana',
      zipCode: '500001',
      country: 'India',
    },
    emergencyContact: {
      name: 'Ravi Reddy',
      phone: '+91 65432 10986',
      relation: 'Father',
    },
    membershipStartDate: '2024-09-01',
    membershipEndDate: '2024-09-30',
    subscriptionPlan: 'monthly',
    status: 'pending',
    payment: {
      method: 'bank-transfer',
      status: 'pending',
      amount: 3000,
      paidAmount: 0,
      dueDate: '2024-09-05',
    },
    createdAt: '2024-09-01T00:00:00Z',
    updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: '5',
    firstName: 'Vikram',
    lastName: 'Singh',
    email: 'vikram.singh@email.com',
    phone: '+91 54321 09876',
    dateOfBirth: '1985-07-04',
    gender: 'male',
    address: {
      street: '567 River Side',
      city: 'Chennai',
      state: 'Tamil Nadu',
      zipCode: '600001',
      country: 'India',
    },
    emergencyContact: {
      name: 'Meera Singh',
      phone: '+91 54321 09875',
      relation: 'Wife',
    },
    membershipStartDate: '2024-01-01',
    membershipEndDate: '2024-06-30',
    subscriptionPlan: 'half-yearly',
    status: 'inactive',
    payment: {
      method: 'card',
      status: 'paid',
      amount: 15000,
      paidAmount: 15000,
      dueDate: '2024-01-01',
      lastPaymentDate: '2024-01-01',
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export const useMemberStore = create<MemberStore>((set, get) => ({
  members: initialMembers,

  addMember: (memberData) => {
    const now = new Date().toISOString();
    const newMember: Member = {
      ...memberData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ members: [...state.members, newMember] }));
  },

  updateMember: (id, memberData) => {
    set((state) => ({
      members: state.members.map((member) =>
        member.id === id
          ? { ...member, ...memberData, updatedAt: new Date().toISOString() }
          : member
      ),
    }));
  },

  deleteMember: (id) => {
    set((state) => ({
      members: state.members.filter((member) => member.id !== id),
    }));
  },

  getMemberById: (id) => {
    return get().members.find((member) => member.id === id);
  },

  bulkAddMembers: (membersData) => {
    const now = new Date().toISOString();
    const newMembers: Member[] = membersData.map((data) => ({
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    }));
    set((state) => ({ members: [...state.members, ...newMembers] }));
  },
}));
