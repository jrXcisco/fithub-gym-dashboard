import { create } from 'zustand';
import type { Event } from '../types';
import { generateId } from '../lib/utils';

interface EventStore {
  events: Event[];
  addEvent: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  getEventById: (id: string) => Event | undefined;
}

const initialEvents: Event[] = [
  {
    id: '1',
    title: 'Summer Fitness Challenge',
    description: 'A 30-day fitness challenge with prizes for top performers.',
    type: 'competition',
    startDate: '2024-10-01',
    endDate: '2024-10-30',
    location: 'Main Gym Floor',
    maxParticipants: 50,
    currentParticipants: 35,
    fee: 500,
    status: 'upcoming',
    trainerId: '1',
    createdAt: '2024-09-01T00:00:00Z',
    updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Yoga Workshop',
    description: 'Advanced yoga techniques for flexibility and mindfulness.',
    type: 'workshop',
    startDate: '2024-09-20',
    endDate: '2024-09-20',
    location: 'Yoga Studio',
    maxParticipants: 20,
    currentParticipants: 18,
    fee: 300,
    status: 'upcoming',
    trainerId: '2',
    createdAt: '2024-09-05T00:00:00Z',
    updatedAt: '2024-09-05T00:00:00Z',
  },
  {
    id: '3',
    title: 'Nutrition Seminar',
    description: 'Learn about proper nutrition for fitness goals.',
    type: 'seminar',
    startDate: '2024-08-15',
    endDate: '2024-08-15',
    location: 'Conference Room',
    maxParticipants: 30,
    currentParticipants: 30,
    fee: 0,
    status: 'completed',
    createdAt: '2024-08-01T00:00:00Z',
    updatedAt: '2024-08-15T00:00:00Z',
  },
];

export const useEventStore = create<EventStore>((set, get) => ({
  events: initialEvents,

  addEvent: (eventData) => {
    const now = new Date().toISOString();
    const newEvent: Event = {
      ...eventData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ events: [...state.events, newEvent] }));
  },

  updateEvent: (id, eventData) => {
    set((state) => ({
      events: state.events.map((event) =>
        event.id === id
          ? { ...event, ...eventData, updatedAt: new Date().toISOString() }
          : event
      ),
    }));
  },

  deleteEvent: (id) => {
    set((state) => ({
      events: state.events.filter((event) => event.id !== id),
    }));
  },

  getEventById: (id) => {
    return get().events.find((event) => event.id === id);
  },
}));
