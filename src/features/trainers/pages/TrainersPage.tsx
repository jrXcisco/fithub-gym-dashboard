import { useState } from 'react';
import {
  UserCheck,
  Plus,
  Edit,
  Trash2,
  Award,
  Clock,
} from 'lucide-react';
import { Header } from '../../../components/layout';
import { Widget, DataTable, Button, Modal, Input, Select } from '../../../components/ui';
import { useTrainerStore } from '../../../stores/trainerStore';
import { formatCurrency, getStatusColor, downloadAsCSV } from '../../../lib/utils';
import type { Trainer } from '../../../types';

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

export function TrainersPage() {
  const { trainers, addTrainer, updateTrainer, deleteTrainer } = useTrainerStore();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialization: [] as string[],
    experience: 0,
    certifications: '',
    availableDays: [] as string[],
    startTime: '06:00',
    endTime: '14:00',
    salary: 0,
    status: 'active' as 'active' | 'inactive',
  });

  const activeTrainers = trainers.filter((t) => t.status === 'active').length;
  const totalSalary = trainers.filter((t) => t.status === 'active').reduce((sum, t) => sum + t.salary, 0);

  const columns = [
    {
      key: 'name',
      header: 'Trainer',
      sortable: true,
      render: (trainer: Trainer) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-purple-600 font-medium text-sm">
              {trainer.firstName[0]}{trainer.lastName[0]}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {trainer.firstName} {trainer.lastName}
            </p>
            <p className="text-sm text-gray-500">{trainer.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'specialization',
      header: 'Specialization',
      render: (trainer: Trainer) => (
        <div className="flex flex-wrap gap-1">
          {trainer.specialization.slice(0, 2).map((spec) => (
            <span key={spec} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
              {spec}
            </span>
          ))}
          {trainer.specialization.length > 2 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
              +{trainer.specialization.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'experience',
      header: 'Experience',
      sortable: true,
      render: (trainer: Trainer) => `${trainer.experience} years`,
    },
    {
      key: 'salary',
      header: 'Salary',
      sortable: true,
      render: (trainer: Trainer) => formatCurrency(trainer.salary),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (trainer: Trainer) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(trainer.status)}`}>
          {trainer.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (trainer: Trainer) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(trainer);
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Edit className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTrainer(trainer);
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

  const handleEdit = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setFormData({
      firstName: trainer.firstName,
      lastName: trainer.lastName,
      email: trainer.email,
      phone: trainer.phone,
      specialization: trainer.specialization,
      experience: trainer.experience,
      certifications: trainer.certifications.join(', '),
      availableDays: trainer.availability.days,
      startTime: trainer.availability.startTime,
      endTime: trainer.availability.endTime,
      salary: trainer.salary,
      status: trainer.status,
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    const trainerData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      specialization: formData.specialization,
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

    if (selectedTrainer) {
      updateTrainer(selectedTrainer.id, trainerData);
    } else {
      addTrainer(trainerData);
    }

    resetForm();
  };

  const handleDelete = () => {
    if (selectedTrainer) {
      deleteTrainer(selectedTrainer.id);
      setShowDeleteModal(false);
      setSelectedTrainer(null);
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setSelectedTrainer(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      specialization: [],
      experience: 0,
      certifications: '',
      availableDays: [],
      startTime: '06:00',
      endTime: '14:00',
      salary: 0,
      status: 'active',
    });
  };

  const handleDownload = () => {
    const exportData = trainers.map((t) => ({
      firstName: t.firstName,
      lastName: t.lastName,
      email: t.email,
      phone: t.phone,
      specialization: t.specialization.join('; '),
      experience: t.experience,
      salary: t.salary,
      status: t.status,
    }));
    downloadAsCSV(exportData, 'trainers_export', [
      { key: 'firstName', header: 'First Name' },
      { key: 'lastName', header: 'Last Name' },
      { key: 'email', header: 'Email' },
      { key: 'phone', header: 'Phone' },
      { key: 'specialization', header: 'Specialization' },
      { key: 'experience', header: 'Experience (Years)' },
      { key: 'salary', header: 'Salary' },
      { key: 'status', header: 'Status' },
    ]);
  };

  const toggleSpecialization = (spec: string) => {
    setFormData((prev) => ({
      ...prev,
      specialization: prev.specialization.includes(spec)
        ? prev.specialization.filter((s) => s !== spec)
        : [...prev.specialization, spec],
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
        title="Trainers"
        subtitle="Manage your gym trainers and their schedules"
      />
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Widget
            title="Total Trainers"
            value={trainers.length}
            icon={UserCheck}
            color="purple"
          />
          <Widget
            title="Active Trainers"
            value={activeTrainers}
            icon={Award}
            color="green"
          />
          <Widget
            title="Monthly Salary"
            value={formatCurrency(totalSalary)}
            icon={Clock}
            color="blue"
          />
        </div>

        <div className="flex justify-end mb-6">
          <Button
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowModal(true)}
          >
            Add Trainer
          </Button>
        </div>

        <DataTable
          data={trainers}
          columns={columns}
          searchPlaceholder="Search trainers..."
          onDownload={handleDownload}
          emptyMessage="No trainers found"
        />

        <Modal
          isOpen={showModal}
          onClose={resetForm}
          title={selectedTrainer ? 'Edit Trainer' : 'Add New Trainer'}
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
                      formData.specialization.includes(opt.value)
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

            <Input
              label="Certifications (comma separated)"
              value={formData.certifications}
              onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
              placeholder="ACE Certified, NASM, CrossFit Level 2"
            />

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
              <Button variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {selectedTrainer ? 'Update' : 'Add'} Trainer
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Trainer"
          size="sm"
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete {selectedTrainer?.firstName} {selectedTrainer?.lastName}?
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
