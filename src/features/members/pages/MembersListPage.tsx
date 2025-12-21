import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Plus,
  Upload,
} from 'lucide-react';
import { Header } from '../../../components/layout';
import { Widget, DataTable, Button, Modal, Select } from '../../../components/ui';
import { useMemberStore } from '../../../stores/memberStore';
import { MemberForm } from '../components/MemberForm';
import { BulkUpload } from '../components/BulkUpload';
import { formatDate, formatCurrency, getStatusColor } from '../../../lib/utils';
import type { Member } from '../../../types';

export function MembersListPage() {
  const navigate = useNavigate();
  const { members, addMember, bulkAddMembers } = useMemberStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const activeMembers = members.filter((m) => m.status === 'active').length;
  const inactiveMembers = members.filter((m) => m.status === 'inactive').length;
  const expiredMembers = members.filter((m) => m.status === 'expired').length;
  const pendingMembers = members.filter((m) => m.status === 'pending').length;

  const filteredMembers = statusFilter === 'all'
    ? members
    : members.filter((m) => m.status === statusFilter);

  const columns = [
    {
      key: 'name',
      header: 'Member',
      sortable: true,
      render: (member: Member) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-medium text-sm">
              {member.firstName[0]}{member.lastName[0]}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {member.firstName} {member.lastName}
            </p>
            <p className="text-sm text-gray-500">{member.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      sortable: true,
    },
    {
      key: 'subscriptionPlan',
      header: 'Plan',
      sortable: true,
      render: (member: Member) => (
        <span className="capitalize">{member.subscriptionPlan}</span>
      ),
    },
    {
      key: 'membershipEndDate',
      header: 'Expires On',
      sortable: true,
      render: (member: Member) => formatDate(member.membershipEndDate),
    },
    {
      key: 'payment',
      header: 'Payment',
      render: (member: Member) => (
        <div>
          <p className="font-medium">{formatCurrency(member.payment.paidAmount)}</p>
          <p className="text-xs text-gray-500">of {formatCurrency(member.payment.amount)}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (member: Member) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(member.status)}`}>
          {member.status}
        </span>
      ),
    },
  ];

  const handleRowClick = (member: Member) => {
    navigate(`/members/${member.id}`);
  };

  const handleAddMember = (data: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>) => {
    addMember(data);
    setShowAddModal(false);
  };

  const handleBulkUpload = (membersData: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    bulkAddMembers(membersData);
  };

  const handleDownload = () => {
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Plan', 'Status', 'Start Date', 'End Date'];
    const rows = filteredMembers.map((m) => [
      m.firstName,
      m.lastName,
      m.email,
      m.phone,
      m.subscriptionPlan,
      m.status,
      m.membershipStartDate,
      m.membershipEndDate,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'members_export.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const filterComponent = (
    <div className="flex gap-4">
      <Select
        label="Status"
        options={[
          { label: 'All Status', value: 'all' },
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
          { label: 'Expired', value: 'expired' },
          { label: 'Pending', value: 'pending' },
        ]}
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      />
    </div>
  );

  return (
    <div>
      <Header
        title="Members"
        subtitle="Manage your gym members and their subscriptions"
      />
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Widget
            title="Total Members"
            value={members.length}
            icon={Users}
            color="blue"
          />
          <Widget
            title="Active Members"
            value={activeMembers}
            icon={UserCheck}
            color="green"
          />
          <Widget
            title="Inactive Members"
            value={inactiveMembers}
            icon={UserX}
            color="yellow"
          />
          <Widget
            title="Expired / Pending"
            value={expiredMembers + pendingMembers}
            icon={Clock}
            color="red"
          />
        </div>

        <div className="flex justify-end gap-3 mb-6">
          <Button
            variant="secondary"
            leftIcon={<Upload className="w-4 h-4" />}
            onClick={() => setShowBulkUpload(true)}
          >
            Bulk Upload
          </Button>
          <Button
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowAddModal(true)}
          >
            Add Member
          </Button>
        </div>

        <DataTable
          data={filteredMembers}
          columns={columns}
          onRowClick={handleRowClick}
          searchPlaceholder="Search members..."
          onDownload={handleDownload}
          filterComponent={filterComponent}
          emptyMessage="No members found"
        />

        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add New Member"
          size="xl"
        >
          <MemberForm
            onSubmit={handleAddMember}
            onCancel={() => setShowAddModal(false)}
          />
        </Modal>

        <Modal
          isOpen={showBulkUpload}
          onClose={() => setShowBulkUpload(false)}
          title="Bulk Upload"
          size="lg"
        >
          <BulkUpload
            onUpload={handleBulkUpload}
            onClose={() => setShowBulkUpload(false)}
          />
        </Modal>
      </div>
    </div>
  );
}
