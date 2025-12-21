import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Target,
  User,
  AlertTriangle,
} from 'lucide-react';
import { Header } from '../../../components/layout';
import { Button, Modal } from '../../../components/ui';
import { useMemberStore } from '../../../stores/memberStore';
import { MemberForm } from '../components/MemberForm';
import { formatDate, formatCurrency, getStatusColor } from '../../../lib/utils';
import type { Member } from '../../../types';

export function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getMemberById, updateMember, deleteMember } = useMemberStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);

  const member = getMemberById(id || '');

  if (!member) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Member Not Found</h2>
          <p className="text-gray-500 mb-4">The member you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/members')}>Back to Members</Button>
        </div>
      </div>
    );
  }

  const handleEdit = (data: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>) => {
    updateMember(member.id, data);
    setShowEditModal(false);
  };

  const handleDelete = () => {
    deleteMember(member.id);
    navigate('/members');
  };

  const handleRenew = () => {
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date();
    
    switch (member.subscriptionPlan) {
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'quarterly':
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case 'half-yearly':
        endDate.setMonth(endDate.getMonth() + 6);
        break;
      case 'yearly':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
    }

    updateMember(member.id, {
      membershipStartDate: startDate,
      membershipEndDate: endDate.toISOString().split('T')[0],
      status: 'active',
      payment: {
        ...member.payment,
        status: 'pending',
        paidAmount: 0,
        dueDate: startDate,
      },
    });
    setShowRenewModal(false);
  };

  return (
    <div>
      <Header
        title="Member Details"
        subtitle={`${member.firstName} ${member.lastName}`}
      />
      <div className="p-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/members')}
          >
            Back to Members
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-bold text-xl">
                      {member.firstName[0]}{member.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {member.firstName} {member.lastName}
                    </h2>
                    <p className="text-gray-500">{member.email}</p>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(member.status)}`}>
                      {member.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<Edit className="w-4 h-4" />}
                    onClick={() => setShowEditModal(true)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<RefreshCw className="w-4 h-4" />}
                    onClick={() => setShowRenewModal(true)}
                  >
                    Renew
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
                    <User className="w-4 h-4" /> Personal Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{member.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{member.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>DOB: {formatDate(member.dateOfBirth)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <User className="w-4 h-4" />
                      <span className="capitalize">Gender: {member.gender}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Address
                  </h3>
                  <div className="text-gray-600">
                    <p>{member.address.street}</p>
                    <p>{member.address.city}, {member.address.state}</p>
                    <p>{member.address.zipCode}, {member.address.country}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-4 h-4" /> Emergency Contact
                </h3>
                <div className="grid grid-cols-3 gap-4 text-gray-600">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{member.emergencyContact.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{member.emergencyContact.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Relation</p>
                    <p className="font-medium">{member.emergencyContact.relation || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {member.workoutProgram && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <Target className="w-4 h-4" /> Workout Program
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Fitness Goal</p>
                    <p className="font-medium capitalize">{member.workoutProgram.goal.replace('-', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium">{formatDate(member.workoutProgram.startDate)}</p>
                  </div>
                  {member.workoutProgram.notes && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Notes</p>
                      <p className="font-medium">{member.workoutProgram.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4" /> Membership
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Plan</p>
                  <p className="font-medium capitalize">{member.subscriptionPlan}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-medium">{formatDate(member.membershipStartDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">End Date</p>
                  <p className="font-medium">{formatDate(member.membershipEndDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(member.status)}`}>
                    {member.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <CreditCard className="w-4 h-4" /> Payment Details
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-medium text-lg">{formatCurrency(member.payment.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Paid Amount</p>
                  <p className="font-medium text-lg text-green-600">{formatCurrency(member.payment.paidAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Balance</p>
                  <p className="font-medium text-lg text-red-600">
                    {formatCurrency(member.payment.amount - member.payment.paidAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium capitalize">{member.payment.method.replace('-', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(member.payment.status)}`}>
                    {member.payment.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Member"
          size="xl"
        >
          <MemberForm
            initialData={member}
            onSubmit={handleEdit}
            onCancel={() => setShowEditModal(false)}
          />
        </Modal>

        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Member"
          size="sm"
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete {member.firstName} {member.lastName}?
            </h3>
            <p className="text-gray-500 mb-6">
              This action cannot be undone. All data associated with this member will be permanently removed.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Delete Member
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={showRenewModal}
          onClose={() => setShowRenewModal(false)}
          title="Renew Membership"
          size="sm"
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Renew Membership?
            </h3>
            <p className="text-gray-500 mb-2">
              This will renew the {member.subscriptionPlan} plan for {member.firstName} {member.lastName}.
            </p>
            <p className="text-sm text-gray-400 mb-6">
              A new payment record will be created with pending status.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="secondary" onClick={() => setShowRenewModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleRenew}>
                Renew Membership
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
