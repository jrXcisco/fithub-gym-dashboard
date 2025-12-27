import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
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
  Loader2,
} from 'lucide-react';
import { Header } from '../../../components/layout';
import { Button, Modal } from '../../../components/ui';
import { MemberForm } from '../components/MemberForm';
import { formatDate, formatCurrency, getStatusColor } from '../../../lib/utils';
import { GET_MEMBER, UPDATE_MEMBER, DELETE_MEMBER, ADD_PAYMENT } from '../../../graphql/members';
import { Input, Select } from '../../../components/ui';

interface MemberData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  membershipType: string;
  membershipStartDate: string;
  membershipEndDate?: string;
  status: string;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  healthInfo?: {
    height?: number;
    weight?: number;
    bloodGroup?: string;
    medicalConditions?: string[];
  };
  payment?: {
    method?: string;
    amount?: number;
    paidAmount?: number;
    status?: string;
    dueDate?: string;
    lastPaymentDate?: string;
  };
  paymentHistory?: {
    id?: string;
    amount: number;
    method: string;
    date: string;
    notes?: string;
    receiptNumber?: string;
  }[];
  workoutProgram?: {
    goal?: string;
    startDate?: string;
    notes?: string;
  };
  specialRequirements?: string;
  createdAt: string;
  updatedAt: string;
}

