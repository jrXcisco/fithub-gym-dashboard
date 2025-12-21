import { create } from 'zustand';
import type { Trainer } from '../types';
import { generateId } from '../lib/utils';

interface TrainerStore {
  trainers: Trainer[];
  addTrainer: (trainer: Omit<Trainer, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTrainer: (id: string, trainer: Partial<Trainer>) => void;
  deleteTrainer: (id: string) => void;
  getTrainerById: (id: string) => Trainer | undefined;
}

const initialTrainers: Trainer[] = [
  {
    id: '1',
    firstName: 'Arjun',
    lastName: 'Verma',
    email: 'arjun.verma@gympro.com',
    phone: '+91 99887 76655',
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
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    firstName: 'Priya',
    lastName: 'Nair',
    email: 'priya.nair@gympro.com',
    phone: '+91 88776 65544',
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
    createdAt: '2023-06-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    firstName: 'Karan',
    lastName: 'Mehta',
    email: 'karan.mehta@gympro.com',
    phone: '+91 77665 54433',
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
    createdAt: '2023-03-15T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export const useTrainerStore = create<TrainerStore>((set, get) => ({
  trainers: initialTrainers,

  addTrainer: (trainerData) => {
    const now = new Date().toISOString();
    const newTrainer: Trainer = {
      ...trainerData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ trainers: [...state.trainers, newTrainer] }));
  },

  updateTrainer: (id, trainerData) => {
    set((state) => ({
      trainers: state.trainers.map((trainer) =>
        trainer.id === id
          ? { ...trainer, ...trainerData, updatedAt: new Date().toISOString() }
          : trainer
      ),
    }));
  },

  deleteTrainer: (id) => {
    set((state) => ({
      trainers: state.trainers.filter((trainer) => trainer.id !== id),
    }));
  },

  getTrainerById: (id) => {
    return get().trainers.find((trainer) => trainer.id === id);
  },
}));
