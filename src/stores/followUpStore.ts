import { create } from 'zustand';
import type { FollowUp } from '../types';
import { generateId } from '../lib/utils';

interface FollowUpStore {
  followUps: FollowUp[];
  addFollowUp: (followUp: Omit<FollowUp, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateFollowUp: (id: string, followUp: Partial<FollowUp>) => void;
  deleteFollowUp: (id: string) => void;
  getFollowUpById: (id: string) => FollowUp | undefined;
}

const initialFollowUps: FollowUp[] = [
  {
    id: '1',
    memberId: '3',
    memberName: 'Amit Kumar',
    type: 'renewal',
    status: 'pending',
    priority: 'high',
    scheduledDate: '2024-09-15',
    notes: 'Membership expired. Contact for renewal offer.',
    assignedTo: 'Admin',
    createdAt: '2024-09-01T00:00:00Z',
    updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: '2',
    memberId: '4',
    memberName: 'Sneha Reddy',
    type: 'inquiry',
    status: 'pending',
    priority: 'medium',
    scheduledDate: '2024-09-10',
    notes: 'Payment pending. Follow up on payment status.',
    assignedTo: 'Admin',
    createdAt: '2024-09-05T00:00:00Z',
    updatedAt: '2024-09-05T00:00:00Z',
  },
  {
    id: '3',
    memberId: '1',
    memberName: 'Rahul Sharma',
    type: 'feedback',
    status: 'completed',
    priority: 'low',
    scheduledDate: '2024-08-20',
    completedDate: '2024-08-20',
    notes: 'Collected feedback on new equipment.',
    assignedTo: 'Admin',
    createdAt: '2024-08-15T00:00:00Z',
    updatedAt: '2024-08-20T00:00:00Z',
  },
];

export const useFollowUpStore = create<FollowUpStore>((set, get) => ({
  followUps: initialFollowUps,

  addFollowUp: (followUpData) => {
    const now = new Date().toISOString();
    const newFollowUp: FollowUp = {
      ...followUpData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ followUps: [...state.followUps, newFollowUp] }));
  },

  updateFollowUp: (id, followUpData) => {
    set((state) => ({
      followUps: state.followUps.map((followUp) =>
        followUp.id === id
          ? { ...followUp, ...followUpData, updatedAt: new Date().toISOString() }
          : followUp
      ),
    }));
  },

  deleteFollowUp: (id) => {
    set((state) => ({
      followUps: state.followUps.filter((followUp) => followUp.id !== id),
    }));
  },

  getFollowUpById: (id) => {
    return get().followUps.find((followUp) => followUp.id === id);
  },
}));
