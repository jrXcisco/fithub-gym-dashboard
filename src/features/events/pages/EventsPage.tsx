import { useState } from 'react';
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Users,
  MapPin,
  Clock,
} from 'lucide-react';
import { Header } from '../../../components/layout';
import { Widget, DataTable, Button, Modal, Input, Select, Textarea } from '../../../components/ui';
import { useEventStore } from '../../../stores/eventStore';
import { useTrainerStore } from '../../../stores/trainerStore';
import { formatDate, formatCurrency, getStatusColor, downloadAsCSV } from '../../../lib/utils';
import type { Event } from '../../../types';

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

export function EventsPage() {
  const { events, addEvent, updateEvent, deleteEvent } = useEventStore();
  const { trainers } = useTrainerStore();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'workshop' as Event['type'],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    location: '',
    maxParticipants: 20,
    currentParticipants: 0,
    fee: 0,
    status: 'upcoming' as Event['status'],
    trainerId: '',
  });

  const upcomingEvents = events.filter((e) => e.status === 'upcoming').length;
  const ongoingEvents = events.filter((e) => e.status === 'ongoing').length;
  const totalParticipants = events.reduce((sum, e) => sum + e.currentParticipants, 0);

  const filteredEvents = statusFilter === 'all'
    ? events
    : events.filter((e) => e.status === statusFilter);

  const trainerOptions = [
    { label: 'No Trainer', value: '' },
    ...trainers.map((t) => ({
      label: `${t.firstName} ${t.lastName}`,
      value: t.id,
    })),
  ];

  const columns = [
    {
      key: 'title',
      header: 'Event',
      sortable: true,
      render: (event: Event) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{event.title}</p>
            <p className="text-sm text-gray-500 capitalize">{event.type}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'startDate',
      header: 'Date',
      sortable: true,
      render: (event: Event) => (
        <div>
          <p className="font-medium">{formatDate(event.startDate)}</p>
          {event.startDate !== event.endDate && (
            <p className="text-sm text-gray-500">to {formatDate(event.endDate)}</p>
          )}
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (event: Event) => (
        <div className="flex items-center gap-1 text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{event.location}</span>
        </div>
      ),
    },
    {
      key: 'participants',
      header: 'Participants',
      render: (event: Event) => (
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4 text-gray-400" />
          <span>{event.currentParticipants}/{event.maxParticipants}</span>
        </div>
      ),
    },
    {
      key: 'fee',
      header: 'Fee',
      sortable: true,
      render: (event: Event) => event.fee > 0 ? formatCurrency(event.fee) : 'Free',
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (event: Event) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(event.status)}`}>
          {event.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (event: Event) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(event);
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Edit className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedEvent(event);
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

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      type: event.type,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      maxParticipants: event.maxParticipants,
      currentParticipants: event.currentParticipants,
      fee: event.fee,
      status: event.status,
      trainerId: event.trainerId || '',
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    const eventData = {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      location: formData.location,
      maxParticipants: formData.maxParticipants,
      currentParticipants: formData.currentParticipants,
      fee: formData.fee,
      status: formData.status,
      trainerId: formData.trainerId || undefined,
    };

    if (selectedEvent) {
      updateEvent(selectedEvent.id, eventData);
    } else {
      addEvent(eventData);
    }

    resetForm();
  };

  const handleDelete = () => {
    if (selectedEvent) {
      deleteEvent(selectedEvent.id);
      setShowDeleteModal(false);
      setSelectedEvent(null);
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setSelectedEvent(null);
    setFormData({
      title: '',
      description: '',
      type: 'workshop',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      location: '',
      maxParticipants: 20,
      currentParticipants: 0,
      fee: 0,
      status: 'upcoming',
      trainerId: '',
    });
  };

  const handleDownload = () => {
    const exportData = events.map((e) => ({
      ...e,
      trainerId: undefined,
      createdAt: undefined,
      updatedAt: undefined,
    }));
    downloadAsCSV(exportData as unknown as Record<string, unknown>[], 'events_export', [
      { key: 'title', header: 'Title' },
      { key: 'type', header: 'Type' },
      { key: 'startDate', header: 'Start Date' },
      { key: 'endDate', header: 'End Date' },
      { key: 'location', header: 'Location' },
      { key: 'maxParticipants', header: 'Max Participants' },
      { key: 'currentParticipants', header: 'Current Participants' },
      { key: 'fee', header: 'Fee' },
      { key: 'status', header: 'Status' },
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
        title="Events"
        subtitle="Manage gym events, workshops, and competitions"
      />
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Widget
            title="Upcoming Events"
            value={upcomingEvents}
            icon={Calendar}
            color="blue"
          />
          <Widget
            title="Ongoing Events"
            value={ongoingEvents}
            icon={Clock}
            color="green"
          />
          <Widget
            title="Total Participants"
            value={totalParticipants}
            icon={Users}
            color="purple"
          />
        </div>

        <div className="flex justify-end mb-6">
          <Button
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowModal(true)}
          >
            Add Event
          </Button>
        </div>

        <DataTable
          data={filteredEvents}
          columns={columns}
          searchPlaceholder="Search events..."
          onDownload={handleDownload}
          filterComponent={filterComponent}
          emptyMessage="No events found"
        />

        <Modal
          isOpen={showModal}
          onClose={resetForm}
          title={selectedEvent ? 'Edit Event' : 'Add New Event'}
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
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Event['type'] })}
              />
              <Select
                label="Status"
                options={statusOptions}
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Event['status'] })}
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
                label="Fee (₹)"
                type="number"
                value={formData.fee}
                onChange={(e) => setFormData({ ...formData, fee: Number(e.target.value) })}
              />
            </div>
            <Select
              label="Trainer (Optional)"
              options={trainerOptions}
              value={formData.trainerId}
              onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {selectedEvent ? 'Update' : 'Add'} Event
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Event"
          size="sm"
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete "{selectedEvent?.title}"?
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
