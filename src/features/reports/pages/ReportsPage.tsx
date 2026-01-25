import { useState, useMemo, useEffect } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  CreditCard,
  CalendarClock,
  Package,
  TrendingUp,
  TrendingDown,
  UserPlus,
  UserMinus,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Download,
  Filter,
  Search,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  DollarSign,
  Calendar,
  Activity,
} from 'lucide-react';
import { Header } from '../../../components/layout';
import { Button, SearchSuggestions } from '../../../components/ui';
import { GET_MEMBERS, SEARCH_MEMBER_SUGGESTIONS } from '../../../graphql/members';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { Loader2 } from 'lucide-react';

type ReportCategory = 'members' | 'payments' | 'expiry' | 'services';
type MemberReportType = 'total' | 'active' | 'inactive' | 'new';
type PaymentReportType = 'full' | 'partial' | 'pending' | 'history';
type ExpiryReportType = 'expired' | 'upcoming' | 'renewed' | 'renewal-pending';
type ServiceReportType = 'membership' | 'pt' | 'packages';

interface ReportCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  onClick?: () => void;
}

function ReportCard({ title, value, subtitle, icon, trend, trendValue, color, onClick }: ReportCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  };

  const iconBgClasses = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    yellow: 'bg-yellow-100',
    red: 'bg-red-100',
    purple: 'bg-purple-100',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border p-5 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-lg ${iconBgClasses[color]}`}>
          {icon}
        </div>
        {trend && trendValue && (
          <div className={`flex items-center gap-1 text-sm ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : trend === 'down' ? <TrendingDown className="w-4 h-4" /> : null}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <p className="text-sm text-gray-500 mt-1">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      {onClick && (
        <div className="mt-3 flex items-center text-sm text-primary-600 font-medium">
          View Details <ChevronRight className="w-4 h-4 ml-1" />
        </div>
      )}
    </div>
  );
}

interface MemberRowProps {
  member: any;
  showPayment?: boolean;
  showExpiry?: boolean;
}

