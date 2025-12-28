import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import {
  UserCheck,
  Plus,
  Edit,
  Trash2,
  Award,
  Clock,
  Users,
  Loader2,
} from 'lucide-react';
import { Header } from '../../../components/layout';
import { Widget, DataTable, Button, Modal, Input, Select } from '../../../components/ui';
import { formatCurrency, getStatusColor, downloadAsCSV } from '../../../lib/utils';
import { GET_TEAM_MEMBERS, CREATE_TEAM_MEMBER, UPDATE_TEAM_MEMBER, DELETE_TEAM_MEMBER } from '../../../graphql/team';
import type { TeamRole } from '../../../types';

interface TeamMemberData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: TeamRole;
  specializations: string[];
  certifications: string[];
  experience: number;
  salary: number;
  joiningDate?: string;
  availability?: {
    days: string[];
    startTime: string;
    endTime: string;
  };
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

const roleOptions = [
  { label: 'Trainer', value: 'trainer' },
  { label: 'Cleaning Staff', value: 'cleaning-staff' },
  { label: 'Receptionist', value: 'receptionist' },
  { label: 'Manager', value: 'manager' },
  { label: 'Maintenance', value: 'maintenance' },
  { label: 'Security', value: 'security' },
  { label: 'Other', value: 'other' },
];

