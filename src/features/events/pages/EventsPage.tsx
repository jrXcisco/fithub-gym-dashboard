import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Users,
  MapPin,
  Clock,
  Loader2,
  Trophy,
  Presentation,
  Tent,
  Sparkles,
} from 'lucide-react';
import { Header } from '../../../components/layout';
import { Widget, DataTable, Button, Modal, Input, Select, Textarea, FilterMenu } from '../../../components/ui';
import type { FilterField } from '../../../components/ui';
import { EventSearchSuggestions } from '../../../components/ui/EventSearchSuggestions';
import { formatDate, formatCurrency, getStatusColor, downloadAsCSV } from '../../../lib/utils';
import { GET_EVENTS, CREATE_EVENT, UPDATE_EVENT, DELETE_EVENT } from '../../../graphql/events';
import { GET_TEAM_MEMBERS } from '../../../graphql/team';

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

export function EventsPage() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  
  // Filter state
  const [filters, setFilters] = useState<Record<string, string>>({
    status: 'all',
    type: 'all',
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
        { label: 'Upcoming', value: 'upcoming' },
        { label: 'Ongoing', value: 'ongoing' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
    {
      key: 'type',
      label: 'Type',
      options: [
        { label: 'All Types', value: 'all' },
        { label: 'Workshop', value: 'workshop' },
        { label: 'Competition', value: 'competition' },
        { label: 'Seminar', value: 'seminar' },
        { label: 'Camp', value: 'camp' },
        { label: 'Other', value: 'other' },
      ],
    },
  ];

  const [formData, setFormData] = useState({
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

  const { data, loading, error, refetch } = useQuery(GET_EVENTS, {
    variables: {
      filter: {
        ...(filters.status !== 'all' ? { status: filters.status } : {}),
        ...(filters.type !== 'all' ? { type: filters.type } : {}),
        ...(searchTerm ? { search: searchTerm } : {}),
      },
      pagination: { page: currentPage, limit: pageSize },
    },
    fetchPolicy: 'network-only',
  });

  const { data: trainersData } = useQuery(GET_TEAM_MEMBERS, {
    variables: { pagination: { page: 1, limit: 100 } },
  });

  const [createEvent] = useMutation(CREATE_EVENT, {
    onCompleted: () => {
      refetch();
      resetForm();
    },
    onError: (err) => {
      console.error('Error creating event:', err);
      alert(err.message);
    },
  });

  const [updateEventMutation] = useMutation(UPDATE_EVENT, {
    onCompleted: () => {
      refetch();
      resetForm();
    },
    onError: (err) => {
      console.error('Error updating event:', err);
      alert(err.message);
    },
  });

  const [deleteEventMutation] = useMutation(DELETE_EVENT, {
    onCompleted: () => {
      refetch();
      setShowDeleteModal(false);
      setSelectedEvent(null);
    },
    onError: (err) => {
      console.error('Error deleting event:', err);
      alert(err.message);
    },
  });

  // Lazy query to fetch all events for download (with current filters, no pagination)
  const [fetchAllEvents] = useLazyQuery(GET_EVENTS, {
    fetchPolicy: 'network-only',
  });

  const events: EventData[] = data?.events?.events || [];
  const totalEvents = data?.events?.total || 0;
  const trainers = trainersData?.trainers?.trainers || [];

  // Use stats from server for widgets (all records, not just paginated)
  const stats = data?.events?.stats;
  const upcomingEventsCount = stats?.upcoming || 0;
  const ongoingEventsCount = stats?.ongoing || 0;
  const totalParticipants = stats?.totalParticipants || 0;

  // Pagination handlers
  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePageSizeChange = (size: number) => { setPageSize(size); setCurrentPage(1); };
  const handleSearchChange = (search: string) => { setSearchTerm(search); setCurrentPage(1); };
  const handleFilterChange = (newFilters: Record<string, string>) => { setFilters(newFilters); setCurrentPage(1); };

  const trainerOptions = [
    { label: 'No Trainer', value: '' },
    ...trainers.map((t: { id: string; firstName: string; lastName: string }) => ({
      label: `${t.firstName} ${t.lastName}`,
      value: t.id,
    })),
  ];

  const handleEdit = (event: EventData) => {
    setSelectedEvent(event);
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
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
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
    };

    try {
      if (selectedEvent) {
        await updateEventMutation({
          variables: { id: selectedEvent.id, input },
        });
      } else {
        await createEvent({
          variables: { input },
        });
      }
    } catch (err) {
      console.error('Error submitting:', err);
    }
  };

  const handleDelete = async () => {
    if (selectedEvent) {
      try {
        await deleteEventMutation({
          variables: { id: selectedEvent.id },
        });
      } catch (err) {
        console.error('Error deleting:', err);
      }
    }
  };

  const handleDownload = async () => {
    try {
      // Fetch all events with current filters (no pagination limit)
      const result = await fetchAllEvents({
        variables: {
          filter: {
            ...(filters.status !== 'all' ? { status: filters.status } : {}),
            ...(filters.type !== 'all' ? { type: filters.type } : {}),
            ...(searchTerm ? { search: searchTerm } : {}),
          },
          pagination: { page: 1, limit: 10000 },
        },
      });

      const allEvents: EventData[] = result.data?.events?.events || [];
      
      if (allEvents.length === 0) {
        alert('No events to download');
        return;
      }

      const exportData = allEvents.map((e) => ({
        title: e.title,
        type: e.type,
        startDate: e.startDate,
        endDate: e.endDate,
        location: e.location || '',
        maxParticipants: e.maxParticipants,
        currentParticipants: e.currentParticipants,
        fee: e.fee,
        status: e.status,
        trainer: e.trainer ? `${e.trainer.firstName} ${e.trainer.lastName}` : '',
      }));
      downloadAsCSV(exportData as unknown as Record<string, unknown>[], `events_export_${new Date().toISOString().split('T')[0]}`, [
        { key: 'title', header: 'Title' },
        { key: 'type', header: 'Type' },
        { key: 'startDate', header: 'Start Date' },
        { key: 'endDate', header: 'End Date' },
        { key: 'location', header: 'Location' },
        { key: 'maxParticipants', header: 'Max Participants' },
        { key: 'currentParticipants', header: 'Current Participants' },
        { key: 'fee', header: 'Fee' },
        { key: 'status', header: 'Status' },
        { key: 'trainer', header: 'Trainer' },
      ]);
    } catch (err) {
      console.error('Error downloading events:', err);
      alert('Failed to download events');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600">Loading events...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading events: {error.message}</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  // Check if any filters are applied
  const hasActiveFilters = Object.values(filters).some(v => v && v !== 'all') || searchTerm;
  
  // Check if this is truly empty (no events at all) vs filtered results empty
  const isTrulyEmpty = (stats?.total === 0 || stats?.total === undefined) && !hasActiveFilters;

  // Empty state - no events yet
  if (events.length === 0 && isTrulyEmpty) {
    return (
      <div>
        <Header
          title="Events"
          subtitle="Manage gym events, workshops, and competitions"
        />
        <div className="p-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            {/* Animated Event Icon */}
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="relative">
                  {/* Center calendar */}
                  <Calendar className="w-12 h-12 text-blue-500 animate-pulse" />
                  {/* Orbiting icons */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 animate-bounce" style={{ animationDelay: '0s' }}>
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <Presentation className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 animate-bounce" style={{ animationDelay: '0.2s' }}>
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Trophy className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="absolute top-1/2 -left-8 -translate-y-1/2 animate-bounce" style={{ animationDelay: '0.4s' }}>
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Tent className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="absolute top-1/2 -right-8 -translate-y-1/2 animate-bounce" style={{ animationDelay: '0.6s' }}>
                    <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              {/* Pulsing ring effect */}
              <div className="absolute inset-0 w-32 h-32 bg-blue-200 rounded-full animate-ping opacity-20"></div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Plan Your Gym Events
            </h2>
            <p className="text-gray-500 text-center max-w-md mb-8">
              Organize workshops, competitions, seminars, and camps. Track participants, manage schedules, and grow your gym community.
            </p>
            
            <Button
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setShowModal(true)}
              className="animate-pulse"
            >
              Create Your First Event
            </Button>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl">
              <div className="text-center p-4 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Presentation className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Workshops</h3>
                <p className="text-sm text-gray-500">Training sessions & classes</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl hover:bg-yellow-50 transition-colors">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Trophy className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Competitions</h3>
                <p className="text-sm text-gray-500">Fitness challenges & contests</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl hover:bg-green-50 transition-colors">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Tent className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Camps</h3>
                <p className="text-sm text-gray-500">Multi-day fitness programs</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl hover:bg-pink-50 transition-colors">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-pink-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Special Events</h3>
                <p className="text-sm text-gray-500">Seminars & guest sessions</p>
              </div>
            </div>
          </div>
        </div>

        <Modal
          isOpen={showModal}
          onClose={resetForm}
          title="Add New Event"
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
                Add Event
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  const columns = [
    {
      key: 'title',
      header: 'Event',
      sortable: true,
      render: (event: EventData) => (
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
      render: (event: EventData) => (
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
      render: (event: EventData) => (
        <div className="flex items-center gap-1 text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{event.location || '-'}</span>
        </div>
      ),
    },
    {
      key: 'participants',
      header: 'Participants',
      render: (event: EventData) => (
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
      render: (event: EventData) => event.fee > 0 ? formatCurrency(event.fee) : 'Free',
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (event: EventData) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(event.status)}`}>
          {event.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (event: EventData) => (
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
            value={upcomingEventsCount}
            icon={Calendar}
            color="blue"
          />
          <Widget
            title="Ongoing Events"
            value={ongoingEventsCount}
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

        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <EventSearchSuggestions
            placeholder="Search events by name..."
            onSelect={(event) => navigate(`/dashboard/events/${event.id}`)}
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
              Add Event
            </Button>
          </div>
        </div>

        <DataTable
          data={events}
          columns={columns}
          onDownload={handleDownload}
          onRowClick={(event) => navigate(`/dashboard/events/${event.id}`)}
          emptyMessage="No events found"
          hideSearch={true}
          serverSidePagination={true}
          totalItems={totalEvents}
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
