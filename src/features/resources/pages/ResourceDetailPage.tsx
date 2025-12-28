import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  MapPin,
  Calendar,
  DollarSign,
  Wrench,
  Info,
  Loader2,
  Tag,
  Hash,
  Shield,
} from 'lucide-react';
import { Header } from '../../../components/layout';
import { Button, Modal, Input, Select, Textarea } from '../../../components/ui';
import { formatDate, formatCurrency, getStatusColor } from '../../../lib/utils';
import { GET_RESOURCE, UPDATE_RESOURCE, DELETE_RESOURCE } from '../../../graphql/resources';

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
  image?: string;
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

const frequencyOptions = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Yearly', value: 'yearly' },
];

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'equipment': 'bg-blue-100 text-blue-800',
    'facility': 'bg-purple-100 text-purple-800',
    'consumable': 'bg-green-100 text-green-800',
    'other': 'bg-gray-100 text-gray-800',
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
};

export function ResourceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_RESOURCE, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'network-only',
  });

  const [updateResource] = useMutation(UPDATE_RESOURCE, {
    onCompleted: () => {
      refetch();
      setShowEditModal(false);
    },
    onError: (err) => {
      console.error('Error updating resource:', err);
      alert(err.message);
    },
  });

  const [deleteResourceMutation] = useMutation(DELETE_RESOURCE, {
    onCompleted: () => {
      navigate('/dashboard/resources');
    },
    onError: (err) => {
      console.error('Error deleting resource:', err);
      alert(err.message);
    },
  });

  const resource: ResourceData | null = data?.resource || null;

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600">Loading resource details...</span>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Resource Not Found</h2>
          <p className="text-gray-500 mb-4">
            {error ? error.message : "The resource you're looking for doesn't exist."}
          </p>
          <Button onClick={() => navigate('/dashboard/resources')}>Back to Resources</Button>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
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
    setShowEditModal(true);
  };

  const handleSubmit = async () => {
    try {
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

      // Always include maintenanceSchedule if any field has a value
      input.maintenanceSchedule = {
        lastMaintenance: formData.lastMaintenance || null,
        nextMaintenance: formData.nextMaintenance || null,
        frequency: formData.frequency || null,
      };

      // Always include specifications if any field has a value
      input.specifications = {
        brand: formData.brand || null,
        model: formData.model || null,
        serialNumber: formData.serialNumber || null,
        warranty: {
          expiryDate: formData.warrantyExpiry || null,
          provider: formData.warrantyProvider || null,
        },
      };

      await updateResource({
        variables: { id: resource.id, input },
      });
    } catch (err) {
      console.error('Error updating:', err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteResourceMutation({
        variables: { id: resource.id },
      });
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  return (
    <div>
      <Header
        title="Resource Details"
        subtitle={resource.name}
      />
      <div className="p-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/dashboard/resources')}
          >
            Back to Resources
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Package className="w-8 h-8 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {resource.name}
                    </h2>
                    <div className="flex gap-2 mt-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getCategoryColor(resource.category)}`}>
                        {resource.category}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(resource.status)}`}>
                        {resource.status.replace('_', ' ')}
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

              {resource.description && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4" /> Description
                  </h3>
                  <p className="text-gray-600">{resource.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Quantity</p>
                  <p className="font-semibold text-lg">{resource.quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Available</p>
                  <p className="font-semibold text-lg text-green-600">{resource.availableQuantity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">In Use</p>
                  <p className="font-semibold text-lg text-blue-600">{resource.quantity - resource.availableQuantity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Purchase Price</p>
                  <p className="font-semibold text-lg">{formatCurrency(resource.purchasePrice || 0)}</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Location & Dates
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{resource.location || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Purchase Date</p>
                      <p className="font-medium">{resource.purchaseDate ? formatDate(resource.purchaseDate) : 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Wrench className="w-4 h-4" /> Maintenance
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Last Maintenance</p>
                      <p className="font-medium">
                        {resource.maintenanceSchedule?.lastMaintenance 
                          ? formatDate(resource.maintenanceSchedule.lastMaintenance) 
                          : 'Not recorded'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Next Maintenance</p>
                      <p className="font-medium">
                        {resource.maintenanceSchedule?.nextMaintenance 
                          ? formatDate(resource.maintenanceSchedule.nextMaintenance) 
                          : 'Not scheduled'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Frequency</p>
                      <p className="font-medium capitalize">{resource.maintenanceSchedule?.frequency || 'Not set'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {resource.notes && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                    <Info className="w-4 h-4" /> Notes
                  </h3>
                  <p className="text-gray-600">{resource.notes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {resource.specifications && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <Tag className="w-4 h-4" /> Specifications
                </h3>
                <div className="space-y-4">
                  {resource.specifications.brand && (
                    <div>
                      <p className="text-sm text-gray-500">Brand</p>
                      <p className="font-medium">{resource.specifications.brand}</p>
                    </div>
                  )}
                  {resource.specifications.model && (
                    <div>
                      <p className="text-sm text-gray-500">Model</p>
                      <p className="font-medium">{resource.specifications.model}</p>
                    </div>
                  )}
                  {resource.specifications.serialNumber && (
                    <div>
                      <p className="text-sm text-gray-500">Serial Number</p>
                      <p className="font-medium font-mono">{resource.specifications.serialNumber}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {resource.specifications?.warranty && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <Shield className="w-4 h-4" /> Warranty
                </h3>
                <div className="space-y-4">
                  {resource.specifications.warranty.expiryDate && (
                    <div>
                      <p className="text-sm text-gray-500">Expiry Date</p>
                      <p className="font-medium">{formatDate(resource.specifications.warranty.expiryDate)}</p>
                    </div>
                  )}
                  {resource.specifications.warranty.provider && (
                    <div>
                      <p className="text-sm text-gray-500">Provider</p>
                      <p className="font-medium">{resource.specifications.warranty.provider}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4" /> Timeline
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Created</p>
                    <p className="text-sm text-gray-500">{formatDate(resource.createdAt)}</p>
                  </div>
                </div>
                {resource.purchaseDate && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Purchased</p>
                      <p className="text-sm text-gray-500">{formatDate(resource.purchaseDate)}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Updated</p>
                    <p className="text-sm text-gray-500">{formatDate(resource.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Resource"
          size="lg"
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
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
                label="Purchase Price (₹)"
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

            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Maintenance Schedule</h4>
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
                  options={frequencyOptions}
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                />
              </div>
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
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                Update Resource
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Modal */}
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
              Delete "{resource.name}"?
            </h3>
            <p className="text-gray-500 mb-6">
              This action cannot be undone. All data associated with this resource will be permanently removed.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Delete Resource
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
