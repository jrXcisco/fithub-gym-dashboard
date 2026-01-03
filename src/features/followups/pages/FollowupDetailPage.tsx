import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Clock,
  User,
    CheckCircle,
  PhoneCall,
  FileText,
  Loader2,
} from 'lucide-react';
import { Header } from '../../../components/layout';
import { Button, Modal, Input, Select, Textarea } from '../../../components/ui';
import { formatDate, getStatusColor, getPriorityColor } from '../../../lib/utils';
import { GET_FOLLOWUP, UPDATE_FOLLOWUP, DELETE_FOLLOWUP, COMPLETE_FOLLOWUP } from '../../../graphql/followups';
import { GET_MEMBERS } from '../../../graphql/members';
import { GET_TEAM_MEMBERS } from '../../../graphql/team';

interface FollowupData {
  id: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  priority: string;
  scheduledDate: string;
  completedDate?: string;
  notes?: string;
  outcome?: string;
  member?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  trainer?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

const typeOptions = [
  { label: 'Renewal', value: 'renewal' },
  { label: 'Feedback', value: 'feedback' },
  { label: 'Complaint', value: 'complaint' },
  { label: 'Inquiry', value: 'inquiry' },
  { label: 'General', value: 'general' },
];

const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in-progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    'renewal': 'bg-blue-100 text-blue-800',
    'feedback': 'bg-green-100 text-green-800',
    'complaint': 'bg-red-100 text-red-800',
    'inquiry': 'bg-purple-100 text-purple-800',
    'general': 'bg-gray-100 text-gray-800',
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
};

