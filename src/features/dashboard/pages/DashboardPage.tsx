import { useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  IndianRupee,
  TrendingUp,
  Calendar,
  Dumbbell,
  Loader2,
} from 'lucide-react';
import { Header } from '../../../components/layout';
import { Widget } from '../../../components/ui';
import { GET_MEMBERS } from '../../../graphql/members';
import { GET_TRAINERS } from '../../../graphql/trainers';
import { GET_EVENTS } from '../../../graphql/events';
import { GET_FOLLOWUPS } from '../../../graphql/followups';
import { formatCurrency, formatDate } from '../../../lib/utils';

interface MemberData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  createdAt: string;
  payment?: {
    amount?: number;
    paidAmount?: number;
    status?: string;
  };
}

interface FollowupData {
  id: string;
  title: string;
  type: string;
  status: string;
  priority: string;
  scheduledDate: string;
  member?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export function DashboardPage() {
  const navigate = useNavigate();

  // Fetch members data
  const { data: membersData, loading: membersLoading } = useQuery(GET_MEMBERS, {
    variables: { pagination: { page: 1, limit: 1000 } },
    fetchPolicy: 'network-only',
  });

  // Fetch trainers data
  const { data: trainersData, loading: trainersLoading } = useQuery(GET_TRAINERS, {
    variables: { pagination: { page: 1, limit: 100 } },
    fetchPolicy: 'network-only',
  });

  // Fetch events data
  const { data: eventsData, loading: eventsLoading } = useQuery(GET_EVENTS, {
    variables: { pagination: { page: 1, limit: 100 } },
    fetchPolicy: 'network-only',
  });

  // Fetch followups data
  const { data: followupsData, loading: followupsLoading } = useQuery(GET_FOLLOWUPS, {
    variables: { filter: { status: 'pending' }, pagination: { page: 1, limit: 10 } },
    fetchPolicy: 'network-only',
  });

  const loading = membersLoading || trainersLoading || eventsLoading || followupsLoading;

  const members: MemberData[] = membersData?.members?.members || [];
  const memberStats = membersData?.members?.stats || {};
  const trainers = trainersData?.trainers?.trainers || [];
  const events = eventsData?.events?.events || [];
  const eventStats = eventsData?.events?.stats || {};
  const followups: FollowupData[] = followupsData?.followups?.followups || [];

  // Use stats from API when available
  const totalMembers = memberStats.total || members.length;
  const activeMembers = memberStats.active || members.filter((m) => m.status === 'active').length;
  const inactiveMembers = memberStats.inactive || members.filter((m) => m.status === 'inactive').length;
  const expiredMembers = memberStats.expired || members.filter((m) => m.status === 'expired').length;
  const pendingMembers = members.filter((m) => m.status === 'pending').length;
  
  const activeTrainers = trainers.filter((t: any) => t.status === 'active').length;
  const upcomingEvents = eventStats.upcoming || events.filter((e: any) => e.status === 'upcoming').length;

  // Calculate revenue from members
  const totalRevenue = members.reduce((sum: number, m) => sum + (m.payment?.paidAmount || 0), 0);
  const pendingPayments = members
    .filter((m) => m.payment?.status === 'pending' || m.payment?.status === 'partial')
    .reduce((sum: number, m) => sum + ((m.payment?.amount || 0) - (m.payment?.paidAmount || 0)), 0);

  // Get recent members (sorted by createdAt)
  const recentMembers = [...members]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div>
        <Header
          title="Dashboard"
          subtitle="Welcome back! Here's what's happening at your gym."
        />
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            <p className="text-gray-500">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening at your gym."
      />
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Widget
            title="Total Members"
            value={totalMembers}
            icon={Users}
            color="blue"
            onClick={() => navigate('/dashboard/members')}
          />
          <Widget
            title="Active Members"
            value={activeMembers}
            icon={UserCheck}
            color="green"
            onClick={() => navigate('/dashboard/members?status=active')}
          />
          <Widget
            title="Inactive Members"
            value={inactiveMembers}
            icon={UserX}
            color="yellow"
            onClick={() => navigate('/dashboard/members?status=inactive')}
          />
          <Widget
            title="Expired / Pending"
            value={expiredMembers + pendingMembers}
            icon={Clock}
            color="red"
            onClick={() => navigate('/dashboard/members?status=expired')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Widget
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
            icon={IndianRupee}
            color="green"
            onClick={() => navigate('/dashboard/reports')}
          />
          <Widget
            title="Pending Payments"
            value={formatCurrency(pendingPayments)}
            icon={TrendingUp}
            color="red"
            onClick={() => navigate('/dashboard/reports')}
          />
          <Widget
            title="Active Trainers"
            value={activeTrainers}
            icon={Dumbbell}
            color="purple"
            onClick={() => navigate('/dashboard/trainers')}
          />
          <Widget
            title="Upcoming Events"
            value={upcomingEvents}
            icon={Calendar}
            color="blue"
            onClick={() => navigate('/dashboard/events')}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {recentMembers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No members yet</p>
              ) : (
                recentMembers.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => navigate(`/dashboard/members/${member.id}`)}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-medium">
                          {member.firstName?.[0]}
                          {member.lastName?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          member.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : member.status === 'expired'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {member.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(member.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Pending Follow-ups
            </h3>
            <div className="space-y-4">
              {followups.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No pending follow-ups
                </p>
              ) : (
                followups.slice(0, 5).map((followup) => (
                  <div
                    key={followup.id}
                    onClick={() => navigate('/dashboard/followups')}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {followup.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {followup.member ? `${followup.member.firstName} ${followup.member.lastName}` : followup.type}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          followup.priority === 'high'
                            ? 'bg-red-100 text-red-800'
                            : followup.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {followup.priority}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(followup.scheduledDate)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