export function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [newPayment, setNewPayment] = useState({
    amount: 0,
    method: 'cash',
    notes: '',
    receiptNumber: '',
  });

  const { data, loading, error, refetch } = useQuery(GET_MEMBER, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'network-only',
  });

  const [updateMember] = useMutation(UPDATE_MEMBER, {
    onCompleted: () => {
      refetch();
      setShowEditModal(false);
      setShowRenewModal(false);
    },
    onError: (err) => {
      console.error('Error updating member:', err);
      alert(err.message);
    },
  });

  const [deleteMemberMutation] = useMutation(DELETE_MEMBER, {
    onCompleted: () => {
      navigate('/dashboard/members');
    },
    onError: (err) => {
      console.error('Error deleting member:', err);
      alert(err.message);
    },
  });

  const [addPaymentMutation] = useMutation(ADD_PAYMENT, {
    onCompleted: () => {
      refetch();
      setShowPaymentModal(false);
      setNewPayment({ amount: 0, method: 'cash', notes: '', receiptNumber: '' });
    },
    onError: (err) => {
      console.error('Error adding payment:', err);
      alert(err.message);
    },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600">Loading member details...</span>
      </div>
    );
  }

  if (error || !data?.member) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Member Not Found</h2>
          <p className="text-gray-500 mb-4">
            {error ? error.message : "The member you're looking for doesn't exist."}
          </p>
          <Button onClick={() => navigate('/dashboard/members')}>Back to Members</Button>
        </div>
      </div>
    );
  }

  const member: MemberData = data.member;

  const handleEdit = async (formData: any) => {
    try {
      await updateMember({
        variables: {
          id: member.id,
          input: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            address: formData.address ? {
              street: formData.address.street,
              city: formData.address.city,
              state: formData.address.state,
              zipCode: formData.address.zipCode,
              country: formData.address.country || 'India',
            } : undefined,
            membershipType: formData.subscriptionPlan || formData.membershipType,
            membershipStartDate: formData.membershipStartDate,
            membershipEndDate: formData.membershipEndDate,
            status: formData.status,
            emergencyContact: formData.emergencyContact ? {
              name: formData.emergencyContact.name,
              phone: formData.emergencyContact.phone,
              relationship: formData.emergencyContact.relation,
            } : undefined,
            payment: formData.payment ? {
              method: formData.payment.method,
              amount: formData.payment.amount,
              paidAmount: formData.payment.paidAmount,
              status: formData.payment.status,
            } : undefined,
            workoutProgram: formData.workoutProgram ? {
              goal: formData.workoutProgram.goal,
              startDate: formData.workoutProgram.startDate,
              notes: formData.workoutProgram.notes,
            } : undefined,
          },
        },
      });
    } catch (err) {
      console.error('Error in handleEdit:', err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMemberMutation({
        variables: { id: member.id },
      });
    } catch (err) {
      console.error('Error in handleDelete:', err);
    }
  };

  const handleAddPayment = async () => {
    if (newPayment.amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    try {
      await addPaymentMutation({
        variables: {
          memberId: member.id,
          payment: {
            amount: newPayment.amount,
            method: newPayment.method,
            notes: newPayment.notes,
            receiptNumber: newPayment.receiptNumber,
          },
        },
      });
    } catch (err) {
      console.error('Error in handleAddPayment:', err);
    }
  };

  const handleRenew = async () => {
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date();
    
    switch (member.membershipType) {
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

    try {
      await updateMember({
        variables: {
          id: member.id,
          input: {
            membershipStartDate: startDate,
            membershipEndDate: endDate.toISOString().split('T')[0],
            status: 'active',
            payment: {
              method: member.payment?.method || 'cash',
              amount: member.payment?.amount || 0,
              paidAmount: 0,
              status: 'pending',
            },
          },
        },
      });
    } catch (err) {
      console.error('Error in handleRenew:', err);
    }
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
            onClick={() => navigate('/dashboard/members')}
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
                      <span>DOB: {member.dateOfBirth ? formatDate(member.dateOfBirth) : 'N/A'}</span>
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
                    <p>{member.address?.street || 'N/A'}</p>
                    <p>{member.address?.city || ''}{member.address?.city && member.address?.state ? ', ' : ''}{member.address?.state || ''}</p>
                    <p>{member.address?.zipCode || ''}{member.address?.zipCode && member.address?.country ? ', ' : ''}{member.address?.country || ''}</p>
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
                    <p className="font-medium">{member.emergencyContact?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{member.emergencyContact?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Relation</p>
                    <p className="font-medium">{member.emergencyContact?.relationship || 'N/A'}</p>
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
                    <p className="font-medium capitalize">{member.workoutProgram.goal?.replace('-', ' ') || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium">{member.workoutProgram.startDate ? formatDate(member.workoutProgram.startDate) : 'N/A'}</p>
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
                  <p className="font-medium capitalize">{member.membershipType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-medium">{formatDate(member.membershipStartDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">End Date</p>
                  <p className="font-medium">{member.membershipEndDate ? formatDate(member.membershipEndDate) : 'N/A'}</p>
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" /> Payment Details
                </h3>
                {(member.payment?.status === 'pending' || member.payment?.status === 'partial') && (
                  <Button
                    size="sm"
                    onClick={() => setShowPaymentModal(true)}
                  >
                    Add Payment
                  </Button>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-medium text-lg">{formatCurrency(member.payment?.amount || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Paid Amount</p>
                  <p className="font-medium text-lg text-green-600">{formatCurrency(member.payment?.paidAmount || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Balance</p>
                  <p className="font-medium text-lg text-red-600">
                    {formatCurrency((member.payment?.amount || 0) - (member.payment?.paidAmount || 0))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium capitalize">{member.payment?.method?.replace('-', ' ') || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(member.payment?.status || '')}`}>
                    {member.payment?.status || 'N/A'}
                  </span>
                </div>
              </div>

              {member.paymentHistory && member.paymentHistory.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Payment History</h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {member.paymentHistory.map((record, index) => (
                      <div key={record.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-green-600">{formatCurrency(record.amount)}</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(record.date)} • <span className="capitalize">{record.method?.replace('-', ' ')}</span>
                          </p>
                          {record.notes && <p className="text-xs text-gray-400 mt-1">{record.notes}</p>}
                        </div>
                        {record.receiptNumber && (
                          <span className="text-xs text-gray-400">#{record.receiptNumber}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
            initialData={{
              firstName: member.firstName,
              lastName: member.lastName,
              email: member.email,
              phone: member.phone,
              dateOfBirth: member.dateOfBirth ? member.dateOfBirth.split('T')[0] : '',
              gender: (member.gender as 'male' | 'female' | 'other') || 'male',
              address: member.address ? {
                street: member.address.street || '',
                city: member.address.city || '',
                state: member.address.state || '',
                zipCode: member.address.zipCode || '',
                country: member.address.country || 'India',
              } : undefined,
              subscriptionPlan: member.membershipType as any,
              membershipStartDate: member.membershipStartDate ? member.membershipStartDate.split('T')[0] : '',
              membershipEndDate: member.membershipEndDate ? member.membershipEndDate.split('T')[0] : '',
              status: member.status as 'active' | 'inactive' | 'expired' | 'pending',
              emergencyContact: member.emergencyContact ? {
                name: member.emergencyContact.name || '',
                phone: member.emergencyContact.phone || '',
                relation: member.emergencyContact.relationship || '',
              } : undefined,
              payment: member.payment ? {
                method: member.payment.method as any || 'cash',
                status: member.payment.status as any || 'pending',
                amount: member.payment.amount || 0,
                paidAmount: member.payment.paidAmount || 0,
                dueDate: member.payment.dueDate ? member.payment.dueDate.split('T')[0] : '',
              } : undefined,
              workoutProgram: member.workoutProgram ? {
                goal: member.workoutProgram.goal as any || 'general-fitness',
                startDate: member.workoutProgram.startDate ? member.workoutProgram.startDate.split('T')[0] : '',
                notes: member.workoutProgram.notes || '',
              } : undefined,
            }}
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
              This will renew the {member.membershipType} plan for {member.firstName} {member.lastName}.
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

        <Modal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setNewPayment({ amount: 0, method: 'cash', notes: '', receiptNumber: '' });
          }}
          title="Add Payment"
          size="md"
        >
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Amount:</span>
                <span className="font-medium">{formatCurrency(member.payment?.amount || 0)}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-500">Already Paid:</span>
                <span className="font-medium text-green-600">{formatCurrency(member.payment?.paidAmount || 0)}</span>
              </div>
              <div className="flex justify-between text-sm mt-1 pt-2 border-t border-gray-200">
                <span className="text-gray-500">Balance Due:</span>
                <span className="font-medium text-red-600">
                  {formatCurrency((member.payment?.amount || 0) - (member.payment?.paidAmount || 0))}
                </span>
              </div>
            </div>

            <Input
              label="Amount"
              type="number"
              value={newPayment.amount}
              onChange={(e) => setNewPayment({ ...newPayment, amount: Number(e.target.value) })}
              required
            />

            <Select
              label="Payment Method"
              options={[
                { label: 'Cash', value: 'cash' },
                { label: 'Card', value: 'card' },
                { label: 'UPI', value: 'upi' },
                { label: 'Bank Transfer', value: 'bank-transfer' },
              ]}
              value={newPayment.method}
              onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value })}
              required
            />

            <Input
              label="Receipt Number"
              value={newPayment.receiptNumber}
              onChange={(e) => setNewPayment({ ...newPayment, receiptNumber: e.target.value })}
              placeholder="Optional"
            />

            <Input
              label="Notes"
              value={newPayment.notes}
              onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
              placeholder="Optional notes about this payment"
            />

            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowPaymentModal(false);
                  setNewPayment({ amount: 0, method: 'cash', notes: '', receiptNumber: '' });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAddPayment}>
                Record Payment
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