const getRoleColor = (role: TeamRole) => {
  const colors: Record<TeamRole, string> = {
    'trainer': 'bg-purple-100 text-purple-800',
    'cleaning-staff': 'bg-blue-100 text-blue-800',
    'receptionist': 'bg-green-100 text-green-800',
    'manager': 'bg-yellow-100 text-yellow-800',
    'maintenance': 'bg-orange-100 text-orange-800',
    'security': 'bg-red-100 text-red-800',
    'other': 'bg-gray-100 text-gray-800',
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
};

const formatRole = (role: TeamRole) => {
  return role.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const specializationOptions = [
  { label: 'Weight Training', value: 'Weight Training' },
  { label: 'Bodybuilding', value: 'Bodybuilding' },
  { label: 'Cardio', value: 'Cardio' },
  { label: 'HIIT', value: 'HIIT' },
  { label: 'Yoga', value: 'Yoga' },
  { label: 'Pilates', value: 'Pilates' },
  { label: 'CrossFit', value: 'CrossFit' },
  { label: 'Strength Training', value: 'Strength Training' },
  { label: 'Flexibility Training', value: 'Flexibility Training' },
  { label: 'Weight Loss', value: 'Weight Loss' },
];

const dayOptions = [
  { label: 'Monday', value: 'Monday' },
  { label: 'Tuesday', value: 'Tuesday' },
  { label: 'Wednesday', value: 'Wednesday' },
  { label: 'Thursday', value: 'Thursday' },
  { label: 'Friday', value: 'Friday' },
  { label: 'Saturday', value: 'Saturday' },
  { label: 'Sunday', value: 'Sunday' },
];

export function TrainersPage() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMemberData | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'trainer' as TeamRole,
    specializations: [] as string[],
    experience: 0,
    certifications: '',
    availableDays: [] as string[],
    startTime: '06:00',
    endTime: '14:00',
    salary: 0,
    status: 'active' as 'active' | 'inactive',
  });

  const { data, loading, error, refetch } = useQuery(GET_TEAM_MEMBERS, {
    variables: { pagination: { page: 1, limit: 100 } },
    fetchPolicy: 'network-only',
  });

  const [createTeamMember] = useMutation(CREATE_TEAM_MEMBER, {
    onCompleted: () => {
      refetch();
      resetForm();
    },
    onError: (err) => {
      console.error('Error creating team member:', err);
      alert(err.message);
    },
  });

  const [updateTeamMember] = useMutation(UPDATE_TEAM_MEMBER, {
    onCompleted: () => {
      refetch();
      resetForm();
    },
    onError: (err) => {
      console.error('Error updating team member:', err);
      alert(err.message);
    },
  });

  const [deleteTeamMemberMutation] = useMutation(DELETE_TEAM_MEMBER, {
    onCompleted: () => {
      refetch();
      setShowDeleteModal(false);
      setSelectedMember(null);
    },
    onError: (err) => {
      console.error('Error deleting team member:', err);
      alert(err.message);
    },
  });

  const teamMembers: TeamMemberData[] = data?.trainers?.trainers || [];
  const activeMembers = teamMembers.filter((t) => t.status === 'active').length;
  const totalSalary = teamMembers.filter((t) => t.status === 'active').reduce((sum, t) => sum + (t.salary || 0), 0);
  const trainersCount = teamMembers.filter((t) => t.role === 'trainer').length;

  const columns = [
    {
      key: 'name',
      header: 'Team Member',
      sortable: true,
      render: (member: TeamMemberData) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-purple-600 font-medium text-sm">
              {member.firstName[0]}{member.lastName[0]}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {member.firstName} {member.lastName}
            </p>
            <p className="text-sm text-gray-500">{member.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (member: TeamMemberData) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
          {formatRole(member.role)}
        </span>
      ),
    },
    {
      key: 'specializations',
      header: 'Specialization',
      render: (member: TeamMemberData) => (
        <div className="flex flex-wrap gap-1">
          {member.specializations && member.specializations.length > 0 ? (
            <>
              {member.specializations.slice(0, 2).map((spec) => (
                <span key={spec} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                  {spec}
                </span>
              ))}
              {member.specializations.length > 2 && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                  +{member.specializations.length - 2}
                </span>
              )}
            </>
          ) : (
            <span className="text-gray-400 text-sm">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'salary',
      header: 'Salary',
      sortable: true,
      render: (member: TeamMemberData) => formatCurrency(member.salary || 0),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (member: TeamMemberData) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(member.status)}`}>
          {member.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (member: TeamMemberData) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(member);
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Edit className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedMember(member);
              setShowDeleteModal(true);
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  const handleEdit = (member: TeamMemberData) => {
    setSelectedMember(member);
    setFormData({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone || '',
      role: member.role,
      specializations: member.specializations || [],
      experience: member.experience || 0,
      certifications: member.certifications?.join(', ') || '',
      availableDays: member.availability?.days || [],
      startTime: member.availability?.startTime || '06:00',
      endTime: member.availability?.endTime || '14:00',
      salary: member.salary || 0,
      status: member.status,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    const memberInput = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      specializations: formData.specializations,
      experience: formData.experience,
      certifications: formData.certifications.split(',').map((c) => c.trim()).filter(Boolean),
      availability: {
        days: formData.availableDays,
        startTime: formData.startTime,
        endTime: formData.endTime,
      },
      salary: formData.salary,
      status: formData.status,
      joiningDate: new Date().toISOString().split('T')[0],
    };

    try {
      if (selectedMember) {
        await updateTeamMember({
          variables: { id: selectedMember.id, input: memberInput },
        });
      } else {
        await createTeamMember({
          variables: { input: memberInput },
        });
      }
    } catch (err) {
      console.error('Error submitting:', err);
    }
  };

  const handleDelete = async () => {
    if (selectedMember) {
      try {
        await deleteTeamMemberMutation({
          variables: { id: selectedMember.id },
        });
      } catch (err) {
        console.error('Error deleting:', err);
      }
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setSelectedMember(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'trainer',
      specializations: [],
      experience: 0,
      certifications: '',
      availableDays: [],
      startTime: '06:00',
      endTime: '14:00',
      salary: 0,
      status: 'active',
    });
  };

  const handleDownload = () => {
    const exportData = teamMembers.map((t) => ({
      firstName: t.firstName,
      lastName: t.lastName,
      email: t.email,
      phone: t.phone || '',
      role: formatRole(t.role),
      specializations: t.specializations?.join('; ') || '',
      experience: t.experience || 0,
      salary: t.salary || 0,
      status: t.status,
    }));
    downloadAsCSV(exportData, 'team_export', [
      { key: 'firstName', header: 'First Name' },
      { key: 'lastName', header: 'Last Name' },
      { key: 'email', header: 'Email' },
      { key: 'phone', header: 'Phone' },
      { key: 'role', header: 'Role' },
      { key: 'specializations', header: 'Specialization' },
      { key: 'experience', header: 'Experience (Years)' },
      { key: 'salary', header: 'Salary' },
      { key: 'status', header: 'Status' },
    ]);
  };

  const toggleSpecialization = (spec: string) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter((s) => s !== spec)
        : [...prev.specializations, spec],
    }));
  };

  const toggleDay = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day],
    }));
  };

  const handleRowClick = (member: TeamMemberData) => {
    navigate(`/dashboard/team/${member.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600">Loading team members...</span>
      </div>
    );
  }

  if (error) {
    const errorMessage = error.message || 'Unknown error';
    const isAuthError = errorMessage.includes('authenticated') || errorMessage.includes('Not authenticated');
    
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {isAuthError 
              ? 'Please log in to view team members' 
              : `Error loading team: ${errorMessage}`}
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

  // Empty state - no team members yet
  if (teamMembers.length === 0) {
    return (
      <div>
        <Header
          title="Team"
          subtitle="Manage your gym team members and their schedules"
        />
        <div className="p-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            {/* Animated Team Icon */}
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-purple-100 rounded-full flex items-center justify-center">
                <div className="relative">
                  {/* Center person */}
                  <Users className="w-12 h-12 text-purple-500 animate-pulse" />
                  {/* Orbiting icons */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 animate-bounce" style={{ animationDelay: '0s' }}>
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <UserCheck className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 animate-bounce" style={{ animationDelay: '0.2s' }}>
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Award className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="absolute top-1/2 -left-8 -translate-y-1/2 animate-bounce" style={{ animationDelay: '0.4s' }}>
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Clock className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="absolute top-1/2 -right-8 -translate-y-1/2 animate-bounce" style={{ animationDelay: '0.6s' }}>
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <Plus className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              {/* Pulsing ring effect */}
              <div className="absolute inset-0 w-32 h-32 bg-purple-200 rounded-full animate-ping opacity-20"></div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Build Your Dream Team
            </h2>
            <p className="text-gray-500 text-center max-w-md mb-8">
              Your gym's success starts with a great team! Add trainers, receptionists, cleaning staff, and other team members to manage your operations efficiently.
            </p>
            
            <Button
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setShowModal(true)}
              className="animate-pulse"
            >
              Add Your First Team Member
            </Button>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl">
              <div className="text-center p-4 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <UserCheck className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Trainers</h3>
                <p className="text-sm text-gray-500">Expert fitness coaches for your members</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Receptionists</h3>
                <p className="text-sm text-gray-500">Front desk staff for member services</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl hover:bg-green-50 transition-colors">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Managers</h3>
                <p className="text-sm text-gray-500">Oversee daily gym operations</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl hover:bg-yellow-50 transition-colors">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Support Staff</h3>
                <p className="text-sm text-gray-500">Cleaning, maintenance & security</p>
              </div>
            </div>
          </div>
        </div>

        <Modal
          isOpen={showModal}
          onClose={resetForm}
          title="Add New Team Member"
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <Select
              label="Role"
              options={roleOptions}
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as TeamRole })}
              required
            />

            {formData.role === 'trainer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization
                </label>
                <div className="flex flex-wrap gap-2">
                  {specializationOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleSpecialization(opt.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        formData.specializations.includes(opt.value)
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Experience (Years)"
                type="number"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: Number(e.target.value) })}
              />
              <Input
                label="Salary (Monthly)"
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
              />
            </div>

            {formData.role === 'trainer' && (
              <Input
                label="Certifications (comma separated)"
                value={formData.certifications}
                onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                placeholder="ACE Certified, NASM, CrossFit Level 2"
              />
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Days
              </label>
              <div className="flex flex-wrap gap-2">
                {dayOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleDay(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      formData.availableDays.includes(opt.value)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Time"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
              <Input
                label="End Time"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>

            <Select
              label="Status"
              options={[
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
              ]}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                Add Team Member
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Team"
        subtitle="Manage your gym team members and their schedules"
      />
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Widget
            title="Total Team"
            value={teamMembers.length}
            icon={Users}
            color="purple"
          />
          <Widget
            title="Trainers"
            value={trainersCount}
            icon={UserCheck}
            color="blue"
          />
          <Widget
            title="Active Members"
            value={activeMembers}
            icon={Award}
            color="green"
          />
          <Widget
            title="Monthly Salary"
            value={formatCurrency(totalSalary)}
            icon={Clock}
            color="yellow"
          />
        </div>

        <div className="flex justify-end mb-6">
          <Button
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowModal(true)}
          >
            Add Team Member
          </Button>
        </div>

        <DataTable
          data={teamMembers}
          columns={columns}
          searchPlaceholder="Search team members..."
          onDownload={handleDownload}
          onRowClick={handleRowClick}
          emptyMessage="No team members found"
        />

        <Modal
          isOpen={showModal}
          onClose={resetForm}
          title={selectedMember ? 'Edit Team Member' : 'Add New Team Member'}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <Select
              label="Role"
              options={roleOptions}
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as TeamRole })}
              required
            />

            {formData.role === 'trainer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization
                </label>
                <div className="flex flex-wrap gap-2">
                  {specializationOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleSpecialization(opt.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        formData.specializations.includes(opt.value)
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Experience (Years)"
                type="number"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: Number(e.target.value) })}
              />
              <Input
                label="Salary (Monthly)"
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
              />
            </div>

            {formData.role === 'trainer' && (
              <Input
                label="Certifications (comma separated)"
                value={formData.certifications}
                onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                placeholder="ACE Certified, NASM, CrossFit Level 2"
              />
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Days
              </label>
              <div className="flex flex-wrap gap-2">
                {dayOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleDay(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      formData.availableDays.includes(opt.value)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Time"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
              <Input
                label="End Time"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>

            <Select
              label="Status"
              options={[
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
              ]}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {selectedMember ? 'Update' : 'Add'} Team Member
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Team Member"
          size="sm"
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete {selectedMember?.firstName} {selectedMember?.lastName}?
            </h3>
            <p className="text-gray-500 mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
