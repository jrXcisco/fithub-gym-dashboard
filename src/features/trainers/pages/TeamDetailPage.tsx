import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Clock,
  Award,
  Briefcase,
  DollarSign,
  Loader2,
} from 'lucide-react';
import { Header } from '../../../components/layout';
import { Button, Modal, Input, Select } from '../../../components/ui';
import { formatDate, formatCurrency, getStatusColor } from '../../../lib/utils';
import { GET_TEAM_MEMBER, UPDATE_TEAM_MEMBER, DELETE_TEAM_MEMBER } from '../../../graphql/team';
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

export function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_TEAM_MEMBER, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'network-only',
  });

  const [updateTeamMember] = useMutation(UPDATE_TEAM_MEMBER, {
    onCompleted: () => {
      refetch();
      setShowEditModal(false);
    },
    onError: (err) => {
      console.error('Error updating team member:', err);
      alert(err.message);
    },
  });

  const [deleteTeamMemberMutation] = useMutation(DELETE_TEAM_MEMBER, {
    onCompleted: () => {
      navigate('/dashboard/team');
    },
    onError: (err) => {
      console.error('Error deleting team member:', err);
      alert(err.message);
    },
  });

  const member: TeamMemberData | null = data?.trainer || null;

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600">Loading team member details...</span>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Team Member Not Found</h2>
          <p className="text-gray-500 mb-4">
            {error ? error.message : "The team member you're looking for doesn't exist."}
          </p>
          <Button onClick={() => navigate('/dashboard/team')}>Back to Team</Button>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
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
    setShowEditModal(true);
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
    };

    try {
      await updateTeamMember({
        variables: { id: member.id, input: memberInput },
      });
    } catch (err) {
      console.error('Error updating:', err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTeamMemberMutation({
        variables: { id: member.id },
      });
    } catch (err) {
      console.error('Error deleting:', err);
    }
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

  return (
    <div>
      <Header
        title="Team Member Details"
        subtitle={`${member.firstName} ${member.lastName}`}
      />
      <div className="p-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/dashboard/team')}
          >
            Back to Team
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-xl">
                      {member.firstName[0]}{member.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {member.firstName} {member.lastName}
                    </h2>
                    <p className="text-gray-500">{member.email}</p>
                    <div className="flex gap-2 mt-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                        {formatRole(member.role)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(member.status)}`}>
                        {member.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<Edit className="w-4 h-4" />}
                    onClick={handleEdit}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    leftIcon={<Trash2 className="w-4 h-4" />}
                    onClick={() => setShowDeleteModal(true)}
                  >
                    Delete
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" /> Contact Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{member.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{member.email}</span>
                    </div>
                    {member.joiningDate && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Joined: {formatDate(member.joiningDate)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Compensation
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Monthly Salary</p>
                      <p className="font-medium text-lg text-green-600">{formatCurrency(member.salary || 0)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Experience</p>
                      <p className="font-medium">{member.experience || 0} years</p>
                    </div>
                  </div>
                </div>
              </div>

              {member.role === 'trainer' && member.specializations && member.specializations.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                    <Award className="w-4 h-4" /> Specialization
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {member.specializations.map((spec) => (
                      <span key={spec} className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {member.role === 'trainer' && member.certifications && member.certifications.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                    <Award className="w-4 h-4" /> Certifications
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {member.certifications.map((cert) => (
                      <span key={cert} className="px-3 py-1.5 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4" /> Availability
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Working Days</p>
                  <div className="flex flex-wrap gap-2">
                    {member.availability?.days && member.availability.days.length > 0 ? (
                      member.availability.days.map((day) => (
                        <span key={day} className="px-2 py-1 bg-primary-100 text-primary-800 rounded text-xs font-medium">
                          {day}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">Not specified</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Working Hours</p>
                  <p className="font-medium">
                    {member.availability?.startTime || '09:00'} - {member.availability?.endTime || '18:00'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Team Member"
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
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                Update Team Member
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
              Delete {member.firstName} {member.lastName}?
            </h3>
            <p className="text-gray-500 mb-6">
              This action cannot be undone. All data associated with this team member will be permanently removed.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Delete Team Member
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