function MemberRow({ member, showPayment, showExpiry }: MemberRowProps) {
  const balance = (member.payment?.amount || 0) - (member.payment?.paidAmount || 0);
  
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-medium text-sm">
              {member.firstName?.[0]}{member.lastName?.[0]}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{member.firstName} {member.lastName}</p>
            <p className="text-xs text-gray-500">{member.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">{member.phone || 'N/A'}</td>
      <td className="px-4 py-3">
        <span className="capitalize text-sm">{member.membershipType}</span>
      </td>
      {showPayment && (
        <>
          <td className="px-4 py-3 text-sm">{formatCurrency(member.payment?.amount || 0)}</td>
          <td className="px-4 py-3 text-sm text-green-600">{formatCurrency(member.payment?.paidAmount || 0)}</td>
          <td className="px-4 py-3 text-sm text-red-600">{formatCurrency(balance)}</td>
        </>
      )}
      {showExpiry && (
        <>
          <td className="px-4 py-3 text-sm">{member.membershipStartDate ? formatDate(member.membershipStartDate) : 'N/A'}</td>
          <td className="px-4 py-3 text-sm">{member.membershipEndDate ? formatDate(member.membershipEndDate) : 'N/A'}</td>
        </>
      )}
      <td className="px-4 py-3">
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize
          ${member.status === 'active' ? 'bg-green-100 text-green-700' : 
            member.status === 'inactive' ? 'bg-gray-100 text-gray-700' : 
            member.status === 'expired' ? 'bg-red-100 text-red-700' : 
            'bg-yellow-100 text-yellow-700'}`}>
          {member.status}
        </span>
      </td>
    </tr>
  );
}

export function ReportsPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<ReportCategory>('members');
  const [memberReportType, setMemberReportType] = useState<MemberReportType>('total');
  const [paymentReportType, setPaymentReportType] = useState<PaymentReportType>('pending');
  const [expiryReportType, setExpiryReportType] = useState<ExpiryReportType>('upcoming');
  const [serviceReportType, setServiceReportType] = useState<ServiceReportType>('membership');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Build filter based on active category and report type
  const getStatusFilter = () => {
    if (activeCategory === 'members') {
      switch (memberReportType) {
        case 'active': return 'active';
        case 'inactive': return 'inactive';
        default: return undefined;
      }
    }
    if (activeCategory === 'expiry') {
      switch (expiryReportType) {
        case 'expired': return 'expired';
        case 'renewed': return 'active';
        default: return undefined;
      }
    }
    return undefined;
  };

  const statusFilter = getStatusFilter();

  // Main query for paginated data
  const { data: membersData, loading, error, refetch } = useQuery(GET_MEMBERS, {
    variables: {
      filter: {
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(searchQuery ? { search: searchQuery } : {}),
      },
      pagination: { page: currentPage, limit: itemsPerPage },
    },
    fetchPolicy: 'network-only',
  });

  // Query for all members (for stats calculation)
  const { data: allMembersData } = useQuery(GET_MEMBERS, {
    variables: {
      pagination: { page: 1, limit: 10000 },
    },
    fetchPolicy: 'cache-first',
  });

  // Lazy query for CSV export
  const [fetchAllForExport, { loading: exportLoading }] = useLazyQuery(GET_MEMBERS, {
    fetchPolicy: 'network-only',
  });

  const members = membersData?.members?.members || [];
  const allMembers = allMembersData?.members?.members || [];
  const serverStats = allMembersData?.members?.stats;
  const serverTotal = membersData?.members?.total || 0;
  const serverTotalPages = membersData?.members?.totalPages || 1;
  
  // Use allMembers for stats calculations (full dataset)
  const dataForStats = allMembers.length > 0 ? allMembers : members;
  
  // Calculate statistics from full dataset
  const totalMembersCount = serverStats?.total || dataForStats.length;
  const activeMembersCount = serverStats?.active || dataForStats.filter((m: any) => m.status === 'active').length;
  const inactiveMembersCount = serverStats?.inactive || dataForStats.filter((m: any) => m.status === 'inactive').length;
  const expiredMembersCount = serverStats?.expired || dataForStats.filter((m: any) => m.status === 'expired').length;
  
  // Filter arrays for display
  const activeMembers = dataForStats.filter((m: any) => m.status === 'active');
  const inactiveMembers = dataForStats.filter((m: any) => m.status === 'inactive');
  const expiredMembers = dataForStats.filter((m: any) => m.status === 'expired');
  
  // New members (joined in last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newMembers = dataForStats.filter((m: any) => new Date(m.createdAt) >= thirtyDaysAgo);
  
  // Payment calculations from full dataset
  const fullPaymentMembers = dataForStats.filter((m: any) => 
    m.payment?.status === 'paid' || (m.payment?.paidAmount >= m.payment?.amount && m.payment?.amount > 0)
  );
  const partialPaymentMembers = dataForStats.filter((m: any) => 
    m.payment?.status === 'partial' || (m.payment?.paidAmount > 0 && m.payment?.paidAmount < m.payment?.amount)
  );
  const pendingPaymentMembers = dataForStats.filter((m: any) => {
    const balance = (m.payment?.amount || 0) - (m.payment?.paidAmount || 0);
    return balance > 0;
  });
  
  const totalPendingDues = pendingPaymentMembers.reduce((sum: number, m: any) => {
    return sum + ((m.payment?.amount || 0) - (m.payment?.paidAmount || 0));
  }, 0);

  // Expiry calculations
  const today = new Date();
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(today.getDate() + 7);
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(today.getDate() + 30);

  const expiredMembersList = dataForStats.filter((m: any) => {
    if (!m.membershipEndDate) return false;
    return new Date(m.membershipEndDate) < today;
  });

  const upcomingExpiryMembers = dataForStats.filter((m: any) => {
    if (!m.membershipEndDate) return false;
    const endDate = new Date(m.membershipEndDate);
    return endDate >= today && endDate <= thirtyDaysLater;
  });

  // Membership type breakdown from full dataset
  const membershipBreakdown = {
    monthly: dataForStats.filter((m: any) => m.membershipType === 'monthly').length,
    quarterly: dataForStats.filter((m: any) => m.membershipType === 'quarterly').length,
    halfYearly: dataForStats.filter((m: any) => m.membershipType === 'half-yearly').length,
    yearly: dataForStats.filter((m: any) => m.membershipType === 'yearly').length,
  };

  // Get current report data based on category and type
  // For server-side filtered data, use members directly
  // For client-side filtered data (payment/expiry specific), filter from allMembers
  const getCurrentReportData = () => {
    // If we have a search query, the server already filtered, use members
    if (searchQuery) {
      return members;
    }
    
    switch (activeCategory) {
      case 'members':
        switch (memberReportType) {
          case 'total': return members; // Server handles this
          case 'active': return members; // Server filters by status
          case 'inactive': return members; // Server filters by status
          case 'new': return newMembers; // Client-side filter for date
        }
        break;
      case 'payments':
        // Payment filtering is client-side
        switch (paymentReportType) {
          case 'full': return fullPaymentMembers;
          case 'partial': return partialPaymentMembers;
          case 'pending': return pendingPaymentMembers;
          case 'history': return dataForStats;
        }
        break;
      case 'expiry':
        switch (expiryReportType) {
          case 'expired': return members; // Server filters by status
          case 'upcoming': return upcomingExpiryMembers; // Client-side date filter
          case 'renewed': return members; // Server filters by status=active
          case 'renewal-pending': return [...expiredMembersList, ...upcomingExpiryMembers];
        }
        break;
      case 'services':
        return dataForStats;
    }
    return [];
  };

  const reportData = getCurrentReportData();
  
  // Use server pagination for member/expiry reports with status filter
  // Use client pagination for payment reports and special filters
  const useServerPagination = (activeCategory === 'members' && memberReportType !== 'new') ||
    (activeCategory === 'expiry' && (expiryReportType === 'expired' || expiryReportType === 'renewed'));
  
  const totalItems = useServerPagination ? serverTotal : reportData.length;
  const totalPages = useServerPagination ? serverTotalPages : Math.ceil(reportData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = useServerPagination ? members : reportData.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleCategoryChange = (category: ReportCategory) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  const handleMemberReportTypeChange = (type: MemberReportType) => {
    setMemberReportType(type);
    setCurrentPage(1);
  };

  const handlePaymentReportTypeChange = (type: PaymentReportType) => {
    setPaymentReportType(type);
    setCurrentPage(1);
  };

  const handleExpiryReportTypeChange = (type: ExpiryReportType) => {
    setExpiryReportType(type);
    setCurrentPage(1);
  };

  const handleServiceReportTypeChange = (type: ServiceReportType) => {
    setServiceReportType(type);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const categories = [
    { id: 'members' as ReportCategory, label: 'Member Reports', icon: Users },
    { id: 'payments' as ReportCategory, label: 'Payment Reports', icon: CreditCard },
    { id: 'expiry' as ReportCategory, label: 'Expiry & Renewal', icon: CalendarClock },
    { id: 'services' as ReportCategory, label: 'Service Reports', icon: Package },
  ];

  const handleExportCSV = async () => {
    try {
      // Fetch all data for export with current filters
      const result = await fetchAllForExport({
        variables: {
          filter: {
            ...(statusFilter ? { status: statusFilter } : {}),
            ...(searchQuery ? { search: searchQuery } : {}),
          },
          pagination: { page: 1, limit: 10000 },
        },
      });

      const exportData = result.data?.members?.members || [];
      if (exportData.length === 0) {
        alert('No data to export');
        return;
      }

      const headers = ['Name', 'Email', 'Phone', 'Membership Type', 'Status', 'Start Date', 'End Date', 'Amount', 'Paid', 'Balance'];
      const csvContent = [
        headers.join(','),
        ...exportData.map((m: any) => [
          `"${m.firstName} ${m.lastName}"`,
          m.email,
          m.phone || '',
          m.membershipType,
          m.status,
          m.membershipStartDate || '',
          m.membershipEndDate || '',
          m.payment?.amount || 0,
          m.payment?.paidAmount || 0,
          (m.payment?.amount || 0) - (m.payment?.paidAmount || 0),
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeCategory}-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting CSV:', err);
      alert('Failed to export data');
    }
  };

  return (
    <div>
      <Header
        title="Reports"
        subtitle="View and analyze gym data with detailed reports"
      />

      <div className="p-6">
        {/* Category Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 p-1 mb-6">
          <div className="flex gap-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all
                  ${activeCategory === cat.id 
                    ? 'bg-primary-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <cat.icon className="w-5 h-5" />
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        {activeCategory === 'members' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <ReportCard
              title="Total Members"
              value={totalMembersCount}
              icon={<Users className="w-6 h-6 text-blue-600" />}
              color="blue"
              onClick={() => handleMemberReportTypeChange('total')}
            />
            <ReportCard
              title="Active Members"
              value={activeMembersCount}
              subtitle={`${((activeMembersCount / totalMembersCount) * 100 || 0).toFixed(1)}% of total`}
              icon={<CheckCircle className="w-6 h-6 text-green-600" />}
              color="green"
              onClick={() => handleMemberReportTypeChange('active')}
            />
            <ReportCard
              title="Inactive Members"
              value={inactiveMembersCount}
              icon={<UserMinus className="w-6 h-6 text-yellow-600" />}
              color="yellow"
              onClick={() => handleMemberReportTypeChange('inactive')}
            />
            <ReportCard
              title="New Members (30 days)"
              value={newMembers.length}
              icon={<UserPlus className="w-6 h-6 text-purple-600" />}
              color="purple"
              trend="up"
              trendValue={`+${newMembers.length}`}
              onClick={() => handleMemberReportTypeChange('new')}
            />
          </div>
        )}

        {activeCategory === 'payments' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <ReportCard
              title="Full Payment Members"
              value={fullPaymentMembers.length}
              icon={<CheckCircle className="w-6 h-6 text-green-600" />}
              color="green"
              onClick={() => setPaymentReportType('full')}
            />
            <ReportCard
              title="Partial Payment"
              value={partialPaymentMembers.length}
              icon={<Clock className="w-6 h-6 text-yellow-600" />}
              color="yellow"
              onClick={() => setPaymentReportType('partial')}
            />
            <ReportCard
              title="Pending Payments"
              value={pendingPaymentMembers.length}
              icon={<AlertCircle className="w-6 h-6 text-red-600" />}
              color="red"
              onClick={() => setPaymentReportType('pending')}
            />
            <ReportCard
              title="Total Pending Dues"
              value={formatCurrency(totalPendingDues)}
              icon={<DollarSign className="w-6 h-6 text-red-600" />}
              color="red"
            />
          </div>
        )}

        {activeCategory === 'expiry' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <ReportCard
              title="Expired Memberships"
              value={expiredMembersList.length}
              icon={<AlertCircle className="w-6 h-6 text-red-600" />}
              color="red"
              onClick={() => setExpiryReportType('expired')}
            />
            <ReportCard
              title="Expiring Soon (30 days)"
              value={upcomingExpiryMembers.length}
              icon={<Clock className="w-6 h-6 text-yellow-600" />}
              color="yellow"
              onClick={() => setExpiryReportType('upcoming')}
            />
            <ReportCard
              title="Renewed Members"
              value={activeMembers.length}
              icon={<RefreshCw className="w-6 h-6 text-green-600" />}
              color="green"
              onClick={() => setExpiryReportType('renewed')}
            />
            <ReportCard
              title="Renewal Pending"
              value={expiredMembersList.length + upcomingExpiryMembers.length}
              icon={<CalendarClock className="w-6 h-6 text-purple-600" />}
              color="purple"
              onClick={() => setExpiryReportType('renewal-pending')}
            />
          </div>
        )}

        {activeCategory === 'services' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <ReportCard
              title="Monthly Plans"
              value={membershipBreakdown.monthly}
              icon={<Calendar className="w-6 h-6 text-blue-600" />}
              color="blue"
              onClick={() => setServiceReportType('membership')}
            />
            <ReportCard
              title="Quarterly Plans"
              value={membershipBreakdown.quarterly}
              icon={<Calendar className="w-6 h-6 text-green-600" />}
              color="green"
              onClick={() => setServiceReportType('membership')}
            />
            <ReportCard
              title="Half-Yearly Plans"
              value={membershipBreakdown.halfYearly}
              icon={<Calendar className="w-6 h-6 text-yellow-600" />}
              color="yellow"
              onClick={() => setServiceReportType('membership')}
            />
            <ReportCard
              title="Yearly Plans"
              value={membershipBreakdown.yearly}
              icon={<Calendar className="w-6 h-6 text-purple-600" />}
              color="purple"
              onClick={() => setServiceReportType('membership')}
            />
          </div>
        )}

        {/* Sub-category filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {activeCategory === 'members' && (
                <>
                  {[
                    { id: 'total', label: 'All Members' },
                    { id: 'active', label: 'Active' },
                    { id: 'inactive', label: 'Inactive' },
                    { id: 'new', label: 'New (30 days)' },
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handleMemberReportTypeChange(type.id as MemberReportType)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                        ${memberReportType === type.id 
                          ? 'bg-primary-100 text-primary-700' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {type.label}
                    </button>
                  ))}
                </>
              )}
              {activeCategory === 'payments' && (
                <>
                  {[
                    { id: 'full', label: 'Full Payment' },
                    { id: 'partial', label: 'Partial Payment' },
                    { id: 'pending', label: 'Pending Dues' },
                    { id: 'history', label: 'Payment History' },
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handlePaymentReportTypeChange(type.id as PaymentReportType)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                        ${paymentReportType === type.id 
                          ? 'bg-primary-100 text-primary-700' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {type.label}
                    </button>
                  ))}
                </>
              )}
              {activeCategory === 'expiry' && (
                <>
                  {[
                    { id: 'expired', label: 'Expired' },
                    { id: 'upcoming', label: 'Expiring Soon' },
                    { id: 'renewed', label: 'Renewed' },
                    { id: 'renewal-pending', label: 'Renewal Pending' },
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handleExpiryReportTypeChange(type.id as ExpiryReportType)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                        ${expiryReportType === type.id 
                          ? 'bg-primary-100 text-primary-700' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {type.label}
                    </button>
                  ))}
                </>
              )}
              {activeCategory === 'services' && (
                <>
                  {[
                    { id: 'membership', label: 'Membership Plans' },
                    { id: 'pt', label: 'Personal Training' },
                    { id: 'packages', label: 'Packages' },
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handleServiceReportTypeChange(type.id as ServiceReportType)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                        ${serviceReportType === type.id 
                          ? 'bg-primary-100 text-primary-700' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {type.label}
                    </button>
                  ))}
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <SearchSuggestions
                query={SEARCH_MEMBER_SUGGESTIONS}
                placeholder="Search by name or phone..."
                onSelect={(member) => navigate(`/dashboard/members/${member.id}`)}
                onSearch={handleSearchChange}
                className="w-64"
              />
              <Button
                variant="secondary"
                size="sm"
                leftIcon={exportLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                onClick={handleExportCSV}
                disabled={exportLoading}
              >
                {exportLoading ? 'Exporting...' : 'Export CSV'}
              </Button>
            </div>
          </div>
        </div>

        {/* Report Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {activeCategory === 'members' && (
                    memberReportType === 'total' ? 'All Members' :
                    memberReportType === 'active' ? 'Active Members' :
                    memberReportType === 'inactive' ? 'Inactive Members' : 'New Members'
                  )}
                  {activeCategory === 'payments' && (
                    paymentReportType === 'full' ? 'Full Payment Members' :
                    paymentReportType === 'partial' ? 'Partial Payment Members' :
                    paymentReportType === 'pending' ? 'Pending Payment Members' : 'Payment History'
                  )}
                  {activeCategory === 'expiry' && (
                    expiryReportType === 'expired' ? 'Expired Memberships' :
                    expiryReportType === 'upcoming' ? 'Expiring Soon' :
                    expiryReportType === 'renewed' ? 'Renewed Members' : 'Renewal Pending'
                  )}
                  {activeCategory === 'services' && 'Membership Plans Report'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {totalItems} records found {totalItems > 0 && `• Showing ${startIndex + 1}-${Math.min(endIndex, totalItems)} of ${totalItems}`}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FileText className="w-4 h-4" />
                Generated on {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-8 flex flex-col items-center justify-center text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600 mb-3" />
              <p>Loading report data...</p>
            </div>
          ) : paginatedData.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No data found for this report</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Member</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Plan</th>
                    {(activeCategory === 'payments') && (
                      <>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Paid</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Balance</th>
                      </>
                    )}
                    {(activeCategory === 'expiry') && (
                      <>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Start Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">End Date</th>
                      </>
                    )}
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedData.map((member: any) => (
                    <MemberRow
                      key={member.id}
                      member={member}
                      showPayment={activeCategory === 'payments'}
                      showExpiry={activeCategory === 'expiry'}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalItems > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Rows per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="First page"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors
                          ${currentPage === pageNum 
                            ? 'bg-primary-600 text-white' 
                            : 'hover:bg-gray-100 text-gray-600'}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Last page"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
            </div>
          )}
        </div>

        {/* Summary Footer for Services */}
        {activeCategory === 'services' && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Membership Plan Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Monthly</p>
                <p className="text-2xl font-bold text-blue-700">{membershipBreakdown.monthly}</p>
                <p className="text-xs text-blue-500 mt-1">₹3,000/month</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Quarterly</p>
                <p className="text-2xl font-bold text-green-700">{membershipBreakdown.quarterly}</p>
                <p className="text-xs text-green-500 mt-1">₹8,000/quarter</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-600 font-medium">Half-Yearly</p>
                <p className="text-2xl font-bold text-yellow-700">{membershipBreakdown.halfYearly}</p>
                <p className="text-xs text-yellow-500 mt-1">₹15,000/6 months</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">Yearly</p>
                <p className="text-2xl font-bold text-purple-700">{membershipBreakdown.yearly}</p>
                <p className="text-xs text-purple-500 mt-1">₹25,000/year</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
