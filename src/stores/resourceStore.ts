import { create } from 'zustand';
import type { Resource } from '../types';
import { generateId } from '../lib/utils';

interface ResourceStore {
  resources: Resource[];
  addResource: (resource: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateResource: (id: string, resource: Partial<Resource>) => void;
  deleteResource: (id: string) => void;
  getResourceById: (id: string) => Resource | undefined;
}

const initialResources: Resource[] = [
  {
    id: '1',
    name: 'Treadmill - Commercial Grade',
    type: 'equipment',
    quantity: 10,
    status: 'available',
    location: 'Cardio Zone',
    purchaseDate: '2023-01-15',
    lastMaintenanceDate: '2024-08-01',
    nextMaintenanceDate: '2024-11-01',
    cost: 150000,
    notes: 'Life Fitness brand, 5-year warranty',
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2024-08-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Dumbbells Set (5-50 kg)',
    type: 'equipment',
    quantity: 2,
    status: 'available',
    location: 'Free Weights Area',
    purchaseDate: '2023-03-01',
    cost: 80000,
    notes: 'Rubber coated, includes rack',
    createdAt: '2023-03-01T00:00:00Z',
    updatedAt: '2023-03-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Yoga Mats',
    type: 'consumable',
    quantity: 25,
    status: 'available',
    location: 'Yoga Studio',
    purchaseDate: '2024-01-01',
    cost: 500,
    notes: 'Premium quality, 6mm thickness',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'Smith Machine',
    type: 'equipment',
    quantity: 2,
    status: 'maintenance',
    location: 'Strength Training Area',
    purchaseDate: '2022-06-15',
    lastMaintenanceDate: '2024-09-01',
    nextMaintenanceDate: '2024-09-15',
    cost: 200000,
    notes: 'Cable replacement in progress',
    createdAt: '2022-06-15T00:00:00Z',
    updatedAt: '2024-09-01T00:00:00Z',
  },
  {
    id: '5',
    name: 'Protein Supplements',
    type: 'consumable',
    quantity: 0,
    status: 'out-of-stock',
    location: 'Reception Counter',
    cost: 2500,
    notes: 'Whey protein - various flavors',
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-09-01T00:00:00Z',
  },
];

export const useResourceStore = create<ResourceStore>((set, get) => ({
  resources: initialResources,

  addResource: (resourceData) => {
    const now = new Date().toISOString();
    const newResource: Resource = {
      ...resourceData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ resources: [...state.resources, newResource] }));
  },

  updateResource: (id, resourceData) => {
    set((state) => ({
      resources: state.resources.map((resource) =>
        resource.id === id
          ? { ...resource, ...resourceData, updatedAt: new Date().toISOString() }
          : resource
      ),
    }));
  },

  deleteResource: (id) => {
    set((state) => ({
      resources: state.resources.filter((resource) => resource.id !== id),
    }));
  },

  getResourceById: (id) => {
    return get().resources.find((resource) => resource.id === id);
  },
}));