export function FollowupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [outcome, setOutcome] = useState('');

  const { data, loading, error, refetch } = useQuery(GET_FOLLOWUP, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'network-only',
  });

  const { data: membersData } = useQuery(GET_MEMBERS, {
    variables: { pagination: { page: 1, limit: 100 } },
  });

  const { data: trainersData } = useQuery(GET_TEAM_MEMBERS, {
    variables: { pagination: { page: 1, limit: 100 } },
  });

  const [updateFollowup] = useMutation(UPDATE_FOLLOWUP, {
    onCompleted: () => {
      refetch();
      setShowEditModal(false);
    },
    onError: (err) => {
      console.error('Error updating followup:', err);
      alert(err.message);
    },
  });

  const [deleteFollowupMutation] = useMutation(DELETE_FOLLOWUP, {
    onCompleted: () => {
      navigate('/dashboard/follow-ups');
    },
    onError: (err) => {
      console.error('Error deleting followup:', err);
      alert(err.message);
    },
  });

  const [completeFollowup] = useMutation(COMPLETE_FOLLOWUP, {
    onCompleted: () => {
      refetch();
      setShowCompleteModal(false);
      setOutcome('');
    },
    onError: (err) => {
      console.error('Error completing followup:', err);
      alert(err.message);
    },
  });

  const followup: FollowupData | null = data?.followup || null;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    memberId: '',
    trainerId: '',
    type: 'general',
    status: 'pending',
    priority: 'medium',
    scheduledDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const members = membersData?.members?.members || [];
  const trainers = trainersData?.trainers?.trainers || [];

  const memberOptions = members.map((m: any) => ({
    label: `${m.firstName} ${m.lastName}`,
    value: m.id,
  }));

  const trainerOptions = [
    { label: 'None', value: '' },
    ...trainers.map((t: any) => ({
      label: `${t.firstName} ${t.lastName}`,
      value: t.id,
    })),
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600">Loading follow-up details...</span>
      </div>
    );
  }

  if (error || !followup) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Follow-up Not Found</h2>
          <p className="text-gray-500 mb-4">
            {error ? error.message : "The follow-up you're looking for doesn't exist."}
          </p>
          <Button onClick={() => navigate('/dashboard/follow-ups')}>Back to Follow-ups</Button>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    setFormData({
      title: followup.title || '',
      description: followup.description || '',
      memberId: followup.member?.id || '',
      trainerId: followup.trainer?.id || '',
      type: followup.type || 'general',
      status: followup.status || 'pending',
      priority: followup.priority || 'medium',
      scheduledDate: followup.scheduledDate ? followup.scheduledDate.split('T')[0] : new Date().toISOString().split('T')[0],
      notes: followup.notes || '',
    });
    setShowEditModal(true);
  };

  const handleSubmit = async () => {
    try {
      await updateFollowup({
        variables: {
          id: followup.id,
          input: {
            title: formData.title,
            description: formData.description,
            member: formData.memberId,
            trainer: formData.trainerId || null,
            type: formData.type,
            status: formData.status,
            priority: formData.priority,
            scheduledDate: formData.scheduledDate,
            notes: formData.notes,
          },
        },
      });
    } catch (err) {
      console.error('Error updating:', err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteFollowupMutation({
        variables: { id: followup.id },
      });
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const handleComplete = async () => {
    try {
      await completeFollowup({
        variables: { id: followup.id, outcome },
      });
    } catch (err) {
      console.error('Error completing:', err);
    }
  };

  return (
    <div>
      <Header
        title="Follow-up Details"
        subtitle={followup.title}
      />
      <div className="p-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/dashboard/follow-ups')}
          >
            Back to Follow-ups
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                    <PhoneCall className="w-8 h-8 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {followup.title}
                    </h2>
                    <p className="text-gray-500">
                      {followup.member ? `${followup.member.firstName} ${followup.member.lastName}` : 'No member assigned'}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getTypeColor(followup.type)}`}>
                        {followup.type}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getPriorityColor(followup.priority)}`}>
                        {followup.priority} Priority
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(followup.status)}`}>
                        {followup.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {followup.status === 'pending' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<CheckCircle className="w-4 h-4" />}
                      onClick={() => setShowCompleteModal(true)}
                    >
                      Complete
                    </Button>
                  )}
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
                    <Calendar className="w-4 h-4" /> Schedule
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Scheduled Date</p>
                      <p className="font-medium">{formatDate(followup.scheduledDate)}</p>
                    </div>
                    {followup.completedDate && (
                      <div>
                        <p className="text-sm text-gray-500">Completed Date</p>
                        <p className="font-medium text-green-600">{formatDate(followup.completedDate)}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <User className="w-4 h-4" /> Assignment
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Member</p>
                      <p className="font-medium">
                        {followup.member ? `${followup.member.firstName} ${followup.member.lastName}` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Assigned Trainer</p>
                      <p className="font-medium">
                        {followup.trainer ? `${followup.trainer.firstName} ${followup.trainer.lastName}` : 'Not assigned'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {followup.description && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                    <FileText className="w-4 h-4" /> Description
                  </h3>
                  <p className="text-gray-600">{followup.description}</p>
                </div>
              )}

              {followup.notes && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                    <FileText className="w-4 h-4" /> Notes
                  </h3>
                  <p className="text-gray-600">{followup.notes}</p>
                </div>
              )}

              {followup.outcome && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                    <CheckCircle className="w-4 h-4 text-green-600" /> Outcome
                  </h3>
                  <p className="text-gray-600">{followup.outcome}</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4" /> Timeline
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Created</p>
                    <p className="text-sm text-gray-500">{formatDate(followup.createdAt)}</p>
                    {followup.createdBy && (
                      <p className="text-xs text-gray-400">
                        by {followup.createdBy.firstName} {followup.createdBy.lastName}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Scheduled</p>
                    <p className="text-sm text-gray-500">{formatDate(followup.scheduledDate)}</p>
                  </div>
                </div>
                {followup.completedDate && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Completed</p>
                      <p className="text-sm text-gray-500">{formatDate(followup.completedDate)}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Updated</p>
                    <p className="text-sm text-gray-500">{formatDate(followup.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {followup.member && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <User className="w-4 h-4" /> Member Info
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{followup.member.firstName} {followup.member.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-blue-600">{followup.member.email}</p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => navigate(`/dashboard/members/${followup.member?.id}`)}
                  >
                    View Member Profile
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Follow-up"
          size="lg"
        >
          <div className="space-y-4">
            <Input
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Member"
                options={memberOptions}
                value={formData.memberId}
                onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
              />
              <Select
                label="Assigned Trainer"
                options={trainerOptions}
                value={formData.trainerId}
                onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Select
                label="Type"
                options={typeOptions}
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              />
              <Select
                label="Priority"
                options={priorityOptions}
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              />
              <Select
                label="Status"
                options={statusOptions}
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              />
            </div>
            <Input
              label="Scheduled Date"
              type="date"
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
            />
            <Textarea
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                Update Follow-up
              </Button>
            </div>
          </div>
        </Modal>

        {/* Complete Modal */}
        <Modal
          isOpen={showCompleteModal}
          onClose={() => setShowCompleteModal(false)}
          title="Complete Follow-up"
          size="md"
        >
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-gray-600">
                Mark this follow-up as completed. You can optionally add an outcome note.
              </p>
            </div>
            <Textarea
              label="Outcome (Optional)"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              rows={3}
              placeholder="Describe the outcome of this follow-up..."
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button variant="secondary" onClick={() => setShowCompleteModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleComplete}>
                Mark as Completed
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Follow-up"
          size="sm"
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete this follow-up?
            </h3>
            <p className="text-gray-500 mb-6">
              This action cannot be undone. All data associated with this follow-up will be permanently removed.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Delete Follow-up
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
