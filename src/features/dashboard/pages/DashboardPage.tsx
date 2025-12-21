import {
  Users,
  UserCheck,
  UserX,
  Clock,
  IndianRupee,
  TrendingUp,
  Calendar,
  Dumbbell,
} from 'lucide-react';
import { Header } from '../../../components/layout';
import { Widget } from '../../../components/ui';
import { useMemberStore } from '../../../stores/memberStore';
import { useTrainerStore } from '../../../stores/trainerStore';
import { useEventStore } from '../../../stores/eventStore';
import { useFollowUpStore } from '../../../stores/followUpStore';
import { formatCurrency } from '../../../lib/utils';

export function DashboardPage() {
  const members = useMemberStore((state) => state.members);
  const trainers = useTrainerStore((state) => state.trainers);
  const events = useEventStore((state) => state.events);
  const followUps = useFollowUpStore((state) => state.followUps);

  const activeMembers = members.filter((m) => m.status === 'active').length;
  const inactiveMembers = members.filter((m) => m.status === 'inactive').length;
  const expiredMembers = members.filter((m) => m.status === 'expired').length;
  const pendingMembers = members.filter((m) => m.status === 'pending').length;
  const activeTrainers = trainers.filter((t) => t.status === 'active').length;
  const upcomingEvents = events.filter((e) => e.status === 'upcoming').length;
  const pendingFollowUps = followUps.filter((f) => f.status === 'pending').length;

  const totalRevenue = members.reduce((sum, m) => sum + m.payment.paidAmount, 0);
  const pendingPayments = members
    .filter((m) => m.payment.status === 'pending' || m.payment.status === 'overdue')
    .reduce((sum, m) => sum + (m.payment.amount - m.payment.paidAmount), 0);

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
            value={members.length}
            icon={Users}
            color="blue"
            trend={{ value: 12, isPositive: true }}
          />
          <Widget
            title="Active Members"
            value={activeMembers}
            icon={UserCheck}
            color="green"
            trend={{ value: 8, isPositive: true }}
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Widget
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
            icon={IndianRupee}
            color="green"
            trend={{ value: 15, isPositive: true }}
          />
          <Widget
            title="Pending Payments"
            value={formatCurrency(pendingPayments)}
            icon={TrendingUp}
            color="red"
          />
          <Widget
            title="Active Trainers"
            value={activeTrainers}
            icon={Dumbbell}
            color="purple"
          />
          <Widget
            title="Upcoming Events"
            value={upcomingEvents}
            icon={Calendar}
            color="blue"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {members.slice(0, 5).map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-medium">
                        {member.firstName[0]}
                        {member.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                  </div>
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
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Pending Follow-ups
            </h3>
            <div className="space-y-4">
              {followUps
                .filter((f) => f.status === 'pending')
                .slice(0, 5)
                .map((followUp) => (
                  <div
                    key={followUp.id}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {followUp.memberName}
                      </p>
                      <p className="text-sm text-gray-500">{followUp.type}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          followUp.priority === 'high'
                            ? 'bg-red-100 text-red-800'
                            : followUp.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {followUp.priority}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {followUp.scheduledDate}
                      </p>
                    </div>
                  </div>
                ))}
              {pendingFollowUps === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No pending follow-ups
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
