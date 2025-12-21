import { useState } from 'react';
import {
  PhoneCall,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Header } from '../../../components/layout';
import { Widget, DataTable, Button, Modal, Input, Select, Textarea } from '../../../components/ui';
import { useFollowUpStore } from '../../../stores/followUpStore';
import { useMemberStore } from '../../../stores/memberStore';
import { formatDate, getStatusColor, getPriorityColor, downloadAsCSV } from '../../../lib/utils';
import type { FollowUp } from '../../../types';

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
  const { followUps, addFollowUp, updateFollowUp, deleteFollowUp } = useFollowUpStore();
  const { members } = useMemberStore();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUp | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    memberId: '',
    type: 'general' as FollowUp['type'],
    status: 'pending' as FollowUp['status'],
    priority: 'medium' as FollowUp['priority'],
    scheduledDate: new Date().toISOString().split('T')[0],
    notes: '',
    assignedTo: 'Admin',
  });

  const pendingFollowUps = followUps.filter((f) => f.status === 'pending').length;
  const completedFollowUps = followUps.filter((f) => f.status === 'completed').length;
  const highPriorityFollowUps = followUps.filter((f) => f.priority === 'high' && f.status === 'pending').length;

  const filteredFollowUps = statusFilter === 'all'
    ? followUps
    : followUps.filter((f) => f.status === statusFilter);

  const memberOptions = members.map((m) => ({
    label: `${m.firstName} ${m.lastName}`,
    value: m.id,
  }));

  const columns = [
    {
      key: 'memberName',
      header: 'Member',
      sortable: true,
      render: (followUp: FollowUp) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <PhoneCall className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{followUp.memberName}</p>
            <p className="text-sm text-gray-500 capitalize">{followUp.type}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'scheduledDate',
      header: 'Scheduled Date',
      sortable: true,
      render: (followUp: FollowUp) => formatDate(followUp.scheduledDate),
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: (followUp: FollowUp) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getPriorityColor(followUp.priority)}`}>
          {followUp.priority}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (followUp: FollowUp) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(followUp.status)}`}>
          {followUp.status}
        </span>
      ),
    },
    {
      key: 'notes',
      header: 'Notes',
      render: (followUp: FollowUp) => (
        <p className="text-sm text-gray-600 truncate max-w-xs">{followUp.notes}</p>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (followUp: FollowUp) => (
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

  const handleEdit = (followUp: FollowUp) => {
    setSelectedFollowUp(followUp);
    setFormData({
      memberId: followUp.memberId,
      type: followUp.type,
      status: followUp.status,
      priority: followUp.priority,
      scheduledDate: followUp.scheduledDate,
      notes: followUp.notes,
      assignedTo: followUp.assignedTo || 'Admin',
    });
    setShowModal(true);
  };

  const handleMarkComplete = (followUp: FollowUp) => {
    updateFollowUp(followUp.id, {
      status: 'completed',
      completedDate: new Date().toISOString().split('T')[0],
    });
  };

  const handleSubmit = () => {
    const member = members.find((m) => m.id === formData.memberId);
    const followUpData = {
      memberId: formData.memberId,
      memberName: member ? `${member.firstName} ${member.lastName}` : 'Unknown',
      type: formData.type,
      status: formData.status,
      priority: formData.priority,
      scheduledDate: formData.scheduledDate,
      notes: formData.notes,
      assignedTo: formData.assignedTo,
      completedDate: formData.status === 'completed' ? new Date().toISOString().split('T')[0] : undefined,
    };

    if (selectedFollowUp) {
      updateFollowUp(selectedFollowUp.id, followUpData);
    } else {
      addFollowUp(followUpData);
    }

    resetForm();
  };

  const handleDelete = () => {
    if (selectedFollowUp) {
      deleteFollowUp(selectedFollowUp.id);
      setShowDeleteModal(false);
      setSelectedFollowUp(null);
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setSelectedFollowUp(null);
    setFormData({
      memberId: '',
      type: 'general',
      status: 'pending',
      priority: 'medium',
      scheduledDate: new Date().toISOString().split('T')[0],
      notes: '',
      assignedTo: 'Admin',
    });
  };

  const handleDownload = () => {
    const exportData = followUps.map((f) => ({
      memberName: f.memberName,
      type: f.type,
      priority: f.priority,
      status: f.status,
      scheduledDate: f.scheduledDate,
      notes: f.notes,
    }));
    downloadAsCSV(exportData, 'followups_export', [
      { key: 'memberName', header: 'Member' },
      { key: 'type', header: 'Type' },
      { key: 'priority', header: 'Priority' },
      { key: 'status', header: 'Status' },
      { key: 'scheduledDate', header: 'Scheduled Date' },
      { key: 'notes', header: 'Notes' },
    ]);
  };

  const filterComponent = (
    <div className="flex gap-4">
      <Select
        label="Status"
        options={[
          { label: 'All Status', value: 'all' },
          ...statusOptions,
        ]}
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      />
    </div>
  );

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

        <div className="flex justify-end mb-6">
          <Button
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowModal(true)}
          >
            Add Follow-up
          </Button>
        </div>

        <DataTable
          data={filteredFollowUps}
          columns={columns}
          searchPlaceholder="Search follow-ups..."
          onDownload={handleDownload}
          filterComponent={filterComponent}
          emptyMessage="No follow-ups found"
        />

        <Modal
          isOpen={showModal}
          onClose={resetForm}
          title={selectedFollowUp ? 'Edit Follow-up' : 'Add New Follow-up'}
          size="md"
        >
          <div className="space-y-4">
            <Select
              label="Member"
              options={memberOptions}
              value={formData.memberId}
              onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
              placeholder="Select a member"
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Type"
                options={typeOptions}
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as FollowUp['type'] })}
              />
              <Select
                label="Priority"
                options={priorityOptions}
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as FollowUp['priority'] })}
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
                onChange={(e) => setFormData({ ...formData, status: e.target.value as FollowUp['status'] })}
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
                {selectedFollowUp ? 'Update' : 'Add'} Follow-up
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
