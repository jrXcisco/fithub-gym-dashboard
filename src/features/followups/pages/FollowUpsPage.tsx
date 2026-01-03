import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import {
  PhoneCall,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Calendar,
  Bell,
  MessageSquare,
} from 'lucide-react';
import { Header } from '../../../components/layout';
import { Widget, DataTable, Button, Modal, Input, Select, Textarea, FilterMenu } from '../../../components/ui';
import type { FilterField } from '../../../components/ui';
import { FollowupSearchSuggestions } from '../../../components/ui/FollowupSearchSuggestions';
import { formatDate, getStatusColor, getPriorityColor, downloadAsCSV } from '../../../lib/utils';
import { GET_FOLLOWUPS, CREATE_FOLLOWUP, UPDATE_FOLLOWUP, DELETE_FOLLOWUP, COMPLETE_FOLLOWUP } from '../../../graphql/followups';
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
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

export function FollowUpsPage() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowupData | null>(null);
  
  // Filter state
  const [filters, setFilters] = useState<Record<string, string>>({
    type: 'all',
    priority: 'all',
    status: 'all',
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter fields configuration
  const filterFields: FilterField[] = [
    {
      key: 'type',
      label: 'Type',
      options: [
        { label: 'All Types', value: 'all' },
        { label: 'Renewal', value: 'renewal' },
        { label: 'Feedback', value: 'feedback' },
        { label: 'Complaint', value: 'complaint' },
        { label: 'Inquiry', value: 'inquiry' },
        { label: 'General', value: 'general' },
      ],
    },
    {
      key: 'priority',
      label: 'Priority',
      options: [
        { label: 'All Priorities', value: 'all' },
        { label: 'High', value: 'high' },
        { label: 'Medium', value: 'medium' },
        { label: 'Low', value: 'low' },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      options: [
        { label: 'All Status', value: 'all' },
        { label: 'Pending', value: 'pending' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
  ];

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

  const { data, loading, error, refetch } = useQuery(GET_FOLLOWUPS, {
    variables: {
      filter: {
        ...(filters.type !== 'all' ? { type: filters.type } : {}),
        ...(filters.priority !== 'all' ? { priority: filters.priority } : {}),
        ...(filters.status !== 'all' ? { status: filters.status } : {}),
        ...(searchTerm ? { search: searchTerm } : {}),
      },
      pagination: { page: currentPage, limit: pageSize },
    },
    fetchPolicy: 'network-only',
  });

  const { data: membersData } = useQuery(GET_MEMBERS, {
    variables: { pagination: { page: 1, limit: 100 } },
  });

  const { data: trainersData } = useQuery(GET_TEAM_MEMBERS, {
    variables: { pagination: { page: 1, limit: 100 } },
  });

  const [createFollowup] = useMutation(CREATE_FOLLOWUP, {
    onCompleted: () => {
      refetch();
      resetForm();
    },
    onError: (err) => {
      console.error('Error creating followup:', err);
      alert(err.message);
    },
  });

  const [updateFollowup] = useMutation(UPDATE_FOLLOWUP, {
    onCompleted: () => {
      refetch();
      resetForm();
    },
    onError: (err) => {
      console.error('Error updating followup:', err);
      alert(err.message);
    },
  });

  const [deleteFollowupMutation] = useMutation(DELETE_FOLLOWUP, {
    onCompleted: () => {
      refetch();
      setShowDeleteModal(false);
      setSelectedFollowUp(null);
    },
    onError: (err) => {
      console.error('Error deleting followup:', err);
      alert(err.message);
    },
  });

  const [completeFollowup] = useMutation(COMPLETE_FOLLOWUP, {
    onCompleted: () => {
      refetch();
    },
    onError: (err) => {
      console.error('Error completing followup:', err);
      alert(err.message);
    },
  });

  const followUps: FollowupData[] = data?.followups?.followups || [];
  const totalFollowUps = data?.followups?.total || 0;
  const members = membersData?.members?.members || [];
  const trainers = trainersData?.trainers?.trainers || [];

  // Use stats from server for widgets (all records, not just paginated)
  const stats = data?.followups?.stats;
  const pendingFollowUps = stats?.pending || 0;
  const completedFollowUps = stats?.completed || 0;
  const highPriorityFollowUps = stats?.highPriority || 0;

  // Pagination handlers
  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePageSizeChange = (size: number) => { setPageSize(size); setCurrentPage(1); };
  const handleSearchChange = (search: string) => { setSearchTerm(search); setCurrentPage(1); };
  const handleFilterChange = (newFilters: Record<string, string>) => { setFilters(newFilters); setCurrentPage(1); };

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

  const columns = [
    {
      key: 'title',
      header: 'Follow-up',
      sortable: true,
      render: (followUp: FollowupData) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <PhoneCall className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{followUp.title}</p>
            <p className="text-sm text-gray-500">
              {followUp.member ? `${followUp.member.firstName} ${followUp.member.lastName}` : 'No member'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (followUp: FollowupData) => (
        <span className="capitalize">{followUp.type}</span>
      ),
    },
    {
      key: 'scheduledDate',
      header: 'Scheduled Date',
      sortable: true,
      render: (followUp: FollowupData) => formatDate(followUp.scheduledDate),
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: (followUp: FollowupData) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getPriorityColor(followUp.priority)}`}>
          {followUp.priority}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (followUp: FollowupData) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(followUp.status)}`}>
          {followUp.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (followUp: FollowupData) => (
        <div className="flex gap-2">
          {followUp.status === 'pending' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMarkComplete(followUp);
              }}
              className="p-1 hover:bg-green-100 rounded"
              title="Mark Complete"
            >
              <CheckCircle className="w-4 h-4 text-green-600" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(followUp);
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Edit className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedFollowUp(followUp);
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

  const handleEdit = (followUp: FollowupData) => {
    setSelectedFollowUp(followUp);
    setFormData({
      title: followUp.title || '',
      description: followUp.description || '',
      memberId: followUp.member?.id || '',
      trainerId: followUp.trainer?.id || '',
      type: followUp.type || 'general',
      status: followUp.status || 'pending',
      priority: followUp.priority || 'medium',
      scheduledDate: followUp.scheduledDate ? followUp.scheduledDate.split('T')[0] : new Date().toISOString().split('T')[0],
      notes: followUp.notes || '',
    });
    setShowModal(true);
  };

  const handleMarkComplete = async (followUp: FollowupData) => {
    try {
      await completeFollowup({
        variables: { id: followUp.id },
      });
    } catch (err) {
      console.error('Error completing:', err);
    }
  };

  const handleSubmit = async () => {
    try {
      if (selectedFollowUp) {
        // Update uses FollowupUpdateInput which includes status
        const updateInput = {
          title: formData.title,
          description: formData.description,
          member: formData.memberId,
          trainer: formData.trainerId || null,
          type: formData.type,
          status: formData.status,
          priority: formData.priority,
          scheduledDate: formData.scheduledDate,
          notes: formData.notes,
        };
        await updateFollowup({
          variables: { id: selectedFollowUp.id, input: updateInput },
        });
      } else {
        // Create uses FollowupInput which doesn't include status
        const createInput = {
          title: formData.title,
          description: formData.description,
          member: formData.memberId,
          trainer: formData.trainerId || null,
          type: formData.type,
          priority: formData.priority,
          scheduledDate: formData.scheduledDate,
          notes: formData.notes,
        };
        await createFollowup({
          variables: { input: createInput },
        });
      }
    } catch (err) {
      console.error('Error submitting:', err);
    }
  };

  const handleDelete = async () => {
    if (selectedFollowUp) {
      try {
        await deleteFollowupMutation({
          variables: { id: selectedFollowUp.id },
        });
      } catch (err) {
        console.error('Error deleting:', err);
      }
    }
  };

  const handleRowClick = (followUp: FollowupData) => {
    navigate(`/dashboard/follow-ups/${followUp.id}`);
  };

  const resetForm = () => {
    setShowModal(false);
    setSelectedFollowUp(null);
    setFormData({
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
  };

  const handleDownload = () => {
    const exportData = followUps.map((f) => ({
      title: f.title,
      member: f.member ? `${f.member.firstName} ${f.member.lastName}` : '',
      type: f.type,
      priority: f.priority,
      status: f.status,
      scheduledDate: f.scheduledDate,
      notes: f.notes || '',
    }));
    downloadAsCSV(exportData, 'followups_export', [
      { key: 'title', header: 'Title' },
      { key: 'member', header: 'Member' },
      { key: 'type', header: 'Type' },
      { key: 'priority', header: 'Priority' },
      { key: 'status', header: 'Status' },
      { key: 'scheduledDate', header: 'Scheduled Date' },
      { key: 'notes', header: 'Notes' },
    ]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600">Loading follow-ups...</span>
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
              ? 'Please log in to view follow-ups' 
              : `Error loading follow-ups: ${errorMessage}`}
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

  // Check if any filters are applied
  const hasActiveFilters = Object.values(filters).some(v => v && v !== 'all') || searchTerm;
  
  // Check if this is truly empty (no follow-ups at all) vs filtered results empty
  const isTrulyEmpty = (stats?.total === 0 || stats?.total === undefined) && !hasActiveFilters;

  // Empty state - no follow-ups yet
  if (followUps.length === 0 && isTrulyEmpty) {
    return (
      <div>
        <Header
          title="Follow-ups"
          subtitle="Track and manage member follow-ups"
        />
        <div className="p-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            {/* Animated Follow-up Icon */}
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-orange-100 rounded-full flex items-center justify-center">
                <div className="relative">
                  {/* Center bell */}
                  <Bell className="w-12 h-12 text-orange-500 animate-pulse" />
                  {/* Notification dots */}
                  <div className="absolute -top-4 -right-4 animate-bounce" style={{ animationDelay: '0s' }}>
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -left-4 animate-bounce" style={{ animationDelay: '0.3s' }}>
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="absolute top-1/2 -right-8 -translate-y-1/2 animate-bounce" style={{ animationDelay: '0.6s' }}>
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Calendar className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              {/* Pulsing ring effect */}
              <div className="absolute inset-0 w-32 h-32 bg-orange-200 rounded-full animate-ping opacity-20"></div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Stay Connected with Members
            </h2>
            <p className="text-gray-500 text-center max-w-md mb-8">
              Create follow-ups to track renewals, gather feedback, handle complaints, and keep your members engaged. Never miss an important conversation!
            </p>
            
            <Button
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setShowModal(true)}
              className="animate-pulse"
            >
              Create Your First Follow-up
            </Button>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl">
              <div className="text-center p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Renewals</h3>
                <p className="text-sm text-gray-500">Track membership renewal reminders</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl hover:bg-green-50 transition-colors">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Feedback</h3>
                <p className="text-sm text-gray-500">Collect valuable member feedback</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl hover:bg-red-50 transition-colors">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Complaints</h3>
                <p className="text-sm text-gray-500">Address and resolve issues quickly</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <PhoneCall className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Inquiries</h3>
                <p className="text-sm text-gray-500">Follow up on member questions</p>
              </div>
            </div>
          </div>
        </div>

        <Modal
          isOpen={showModal}
          onClose={resetForm}
          title="Create New Follow-up"
          size="md"
        >
          <div className="space-y-4">
            <Input
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Membership Renewal Call"
              required
            />
            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              placeholder="Brief description of this follow-up..."
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Member"
                options={memberOptions}
                value={formData.memberId}
                onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                placeholder="Select a member"
              />
              <Select
                label="Assign Trainer"
                options={trainerOptions}
                value={formData.trainerId}
                onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Scheduled Date"
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              />
              <Select
                label="Status"
                options={statusOptions}
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              />
            </div>
            <Textarea
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Add notes about this follow-up..."
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                Create Follow-up
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
        title="Follow-ups"
        subtitle="Track and manage member follow-ups"
      />
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Widget
            title="Pending Follow-ups"
            value={pendingFollowUps}
            icon={Clock}
            color="yellow"
          />
          <Widget
            title="Completed"
            value={completedFollowUps}
            icon={CheckCircle}
            color="green"
          />
          <Widget
            title="High Priority"
            value={highPriorityFollowUps}
            icon={AlertCircle}
            color="red"
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <FollowupSearchSuggestions
            placeholder="Search by member name..."
            onSelect={(followup) => navigate(`/dashboard/followups/${followup.id}`)}
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
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setShowModal(true)}
            >
              Add Follow-up
            </Button>
          </div>
        </div>

        <DataTable
          data={followUps}
          columns={columns}
          onDownload={handleDownload}
          onRowClick={handleRowClick}
          emptyMessage="No follow-ups found"
          hideSearch={true}
          serverSidePagination={true}
          totalItems={totalFollowUps}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSearchChange={handleSearchChange}
          pageSize={pageSize}
          pageSizeOptions={[10, 25, 50, 100]}
        />

        <Modal
          isOpen={showModal}
          onClose={resetForm}
          title={selectedFollowUp ? 'Edit Follow-up' : 'Add New Follow-up'}
          size="md"
        >
          <div className="space-y-4">
            <Input
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Membership Renewal Call"
              required
            />
            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              placeholder="Brief description of this follow-up..."
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Member"
                options={memberOptions}
                value={formData.memberId}
                onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                placeholder="Select a member"
              />
              <Select
                label="Assign Trainer"
                options={trainerOptions}
                value={formData.trainerId}
                onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Scheduled Date"
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              />
              <Select
                label="Status"
                options={statusOptions}
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              />
            </div>
            <Textarea
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Add notes about this follow-up..."
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {selectedFollowUp ? 'Update' : 'Create'} Follow-up
              </Button>
            </div>
          </div>
        </Modal>

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
