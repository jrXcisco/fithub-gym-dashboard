import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Plus,
  Upload,
  Loader2,
  UserPlus,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Header } from '../../../components/layout';
import { Widget, DataTable, Button, Modal, SearchSuggestions, FilterMenu } from '../../../components/ui';
import type { FilterField } from '../../../components/ui';
import { MemberForm } from '../components/MemberForm';
import { BulkUpload } from '../components/BulkUpload';
import { formatDate, getStatusColor } from '../../../lib/utils';
import { GET_MEMBERS, CREATE_MEMBER, UPDATE_MEMBER, DELETE_MEMBER, SEARCH_MEMBER_SUGGESTIONS } from '../../../graphql/members';
import type { MemberStatus, PaymentMethod, PaymentStatus, WorkoutGoal } from '../../../types';

interface EmergencyContact {
  name?: string;
  phone?: string;
  relationship?: string;
}

interface HealthInfo {
  height?: number;
  weight?: number;
  bloodGroup?: string;
  medicalConditions?: string[];
}

interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

interface Payment {
  method?: string;
  amount?: number;
  paidAmount?: number;
  status?: string;
  dueDate?: string;
  lastPaymentDate?: string;
}

interface WorkoutProgram {
  goal?: string;
  startDate?: string;
  notes?: string;
}

interface MemberData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: Address;
  membershipType: string;
  membershipStartDate: string;
  membershipEndDate?: string;
  status: string;
  emergencyContact?: EmergencyContact;
  healthInfo?: HealthInfo;
  payment?: Payment;
  workoutProgram?: WorkoutProgram;
  specialRequirements?: string;
  createdAt: string;
  updatedAt: string;
}

