import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  User,
  FileText,
  Loader2,
  Trophy,
  Presentation,
  Tent,
  Sparkles,
} from 'lucide-react';
import { Header } from '../../../components/layout';
import { Button, Modal, Input, Select, Textarea } from '../../../components/ui';
import { formatDate, formatCurrency, getStatusColor } from '../../../lib/utils';
import { GET_EVENT, UPDATE_EVENT, DELETE_EVENT } from '../../../graphql/events';
import { GET_TEAM_MEMBERS } from '../../../graphql/team';

interface EventData {
  id: string;
  title: string;
  description?: string;
  type: string;
  startDate: string;
  endDate: string;
  location?: string;
  maxParticipants: number;
  currentParticipants: number;
  fee: number;
  status: string;
  trainer?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  image?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const typeOptions = [
  { label: 'Workshop', value: 'workshop' },
  { label: 'Competition', value: 'competition' },
  { label: 'Seminar', value: 'seminar' },
  { label: 'Camp', value: 'camp' },
  { label: 'Other', value: 'other' },
];

const statusOptions = [
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Ongoing', value: 'ongoing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'workshop':
      return <Presentation className="w-5 h-5" />;
    case 'competition':
      return <Trophy className="w-5 h-5" />;
    case 'camp':
      return <Tent className="w-5 h-5" />;
    case 'seminar':
      return <Sparkles className="w-5 h-5" />;
    default:
      return <Calendar className="w-5 h-5" />;
  }
};

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    'workshop': 'bg-purple-100 text-purple-800',
    'competition': 'bg-yellow-100 text-yellow-800',
    'seminar': 'bg-pink-100 text-pink-800',
    'camp': 'bg-green-100 text-green-800',
    'other': 'bg-gray-100 text-gray-800',
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
};

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_EVENT, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'network-only',
  });

  const { data: trainersData } = useQuery(GET_TEAM_MEMBERS, {
    variables: { pagination: { page: 1, limit: 100 } },
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'workshop',
    startDate: '',
    endDate: '',
    location: '',
    maxParticipants: 20,
    currentParticipants: 0,
    fee: 0,
    status: 'upcoming',
    trainerId: '',
    notes: '',
  });

  const [updateEventMutation] = useMutation(UPDATE_EVENT, {
    onCompleted: () => {
      refetch();
      setShowEditModal(false);
    },
    onError: (err) => {
      console.error('Error updating event:', err);
      alert(err.message);
    },
  });

  const [deleteEventMutation] = useMutation(DELETE_EVENT, {
    onCompleted: () => {
      navigate('/dashboard/events');
    },
    onError: (err) => {
      console.error('Error deleting event:', err);
      alert(err.message);
    },
  });

  const event: EventData | null = data?.event || null;
  const trainers = trainersData?.trainers?.trainers || [];

  const trainerOptions = [
    { label: 'No Trainer', value: '' },
    ...trainers.map((t: { id: string; firstName: string; lastName: string }) => ({
      label: `${t.firstName} ${t.lastName}`,
      value: t.id,
    })),
  ];

  const handleEdit = () => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || '',
        type: event.type,
        startDate: event.startDate ? event.startDate.split('T')[0] : '',
        endDate: event.endDate ? event.endDate.split('T')[0] : '',
        location: event.location || '',
        maxParticipants: event.maxParticipants,
        currentParticipants: event.currentParticipants,
        fee: event.fee,
        status: event.status,
        trainerId: event.trainer?.id || '',
        notes: event.notes || '',
      });
      setShowEditModal(true);
    }
  };

  const handleUpdate = async () => {
    if (!event) return;

    const input = {
      title: formData.title,
      description: formData.description || null,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      location: formData.location || null,
      maxParticipants: formData.maxParticipants,
      currentParticipants: formData.currentParticipants,
      fee: formData.fee,
      status: formData.status,
      trainer: formData.trainerId || null,
      notes: formData.notes || null,
    };

    await updateEventMutation({
      variables: { id: event.id, input },
    });
  };

  const handleDelete = async () => {
    if (!event) return;
    await deleteEventMutation({ variables: { id: event.id } });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600">Loading event...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading event: {error.message}</p>
          <Button onClick={() => navigate('/dashboard/events')}>Back to Events</Button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Event not found</p>
          <Button onClick={() => navigate('/dashboard/events')}>Back to Events</Button>
        </div>
      </div>
    );
  }

  const participantPercentage = event.maxParticipants > 0 
    ? Math.round((event.currentParticipants / event.maxParticipants) * 100) 
    : 0;

  return (
    <div>
      <Header
        title="Event Details"
        subtitle="View and manage event information"
      />
      <div className="p-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard/events')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Card */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${getTypeColor(event.type)}`}>
                  {getTypeIcon(event.type)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getTypeColor(event.type)}`}>
                      {event.type}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  leftIcon={<Edit className="w-4 h-4" />}
                  onClick={handleEdit}
                >
                  Edit
                </Button>
                <Button
                  variant="secondary"
                  leftIcon={<Trash2 className="w-4 h-4" />}
                  onClick={() => setShowDeleteModal(true)}
                  className="text-red-600 hover:bg-red-50"
                >
                  Delete
                </Button>
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                <p className="text-gray-700">{event.description}</p>
              </div>
            )}

            {/* Event Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Start Date</span>
                </div>
                <p className="font-semibold text-gray-900">{formatDate(event.startDate)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">End Date</span>
                </div>
                <p className="font-semibold text-gray-900">{formatDate(event.endDate)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">Location</span>
                </div>
                <p className="font-semibold text-gray-900">{event.location || 'Not specified'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">Fee</span>
                </div>
                <p className="font-semibold text-gray-900">
                  {event.fee > 0 ? formatCurrency(event.fee) : 'Free'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <User className="w-4 h-4" />
                  <span className="text-sm">Trainer</span>
                </div>
                <p className="font-semibold text-gray-900">
                  {event.trainer ? `${event.trainer.firstName} ${event.trainer.lastName}` : 'Not assigned'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">Created</span>
                </div>
                <p className="font-semibold text-gray-900">{formatDate(event.createdAt)}</p>
              </div>
            </div>

            {/* Notes */}
            {event.notes && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-yellow-800 mb-2">Notes</h3>
                <p className="text-yellow-700">{event.notes}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Participants Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Participants</h3>
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#e5e7eb"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke={participantPercentage >= 80 ? '#ef4444' : participantPercentage >= 50 ? '#f59e0b' : '#22c55e'}
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${participantPercentage * 3.52} 352`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">{participantPercentage}%</span>
                    <span className="text-xs text-gray-500">Filled</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">
                  {event.currentParticipants} / {event.maxParticipants}
                </p>
                <p className="text-sm text-gray-500">Registered Participants</p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Available Spots</span>
                  <span className="font-medium text-gray-900">
                    {event.maxParticipants - event.currentParticipants}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-medium text-gray-900">
                    {Math.ceil((new Date(event.endDate).getTime() - new Date(event.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Revenue Potential</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(event.fee * event.maxParticipants)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Current Revenue</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(event.fee * event.currentParticipants)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Event"
          size="lg"
        >
          <div className="space-y-4">
            <Input
              label="Event Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Type"
                options={typeOptions}
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              />
              <Select
                label="Status"
                options={statusOptions}
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
              <Input
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
            <Input
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Max Participants"
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: Number(e.target.value) })}
              />
              <Input
                label="Current Participants"
                type="number"
                value={formData.currentParticipants}
                onChange={(e) => setFormData({ ...formData, currentParticipants: Number(e.target.value) })}
              />
              <Input
                label="Fee"
                type="number"
                value={formData.fee}
                onChange={(e) => setFormData({ ...formData, fee: Number(e.target.value) })}
              />
            </div>
            <Select
              label="Trainer"
              options={trainerOptions}
              value={formData.trainerId}
              onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })}
            />
            <Textarea
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate}>
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Event"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete this event? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Event
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
