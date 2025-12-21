import { useState } from 'react';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Wrench,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { Header } from '../../../components/layout';
import { Widget, DataTable, Button, Modal, Input, Select, Textarea } from '../../../components/ui';
import { useResourceStore } from '../../../stores/resourceStore';
import { formatDate, formatCurrency, getStatusColor, downloadAsCSV } from '../../../lib/utils';
import type { Resource } from '../../../types';

const typeOptions = [
  { label: 'Equipment', value: 'equipment' },
  { label: 'Facility', value: 'facility' },
  { label: 'Consumable', value: 'consumable' },
  { label: 'Other', value: 'other' },
];

const statusOptions = [
  { label: 'Available', value: 'available' },
  { label: 'In Use', value: 'in-use' },
  { label: 'Maintenance', value: 'maintenance' },
  { label: 'Out of Stock', value: 'out-of-stock' },
];

export function ResourcesPage() {
  const { resources, addResource, updateResource, deleteResource } = useResourceStore();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    type: 'equipment' as Resource['type'],
    quantity: 1,
    status: 'available' as Resource['status'],
    location: '',
    purchaseDate: '',
    lastMaintenanceDate: '',
    nextMaintenanceDate: '',
    cost: 0,
    notes: '',
  });

  const availableResources = resources.filter((r) => r.status === 'available').length;
  const maintenanceResources = resources.filter((r) => r.status === 'maintenance').length;
  const outOfStockResources = resources.filter((r) => r.status === 'out-of-stock').length;

  const filteredResources = statusFilter === 'all'
    ? resources
    : resources.filter((r) => r.status === statusFilter);

  const columns = [
    {
      key: 'name',
      header: 'Resource',
      sortable: true,
      render: (resource: Resource) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <Package className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{resource.name}</p>
            <p className="text-sm text-gray-500 capitalize">{resource.type}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'quantity',
      header: 'Quantity',
      sortable: true,
    },
    {
      key: 'location',
      header: 'Location',
      sortable: true,
    },
    {
      key: 'cost',
      header: 'Cost',
      sortable: true,
      render: (resource: Resource) => formatCurrency(resource.cost),
    },
    {
      key: 'nextMaintenanceDate',
      header: 'Next Maintenance',
      render: (resource: Resource) => 
        resource.nextMaintenanceDate ? formatDate(resource.nextMaintenanceDate) : '-',
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (resource: Resource) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(resource.status)}`}>
          {resource.status.replace('-', ' ')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (resource: Resource) => (
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

  const handleEdit = (resource: Resource) => {
    setSelectedResource(resource);
    setFormData({
      name: resource.name,
      type: resource.type,
      quantity: resource.quantity,
      status: resource.status,
      location: resource.location,
      purchaseDate: resource.purchaseDate || '',
      lastMaintenanceDate: resource.lastMaintenanceDate || '',
      nextMaintenanceDate: resource.nextMaintenanceDate || '',
      cost: resource.cost,
      notes: resource.notes || '',
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    const resourceData = {
      name: formData.name,
      type: formData.type,
      quantity: formData.quantity,
      status: formData.status,
      location: formData.location,
      purchaseDate: formData.purchaseDate || undefined,
      lastMaintenanceDate: formData.lastMaintenanceDate || undefined,
      nextMaintenanceDate: formData.nextMaintenanceDate || undefined,
      cost: formData.cost,
      notes: formData.notes || undefined,
    };

    if (selectedResource) {
      updateResource(selectedResource.id, resourceData);
    } else {
      addResource(resourceData);
    }

    resetForm();
  };

  const handleDelete = () => {
    if (selectedResource) {
      deleteResource(selectedResource.id);
      setShowDeleteModal(false);
      setSelectedResource(null);
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setSelectedResource(null);
    setFormData({
      name: '',
      type: 'equipment',
      quantity: 1,
      status: 'available',
      location: '',
      purchaseDate: '',
      lastMaintenanceDate: '',
      nextMaintenanceDate: '',
      cost: 0,
      notes: '',
    });
  };

  const handleDownload = () => {
    const exportData = resources.map((r) => ({
      name: r.name,
      type: r.type,
      quantity: r.quantity,
      status: r.status,
      location: r.location,
      cost: r.cost,
      purchaseDate: r.purchaseDate || '',
      nextMaintenanceDate: r.nextMaintenanceDate || '',
    }));
    downloadAsCSV(exportData, 'resources_export', [
      { key: 'name', header: 'Name' },
      { key: 'type', header: 'Type' },
      { key: 'quantity', header: 'Quantity' },
      { key: 'status', header: 'Status' },
      { key: 'location', header: 'Location' },
      { key: 'cost', header: 'Cost' },
      { key: 'purchaseDate', header: 'Purchase Date' },
      { key: 'nextMaintenanceDate', header: 'Next Maintenance' },
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
        title="Resources"
        subtitle="Manage gym equipment, facilities, and supplies"
      />
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Widget
            title="Total Resources"
            value={resources.length}
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
          data={filteredResources}
          columns={columns}
          searchPlaceholder="Search resources..."
          onDownload={handleDownload}
          filterComponent={filterComponent}
          emptyMessage="No resources found"
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
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Type"
                options={typeOptions}
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Resource['type'] })}
              />
              <Select
                label="Status"
                options={statusOptions}
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Resource['status'] })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
              />
              <Input
                label="Cost (₹)"
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
              />
            </div>
            <Input
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Purchase Date"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              />
              <Input
                label="Last Maintenance"
                type="date"
                value={formData.lastMaintenanceDate}
                onChange={(e) => setFormData({ ...formData, lastMaintenanceDate: e.target.value })}
              />
              <Input
                label="Next Maintenance"
                type="date"
                value={formData.nextMaintenanceDate}
                onChange={(e) => setFormData({ ...formData, nextMaintenanceDate: e.target.value })}
              />
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
