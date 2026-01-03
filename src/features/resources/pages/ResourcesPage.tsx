import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Dumbbell,
  Building,
  ShoppingBag,
} from 'lucide-react';
import { Header } from '../../../components/layout';
import { Widget, DataTable, Button, Modal, Input, Select, Textarea } from '../../../components/ui';
import { formatDate, formatCurrency, getStatusColor, downloadAsCSV } from '../../../lib/utils';
import { GET_RESOURCES, CREATE_RESOURCE, UPDATE_RESOURCE, DELETE_RESOURCE } from '../../../graphql/resources';

interface ResourceData {
  id: string;
  name: string;
  category: string;
  description?: string;
  quantity: number;
  availableQuantity: number;
  status: string;
  location?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  maintenanceSchedule?: {
    lastMaintenance?: string;
    nextMaintenance?: string;
    frequency?: string;
  };
  specifications?: {
    brand?: string;
    model?: string;
    serialNumber?: string;
    warranty?: {
      expiryDate?: string;
      provider?: string;
    };
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const categoryOptions = [
  { label: 'Equipment', value: 'equipment' },
  { label: 'Facility', value: 'facility' },
  { label: 'Consumable', value: 'consumable' },
  { label: 'Other', value: 'other' },
];

const statusOptions = [
  { label: 'Available', value: 'available' },
  { label: 'In Use', value: 'in_use' },
  { label: 'Maintenance', value: 'maintenance' },
  { label: 'Out of Order', value: 'out_of_order' },
  { label: 'Retired', value: 'retired' },
];

export function ResourcesPage() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<ResourceData | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: 'equipment',
    description: '',
    quantity: 1,
    availableQuantity: 1,
    status: 'available',
    location: '',
    purchaseDate: '',
    purchasePrice: 0,
    lastMaintenance: '',
    nextMaintenance: '',
    frequency: 'monthly',
    brand: '',
    model: '',
    serialNumber: '',
    warrantyExpiry: '',
    warrantyProvider: '',
    notes: '',
  });

  const { data, loading, error, refetch } = useQuery(GET_RESOURCES, {
    variables: {
      filter: {
        ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
        ...(searchTerm ? { search: searchTerm } : {}),
      },
      pagination: { page: currentPage, limit: pageSize },
    },
    fetchPolicy: 'network-only',
  });

  const [createResource] = useMutation(CREATE_RESOURCE, {
    onCompleted: () => {
      refetch();
      resetForm();
    },
    onError: (err) => {
      console.error('Error creating resource:', err);
      alert(err.message);
    },
  });

  const [updateResource] = useMutation(UPDATE_RESOURCE, {
    onCompleted: () => {
      refetch();
      resetForm();
    },
    onError: (err) => {
      console.error('Error updating resource:', err);
      alert(err.message);
    },
  });

  const [deleteResourceMutation] = useMutation(DELETE_RESOURCE, {
    onCompleted: () => {
      refetch();
      setShowDeleteModal(false);
      setSelectedResource(null);
    },
    onError: (err) => {
      console.error('Error deleting resource:', err);
      alert(err.message);
    },
  });

  const resources: ResourceData[] = data?.resources?.resources || [];
  const totalResources = data?.resources?.total || 0;

  // Use stats from server for widgets (all records, not just paginated)
  const stats = data?.resources?.stats;
  const totalResourcesCount = stats?.total || 0;
  const availableResources = stats?.available || 0;
  const maintenanceResources = stats?.maintenance || 0;
  const outOfStockResources = stats?.outOfOrder || 0;

  // Pagination handlers
  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePageSizeChange = (size: number) => { setPageSize(size); setCurrentPage(1); };
  const handleSearchChange = (search: string) => { setSearchTerm(search); setCurrentPage(1); };

  const columns = [
    {
      key: 'name',
      header: 'Resource',
      sortable: true,
      render: (resource: ResourceData) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <Package className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{resource.name}</p>
            <p className="text-sm text-gray-500 capitalize">{resource.category}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'quantity',
      header: 'Qty',
      sortable: true,
      render: (resource: ResourceData) => (
        <span>{resource.availableQuantity}/{resource.quantity}</span>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      sortable: true,
      render: (resource: ResourceData) => resource.location || '-',
    },
    {
      key: 'purchasePrice',
      header: 'Price',
      sortable: true,
      render: (resource: ResourceData) => formatCurrency(resource.purchasePrice || 0),
    },
    {
      key: 'nextMaintenance',
      header: 'Next Maintenance',
      render: (resource: ResourceData) => 
        resource.maintenanceSchedule?.nextMaintenance ? formatDate(resource.maintenanceSchedule.nextMaintenance) : '-',
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (resource: ResourceData) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(resource.status)}`}>
          {resource.status.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (resource: ResourceData) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(resource);
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Edit className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedResource(resource);
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

  const handleEdit = (resource: ResourceData) => {
    setSelectedResource(resource);
    setFormData({
      name: resource.name || '',
      category: resource.category || 'equipment',
      description: resource.description || '',
      quantity: resource.quantity || 1,
      availableQuantity: resource.availableQuantity || 1,
      status: resource.status || 'available',
      location: resource.location || '',
      purchaseDate: resource.purchaseDate ? resource.purchaseDate.split('T')[0] : '',
      purchasePrice: resource.purchasePrice || 0,
      lastMaintenance: resource.maintenanceSchedule?.lastMaintenance ? resource.maintenanceSchedule.lastMaintenance.split('T')[0] : '',
      nextMaintenance: resource.maintenanceSchedule?.nextMaintenance ? resource.maintenanceSchedule.nextMaintenance.split('T')[0] : '',
      frequency: resource.maintenanceSchedule?.frequency || 'monthly',
      brand: resource.specifications?.brand || '',
      model: resource.specifications?.model || '',
      serialNumber: resource.specifications?.serialNumber || '',
      warrantyExpiry: resource.specifications?.warranty?.expiryDate ? resource.specifications.warranty.expiryDate.split('T')[0] : '',
      warrantyProvider: resource.specifications?.warranty?.provider || '',
      notes: resource.notes || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    const input: any = {
      name: formData.name,
      category: formData.category,
      description: formData.description,
      quantity: formData.quantity,
      availableQuantity: formData.availableQuantity,
      status: formData.status,
      location: formData.location,
      purchaseDate: formData.purchaseDate || null,
      purchasePrice: formData.purchasePrice,
      notes: formData.notes,
    };

    // Always include maintenanceSchedule
    input.maintenanceSchedule = {
      lastMaintenance: formData.lastMaintenance || null,
      nextMaintenance: formData.nextMaintenance || null,
      frequency: formData.frequency || null,
    };

    // Always include specifications
    input.specifications = {
      brand: formData.brand || null,
      model: formData.model || null,
      serialNumber: formData.serialNumber || null,
      warranty: {
        expiryDate: formData.warrantyExpiry || null,
        provider: formData.warrantyProvider || null,
      },
    };

    try {
      if (selectedResource) {
        await updateResource({
          variables: { id: selectedResource.id, input },
        });
      } else {
        await createResource({
          variables: { input },
        });
      }
    } catch (err) {
      console.error('Error submitting:', err);
    }
  };

  const handleDelete = async () => {
    if (selectedResource) {
      try {
        await deleteResourceMutation({
          variables: { id: selectedResource.id },
        });
      } catch (err) {
        console.error('Error deleting:', err);
      }
    }
  };

  const handleRowClick = (resource: ResourceData) => {
    navigate(`/dashboard/resources/${resource.id}`);
  };

  const resetForm = () => {
    setShowModal(false);
    setSelectedResource(null);
    setFormData({
      name: '',
      category: 'equipment',
      description: '',
      quantity: 1,
      availableQuantity: 1,
      status: 'available',
      location: '',
      purchaseDate: '',
      purchasePrice: 0,
      lastMaintenance: '',
      nextMaintenance: '',
      frequency: 'monthly',
      brand: '',
      model: '',
      serialNumber: '',
      warrantyExpiry: '',
      warrantyProvider: '',
      notes: '',
    });
  };

  const handleDownload = () => {
    const exportData = resources.map((r) => ({
      name: r.name,
      category: r.category,
      quantity: r.quantity,
      availableQuantity: r.availableQuantity,
      status: r.status,
      location: r.location || '',
      purchasePrice: r.purchasePrice || 0,
      purchaseDate: r.purchaseDate || '',
      nextMaintenance: r.maintenanceSchedule?.nextMaintenance || '',
    }));
    downloadAsCSV(exportData, 'resources_export', [
      { key: 'name', header: 'Name' },
      { key: 'category', header: 'Category' },
      { key: 'quantity', header: 'Quantity' },
      { key: 'availableQuantity', header: 'Available' },
      { key: 'status', header: 'Status' },
      { key: 'location', header: 'Location' },
      { key: 'purchasePrice', header: 'Price' },
      { key: 'purchaseDate', header: 'Purchase Date' },
      { key: 'nextMaintenance', header: 'Next Maintenance' },
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600">Loading resources...</span>
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
              ? 'Please log in to view resources' 
              : `Error loading resources: ${errorMessage}`}
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

  // Empty state - no resources yet
  if (resources.length === 0 && statusFilter === 'all') {
    return (
      <div>
        <Header
          title="Resources"
          subtitle="Manage gym equipment, facilities, and supplies"
        />
        <div className="p-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            {/* Animated Resource Icon */}
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center">
                <div className="relative">
                  {/* Center package */}
                  <Package className="w-12 h-12 text-indigo-500 animate-pulse" />
                  {/* Orbiting icons */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 animate-bounce" style={{ animationDelay: '0s' }}>
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Dumbbell className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 animate-bounce" style={{ animationDelay: '0.2s' }}>
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <Building className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="absolute top-1/2 -left-8 -translate-y-1/2 animate-bounce" style={{ animationDelay: '0.4s' }}>
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <ShoppingBag className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="absolute top-1/2 -right-8 -translate-y-1/2 animate-bounce" style={{ animationDelay: '0.6s' }}>
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Wrench className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              {/* Pulsing ring effect */}
              <div className="absolute inset-0 w-32 h-32 bg-indigo-200 rounded-full animate-ping opacity-20"></div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Manage Your Gym Assets
            </h2>
            <p className="text-gray-500 text-center max-w-md mb-8">
              Track all your gym equipment, facilities, and consumables in one place. Monitor maintenance schedules, availability, and costs efficiently.
            </p>
            
            <Button
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setShowModal(true)}
              className="animate-pulse"
            >
              Add Your First Resource
            </Button>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl">
              <div className="text-center p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Dumbbell className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Equipment</h3>
                <p className="text-sm text-gray-500">Treadmills, weights, machines</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Building className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Facilities</h3>
                <p className="text-sm text-gray-500">Rooms, pools, courts</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl hover:bg-green-50 transition-colors">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShoppingBag className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Consumables</h3>
                <p className="text-sm text-gray-500">Towels, supplements, supplies</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl hover:bg-yellow-50 transition-colors">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Wrench className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Maintenance</h3>
                <p className="text-sm text-gray-500">Track repairs & schedules</p>
              </div>
            </div>
          </div>
        </div>

        <Modal
          isOpen={showModal}
          onClose={resetForm}
          title="Add New Resource"
          size="lg"
        >
          <div className="space-y-4">
            <Input
              label="Resource Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                label="Category"
                options={categoryOptions}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
              <Select
                label="Status"
                options={statusOptions}
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
              />
              <Input
                label="Available"
                type="number"
                value={formData.availableQuantity}
                onChange={(e) => setFormData({ ...formData, availableQuantity: Number(e.target.value) })}
              />
              <Input
                label="Price (₹)"
                type="number"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
              <Input
                label="Purchase Date"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Last Maintenance"
                type="date"
                value={formData.lastMaintenance}
                onChange={(e) => setFormData({ ...formData, lastMaintenance: e.target.value })}
              />
              <Input
                label="Next Maintenance"
                type="date"
                value={formData.nextMaintenance}
                onChange={(e) => setFormData({ ...formData, nextMaintenance: e.target.value })}
              />
              <Select
                label="Frequency"
                options={[
                  { label: 'Weekly', value: 'weekly' },
                  { label: 'Monthly', value: 'monthly' },
                  { label: 'Quarterly', value: 'quarterly' },
                  { label: 'Yearly', value: 'yearly' },
                ]}
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              />
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Specifications</h4>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
                <Input
                  label="Model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                />
                <Input
                  label="Serial Number"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Input
                  label="Warranty Expiry"
                  type="date"
                  value={formData.warrantyExpiry}
                  onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
                />
                <Input
                  label="Warranty Provider"
                  value={formData.warrantyProvider}
                  onChange={(e) => setFormData({ ...formData, warrantyProvider: e.target.value })}
                />
              </div>
            </div>

            <Textarea
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                Add Resource
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
        title="Resources"
        subtitle="Manage gym equipment, facilities, and supplies"
      />
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Widget
            title="Total Resources"
            value={totalResourcesCount}
            icon={Package}
            color="blue"
          />
          <Widget
            title="Available"
            value={availableResources}
            icon={CheckCircle}
            color="green"
          />
          <Widget
            title="Under Maintenance"
            value={maintenanceResources}
            icon={Wrench}
            color="yellow"
          />
          <Widget
            title="Out of Stock"
            value={outOfStockResources}
            icon={AlertTriangle}
            color="red"
          />
        </div>

        <div className="flex justify-end mb-6">
          <Button
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowModal(true)}
          >
            Add Resource
          </Button>
        </div>

        <DataTable
          data={resources}
          columns={columns}
          searchPlaceholder="Search resources..."
          onDownload={handleDownload}
          onRowClick={handleRowClick}
          filterComponent={filterComponent}
          emptyMessage="No resources found"
          serverSidePagination={true}
          totalItems={totalResources}
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
          title={selectedResource ? 'Edit Resource' : 'Add New Resource'}
          size="lg"
        >
          <div className="space-y-4">
            <Input
              label="Resource Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                label="Category"
                options={categoryOptions}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
              <Select
                label="Status"
                options={statusOptions}
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
              />
              <Input
                label="Available"
                type="number"
                value={formData.availableQuantity}
                onChange={(e) => setFormData({ ...formData, availableQuantity: Number(e.target.value) })}
              />
              <Input
                label="Price (₹)"
                type="number"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
              <Input
                label="Purchase Date"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Last Maintenance"
                type="date"
                value={formData.lastMaintenance}
                onChange={(e) => setFormData({ ...formData, lastMaintenance: e.target.value })}
              />
              <Input
                label="Next Maintenance"
                type="date"
                value={formData.nextMaintenance}
                onChange={(e) => setFormData({ ...formData, nextMaintenance: e.target.value })}
              />
              <Select
                label="Frequency"
                options={[
                  { label: 'Weekly', value: 'weekly' },
                  { label: 'Monthly', value: 'monthly' },
                  { label: 'Quarterly', value: 'quarterly' },
                  { label: 'Yearly', value: 'yearly' },
                ]}
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              />
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Specifications</h4>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
                <Input
                  label="Model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                />
                <Input
                  label="Serial Number"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Input
                  label="Warranty Expiry"
                  type="date"
                  value={formData.warrantyExpiry}
                  onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
                />
                <Input
                  label="Warranty Provider"
                  value={formData.warrantyProvider}
                  onChange={(e) => setFormData({ ...formData, warrantyProvider: e.target.value })}
                />
              </div>
            </div>

            <Textarea
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {selectedResource ? 'Update' : 'Add'} Resource
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Resource"
          size="sm"
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete "{selectedResource?.name}"?
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
