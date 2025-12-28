import { create } from 'zustand';
import type { TeamMember } from '../types';
import { generateId } from '../lib/utils';

interface TeamStore {
  teamMembers: TeamMember[];
  addTeamMember: (member: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTeamMember: (id: string, member: Partial<TeamMember>) => void;
  deleteTeamMember: (id: string) => void;
  getTeamMemberById: (id: string) => TeamMember | undefined;
  // Aliases for backward compatibility
  trainers: TeamMember[];
  addTrainer: (trainer: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTrainer: (id: string, trainer: Partial<TeamMember>) => void;
  deleteTrainer: (id: string) => void;
  getTrainerById: (id: string) => TeamMember | undefined;
}

const initialTeamMembers: TeamMember[] = [
  {
    id: '1',
    firstName: 'Arjun',
    lastName: 'Verma',
    email: 'arjun.verma@gympro.com',
    phone: '+91 99887 76655',
    role: 'trainer',
    specialization: ['Weight Training', 'Bodybuilding', 'Strength Training'],
    experience: 8,
    certifications: ['ACE Certified', 'ISSA Certified', 'CrossFit Level 2'],
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      startTime: '06:00',
      endTime: '14:00',
    },
    salary: 45000,
    status: 'active',
    joiningDate: '2023-01-15',
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    firstName: 'Priya',
    lastName: 'Nair',
    email: 'priya.nair@gympro.com',
    phone: '+91 88776 65544',
    role: 'trainer',
    specialization: ['Yoga', 'Pilates', 'Flexibility Training'],
    experience: 5,
    certifications: ['RYT 500', 'Pilates Certified'],
    availability: {
      days: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
      startTime: '07:00',
      endTime: '15:00',
    },
    salary: 35000,
    status: 'active',
    joiningDate: '2023-06-01',
    createdAt: '2023-06-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    firstName: 'Karan',
    lastName: 'Mehta',
    email: 'karan.mehta@gympro.com',
    phone: '+91 77665 54433',
    role: 'trainer',
    specialization: ['Cardio', 'HIIT', 'Weight Loss'],
    experience: 6,
    certifications: ['NASM Certified', 'Spinning Instructor'],
    availability: {
      days: ['Tuesday', 'Thursday', 'Saturday', 'Sunday'],
      startTime: '14:00',
      endTime: '22:00',
    },
    salary: 40000,
    status: 'active',
    joiningDate: '2023-03-15',
    createdAt: '2023-03-15T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    firstName: 'Ravi',
    lastName: 'Kumar',
    email: 'ravi.kumar@gympro.com',
    phone: '+91 66554 43322',
    role: 'cleaning-staff',
    specialization: [],
    experience: 3,
    certifications: [],
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      startTime: '05:00',
      endTime: '13:00',
    },
    salary: 18000,
    status: 'active',
    joiningDate: '2023-08-01',
    createdAt: '2023-08-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '5',
    firstName: 'Sneha',
    lastName: 'Sharma',
    email: 'sneha.sharma@gympro.com',
    phone: '+91 55443 32211',
    role: 'receptionist',
    specialization: [],
    experience: 2,
    certifications: [],
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      startTime: '09:00',
      endTime: '18:00',
    },
    salary: 22000,
    status: 'active',
    joiningDate: '2023-09-15',
    createdAt: '2023-09-15T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export const useTeamStore = create<TeamStore>((set, get) => ({
  teamMembers: initialTeamMembers,

  addTeamMember: (memberData) => {
    const now = new Date().toISOString();
    const newMember: TeamMember = {
      ...memberData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ teamMembers: [...state.teamMembers, newMember] }));
  },

  updateTeamMember: (id, memberData) => {
    set((state) => ({
      teamMembers: state.teamMembers.map((member) =>
        member.id === id
          ? { ...member, ...memberData, updatedAt: new Date().toISOString() }
          : member
      ),
    }));
  },

  deleteTeamMember: (id) => {
    set((state) => ({
      teamMembers: state.teamMembers.filter((member) => member.id !== id),
    }));
  },

  getTeamMemberById: (id) => {
    return get().teamMembers.find((member) => member.id === id);
  },

  // Backward compatibility aliases
  get trainers() {
    return get().teamMembers;
  },
  addTrainer: (trainerData) => {
    get().addTeamMember(trainerData);
  },
  updateTrainer: (id, trainerData) => {
    get().updateTeamMember(id, trainerData);
  },
  deleteTrainer: (id) => {
    get().deleteTeamMember(id);
  },
  getTrainerById: (id) => {
    return get().getTeamMemberById(id);
  },
}));

// Alias for backward compatibility
export const useTrainerStore = useTeamStore;