export function MembersListPage() {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberData | null>(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  // Filter state
  const [filters, setFilters] = useState<Record<string, string>>({
    status: 'all',
    fitnessGoal: 'all',
    membershipType: 'all',
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter fields configuration
  const filterFields: FilterField[] = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { label: 'All Status', value: 'all' },
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Expired', value: 'expired' },
        { label: 'Pending', value: 'pending' },
      ],
    },
    {
      key: 'fitnessGoal',
      label: 'Fitness Goal',
      options: [
        { label: 'All Goals', value: 'all' },
        { label: 'Weight Loss', value: 'weight_loss' },
        { label: 'Muscle Gain', value: 'muscle_gain' },
        { label: 'General Fitness', value: 'general_fitness' },
        { label: 'Strength Training', value: 'strength' },
        { label: 'Cardio', value: 'cardio' },
      ],
    },
    {
      key: 'membershipType',
      label: 'Plan',
      options: [
        { label: 'All Plans', value: 'all' },
        { label: 'Basic', value: 'basic' },
        { label: 'Standard', value: 'standard' },
        { label: 'Premium', value: 'premium' },
        { label: 'VIP', value: 'vip' },
      ],
    },
  ];

  const { data, loading, error, refetch } = useQuery(GET_MEMBERS, {
    variables: {
      filter: {
        ...(filters.status !== 'all' ? { status: filters.status } : {}),
        ...(filters.fitnessGoal !== 'all' ? { fitnessGoal: filters.fitnessGoal } : {}),
        ...(filters.membershipType !== 'all' ? { membershipType: filters.membershipType } : {}),
        ...(searchTerm ? { search: searchTerm } : {}),
      },
      pagination: { page: currentPage, limit: pageSize },
    },
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  });

  const [createMember] = useMutation(CREATE_MEMBER, {
    onCompleted: () => {
      refetch();
      setShowAddModal(false);
    },
    onError: (err) => {
      console.error('Error creating member:', err);
      alert(err.message);
    },
  });

  const [updateMember] = useMutation(UPDATE_MEMBER, {
    onCompleted: () => {
      refetch();
      setShowEditModal(false);
      setSelectedMember(null);
    },
    onError: (err) => {
      console.error('Error updating member:', err);
      alert(err.message);
    },
  });

  const [deleteMember] = useMutation(DELETE_MEMBER, {
    onCompleted: () => {
      refetch();
      setShowDeleteModal(false);
      setSelectedMember(null);
    },
    onError: (err) => {
      console.error('Error deleting member:', err);
      alert(err.message);
    },
  });

  const handleAddMember = async (formData: any) => {
    try {
      await createMember({
        variables: {
          input: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            address: formData.address ? {
              street: formData.address.street,
              city: formData.address.city,
              state: formData.address.state,
              zipCode: formData.address.zipCode,
              country: formData.address.country || 'India',
            } : undefined,
            membershipType: formData.subscriptionPlan || 'basic',
            membershipStartDate: formData.membershipStartDate,
            membershipEndDate: formData.membershipEndDate,
            status: formData.status || 'active',
            emergencyContact: formData.emergencyContact ? {
              name: formData.emergencyContact.name,
              phone: formData.emergencyContact.phone,
              relationship: formData.emergencyContact.relation,
            } : undefined,
            payment: formData.payment ? {
              method: formData.payment.method,
              amount: formData.payment.amount,
              paidAmount: formData.payment.paidAmount,
              status: formData.payment.status,
              dueDate: formData.payment.dueDate,
              lastPaymentDate: formData.payment.lastPaymentDate,
            } : undefined,
            workoutProgram: formData.workoutProgram ? {
              goal: formData.workoutProgram.goal,
              startDate: formData.workoutProgram.startDate,
              notes: formData.workoutProgram.notes,
            } : undefined,
          },
        },
      });
    } catch (err) {
      console.error('Error in handleAddMember:', err);
    }
  };

  const handleBulkUpload = (membersData: any[]) => {
    membersData.forEach((d) => handleAddMember(d));
  };

  const handleEditMember = async (formData: any) => {
    if (!selectedMember) return;
    try {
      await updateMember({
        variables: {
          id: selectedMember.id,
          input: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            address: formData.address ? {
              street: formData.address.street,
              city: formData.address.city,
              state: formData.address.state,
              zipCode: formData.address.zipCode,
              country: formData.address.country || 'India',
            } : undefined,
            membershipType: formData.subscriptionPlan || formData.membershipType,
            membershipStartDate: formData.membershipStartDate,
            membershipEndDate: formData.membershipEndDate,
            status: formData.status,
            emergencyContact: formData.emergencyContact ? {
              name: formData.emergencyContact.name,
              phone: formData.emergencyContact.phone,
              relationship: formData.emergencyContact.relation,
            } : undefined,
            payment: formData.payment ? {
              method: formData.payment.method,
              amount: formData.payment.amount,
              paidAmount: formData.payment.paidAmount,
              status: formData.payment.status,
              dueDate: formData.payment.dueDate,
              lastPaymentDate: formData.payment.lastPaymentDate,
            } : undefined,
            workoutProgram: formData.workoutProgram ? {
              goal: formData.workoutProgram.goal,
              startDate: formData.workoutProgram.startDate,
              notes: formData.workoutProgram.notes,
            } : undefined,
          },
        },
      });
    } catch (err) {
      console.error('Error in handleEditMember:', err);
    }
  };

  const handleDeleteMember = async () => {
    if (!selectedMember) return;
    try {
      await deleteMember({
        variables: { id: selectedMember.id },
      });
    } catch (err) {
      console.error('Error in handleDeleteMember:', err);
    }
  };

  const openEditModal = (member: MemberData, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMember(member);
    setShowEditModal(true);
  };

  const openDeleteModal = (member: MemberData, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMember(member);
    setShowDeleteModal(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600">Loading members...</span>
      </div>
    );
  }

  // Error state
  if (error && !data?.members) {
    const errorMessage = error.message || 'Unknown error';
    const isAuthError = errorMessage.includes('authenticated') || errorMessage.includes('Not authenticated');
    
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {isAuthError 
              ? 'Please log in to view members' 
              : `Error loading members: ${errorMessage}`}
          </p>
          <div className="flex gap-4 justify-center">
            {isAuthError ? (
              <Button onClick={() => window.location.href = '/login'}>Go to Login</Button>
            ) : (
              <Button onClick={() => refetch()}>Retry</Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Safely extract members array with null filtering
  const rawMembers = data?.members?.members;
  const members: MemberData[] = Array.isArray(rawMembers) 
    ? rawMembers.filter((m): m is MemberData => m !== null && m !== undefined)
    : [];
  
  // Get total count from server response for pagination
  const totalMembers = data?.members?.total || 0;

  // Use stats from server for widgets (all records, not just paginated)
  const stats = data?.members?.stats;
  const activeMembers = stats?.active || 0;
  const inactiveMembers = stats?.inactive || 0;
  const expiredMembers = stats?.expired || 0;
  const suspendedMembers = 0; // Not tracked in stats

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Check if any filters are applied
  const hasActiveFilters = Object.values(filters).some(v => v && v !== 'all') || searchTerm;
  
  // Check if this is truly empty (no members at all) vs filtered results empty
  const isTrulyEmpty = (stats?.total === 0 || stats?.total === undefined) && !hasActiveFilters;

  // Empty state - no members yet (only show when no filters applied and truly no members)
  if (members.length === 0 && isTrulyEmpty) {
    return (
      <div>
        <Header
          title="Members"
          subtitle="Manage your gym members and their subscriptions"
        />
        <div className="p-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-primary-100 rounded-full flex items-center justify-center animate-pulse">
                <UserPlus className="w-16 h-16 text-primary-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center animate-bounce">
                <Plus className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Members Yet
            </h2>
            <p className="text-gray-500 text-center max-w-md mb-8">
              Start building your gym community! Add your first member to begin tracking memberships, workouts, and progress.
            </p>
            
            <div className="flex gap-4">
              <Button
                variant="secondary"
                leftIcon={<Upload className="w-4 h-4" />}
                onClick={() => setShowBulkUpload(true)}
              >
                Bulk Upload
              </Button>
              <Button
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setShowAddModal(true)}
              >
                Add Your First Member
              </Button>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Track Members</h3>
                <p className="text-sm text-gray-500">Manage all your gym members in one place</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Membership Status</h3>
                <p className="text-sm text-gray-500">Monitor active, inactive & expired memberships</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Renewal Alerts</h3>
                <p className="text-sm text-gray-500">Never miss a membership renewal date</p>
              </div>
            </div>
          </div>
        </div>

        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add New Member"
          size="xl"
        >
          <MemberForm
            onSubmit={handleAddMember}
            onCancel={() => setShowAddModal(false)}
          />
        </Modal>

        <Modal
          isOpen={showBulkUpload}
          onClose={() => setShowBulkUpload(false)}
          title="Bulk Upload"
          size="lg"
        >
          <BulkUpload
            onUpload={handleBulkUpload}
            onClose={() => setShowBulkUpload(false)}
          />
        </Modal>
      </div>
    );
  }

  // Table columns - only defined when we have members
  const columns = [
    {
      key: 'name',
      header: 'Member',
      sortable: true,
      render: (member: MemberData) => {
        if (!member) return null;
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-medium text-sm">
                {member.firstName?.[0] || ''}{member.lastName?.[0] || ''}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {member.firstName || ''} {member.lastName || ''}
              </p>
              <p className="text-sm text-gray-500">{member.email || ''}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'phone',
      header: 'Phone',
      sortable: true,
      render: (member: MemberData) => member?.phone || '-',
    },
    {
      key: 'membershipType',
      header: 'Plan',
      sortable: true,
      render: (member: MemberData) => (
        <span className="capitalize">{member?.membershipType || '-'}</span>
      ),
    },
    {
      key: 'membershipEndDate',
      header: 'Expires On',
      sortable: true,
      render: (member: MemberData) => member?.membershipEndDate ? formatDate(member.membershipEndDate) : 'N/A',
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (member: MemberData) => {
        if (!member) return null;
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(member.status || '')}`}>
            {member.status || 'unknown'}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (member: MemberData) => {
        if (!member) return null;
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => openEditModal(member, e)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit member"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => openDeleteModal(member, e)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete member"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  const handleRowClick = (member: MemberData) => {
    if (member?.id) {
      navigate(`/dashboard/members/${member.id}`);
    }
  };

  const handleDownload = () => {
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Plan', 'Status', 'Start Date', 'End Date'];
    const rows = members.map((m) => [
      m.firstName || '',
      m.lastName || '',
      m.email || '',
      m.phone || '',
      m.membershipType || '',
      m.status || '',
      m.membershipStartDate || '',
      m.membershipEndDate || '',
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'members_export.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  // Normal view with members
  return (
    <div>
      <Header
        title="Members"
        subtitle="Manage your gym members and their subscriptions"
      />
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Widget
            title="Total Members"
            value={stats?.total || 0}
            icon={Users}
            color="blue"
          />
          <Widget
            title="Active Members"
            value={activeMembers}
            icon={UserCheck}
            color="green"
          />
          <Widget
            title="Inactive Members"
            value={inactiveMembers}
            icon={UserX}
            color="yellow"
          />
          <Widget
            title="Expired / Suspended"
            value={expiredMembers + suspendedMembers}
            icon={Clock}
            color="red"
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
          <SearchSuggestions
            query={SEARCH_MEMBER_SUGGESTIONS}
            placeholder="Search by name or phone..."
            onSelect={(member) => navigate(`/dashboard/members/${member.id}`)}
            onSearch={handleSearchChange}
            className="flex-1 max-w-md"
          />
          <div className="flex gap-3 items-center">
            <FilterMenu
              fields={filterFields}
              appliedFilters={filters}
              onFilterChange={handleFilterChange}
            />
            <Button
              variant="secondary"
              leftIcon={<Upload className="w-4 h-4" />}
              onClick={() => setShowBulkUpload(true)}
            >
              Bulk Upload
            </Button>
            <Button
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setShowAddModal(true)}
            >
              Add Member
            </Button>
          </div>
        </div>

        <DataTable
          data={members}
          columns={columns}
          onRowClick={handleRowClick}
          onDownload={handleDownload}
          emptyMessage="No members found"
          hideSearch={true}
          serverSidePagination={true}
          totalItems={totalMembers}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSearchChange={handleSearchChange}
          pageSize={pageSize}
          pageSizeOptions={[10, 25, 50, 100]}
        />

        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add New Member"
          size="xl"
        >
          <MemberForm
            onSubmit={handleAddMember}
            onCancel={() => setShowAddModal(false)}
          />
        </Modal>

        <Modal
          isOpen={showBulkUpload}
          onClose={() => setShowBulkUpload(false)}
          title="Bulk Upload"
          size="lg"
        >
          <BulkUpload
            onUpload={handleBulkUpload}
            onClose={() => setShowBulkUpload(false)}
          />
        </Modal>

        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedMember(null);
          }}
          title="Edit Member"
          size="xl"
        >
          {selectedMember && (
            <MemberForm
              initialData={{
                firstName: selectedMember.firstName,
                lastName: selectedMember.lastName,
                email: selectedMember.email,
                phone: selectedMember.phone,
                dateOfBirth: selectedMember.dateOfBirth ? selectedMember.dateOfBirth.split('T')[0] : '',
                gender: (selectedMember.gender as 'male' | 'female' | 'other') || 'male',
                address: selectedMember.address ? {
                  street: selectedMember.address.street || '',
                  city: selectedMember.address.city || '',
                  state: selectedMember.address.state || '',
                  zipCode: selectedMember.address.zipCode || '',
                  country: selectedMember.address.country || 'India',
                } : undefined,
                subscriptionPlan: selectedMember.membershipType as any,
                membershipStartDate: selectedMember.membershipStartDate ? selectedMember.membershipStartDate.split('T')[0] : '',
                membershipEndDate: selectedMember.membershipEndDate ? selectedMember.membershipEndDate.split('T')[0] : '',
                status: selectedMember.status as MemberStatus,
                emergencyContact: selectedMember.emergencyContact ? {
                  name: selectedMember.emergencyContact.name || '',
                  phone: selectedMember.emergencyContact.phone || '',
                  relation: selectedMember.emergencyContact.relationship || '',
                } : undefined,
                payment: selectedMember.payment ? {
                  method: (selectedMember.payment.method as PaymentMethod) || 'cash',
                  status: (selectedMember.payment.status as PaymentStatus) || 'pending',
                  amount: selectedMember.payment.amount || 0,
                  paidAmount: selectedMember.payment.paidAmount || 0,
                  dueDate: selectedMember.payment.dueDate ? selectedMember.payment.dueDate.split('T')[0] : '',
                  lastPaymentDate: selectedMember.payment.lastPaymentDate ? selectedMember.payment.lastPaymentDate.split('T')[0] : undefined,
                } : undefined,
                workoutProgram: selectedMember.workoutProgram ? {
                  goal: (selectedMember.workoutProgram.goal as WorkoutGoal) || 'general-fitness',
                  startDate: selectedMember.workoutProgram.startDate ? selectedMember.workoutProgram.startDate.split('T')[0] : '',
                  notes: selectedMember.workoutProgram.notes || '',
                } : undefined,
              }}
              onSubmit={handleEditMember}
              onCancel={() => {
                setShowEditModal(false);
                setSelectedMember(null);
              }}
            />
          )}
        </Modal>

        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedMember(null);
          }}
          title="Delete Member"
          size="sm"
        >
          <div className="p-4">
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-gray-900">
                {selectedMember?.firstName} {selectedMember?.lastName}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedMember(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteMember}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
