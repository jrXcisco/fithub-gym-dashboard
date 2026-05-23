export type MemberStatus = 'active' | 'inactive' | 'expired' | 'pending';

export type SubscriptionPlan = 'monthly' | 'quarterly' | 'half-yearly' | 'yearly' | 'custom';

export type WorkoutGoal = 'weight-loss' | 'weight-gain' | 'muscle-building' | 'general-fitness' | 'cardio' | 'flexibility';

export type PaymentMethod = 'cash' | 'card' | 'upi' | 'bank-transfer' | 'cash+upi' | 'cash+card' | 'upi+card';

export type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'partial';

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaymentRecord {
  id?: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  notes?: string;
  receiptNumber?: string;
}

export interface PaymentInfo {
  method: PaymentMethod;
  methods?: PaymentMethod[]; // For combination payments
  methodAmounts?: Record<string, number>; // Amount per method for split payments
  status: PaymentStatus;
  amount: number;
  paidAmount: number;
  dueDate: string;
  nextDueDate?: string;
  lastPaymentDate?: string;
  discount?: number;
  applyTaxes?: boolean;
  taxRate?: string;
  cgst?: number;
  sgst?: number;
  totalTax?: number;
}

export interface WorkoutProgram {
  goal: WorkoutGoal;
  startDate: string;
  endDate?: string;
  trainerId?: string;
  notes?: string;
}

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender: 'male' | 'female' | 'other';
  profileImage?: string;
  address: Address;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  membershipStartDate: string;
  membershipEndDate: string;
  subscriptionPlan: SubscriptionPlan;
  customPlanMonths?: number;
  customPlanAmountPerMonth?: number;
  status: MemberStatus;
  payment: PaymentInfo;
  paymentHistory?: PaymentRecord[];
  workoutProgram?: WorkoutProgram;
  createdAt: string;
  updatedAt: string;
}

export type TeamRole = 'trainer' | 'cleaning-staff' | 'receptionist' | 'manager' | 'maintenance' | 'security' | 'other';

export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: TeamRole;
  specialization: string[];
  experience: number;
  certifications: string[];
  availability: {
    days: string[];
    startTime: string;
    endTime: string;
  };
  salary: number;
  status: 'active' | 'inactive';
  profileImage?: string;
  joiningDate?: string;
  address?: Address;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Alias for backward compatibility
export type Trainer = TeamMember;

export interface FollowUp {
  id: string;
  memberId: string;
  memberName: string;
  type: 'renewal' | 'feedback' | 'complaint' | 'inquiry' | 'general';
  status: 'pending' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  scheduledDate: string;
  completedDate?: string;
  notes: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  type: 'workshop' | 'competition' | 'seminar' | 'camp' | 'other';
  startDate: string;
  endDate: string;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  fee: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  trainerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  id: string;
  name: string;
  type: 'equipment' | 'facility' | 'consumable' | 'other';
  quantity: number;
  status: 'available' | 'in-use' | 'maintenance' | 'out-of-stock';
  location: string;
  purchaseDate?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  cost: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  expiredMembers: number;
  pendingRenewals: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  totalTrainers: number;
  upcomingEvents: number;
}

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface TableFilters {
  search: string;
  status?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
