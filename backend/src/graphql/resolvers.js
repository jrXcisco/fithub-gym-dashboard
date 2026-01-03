const User = require('../models/User');
const Member = require('../models/Member');
const Trainer = require('../models/Trainer');
const Followup = require('../models/Followup');
const Resource = require('../models/Resource');
const Event = require('../models/Event');
const { generateToken, verifyToken } = require('../utils/auth');

const getGymUuid = async (user) => {
  if (!user) {
    throw new Error('Not authenticated');
  }
  const currentUser = await User.findById(user.userId);
  if (!currentUser) {
    throw new Error('User not found');
  }
  if (currentUser.role !== 'admin' || !currentUser.gymUuid) {
    throw new Error('Only gym admins can perform this action');
  }
  return currentUser.gymUuid;
};

const formatDate = (date) => {
  return date ? date.toISOString() : null;
};

const resolvers = {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      return await User.findById(user.userId);
    },
    users: async (_, __, { user }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      return await User.find({});
    },
    usersCount: async () => {
      return await User.countDocuments();
    },

    // Member Queries
    member: async (_, { id }, { user }) => {
      const gymUuid = await getGymUuid(user);
      const member = await Member.findOne({ _id: id, gymUuid }).populate('assignedTrainer');
      if (!member) {
        throw new Error('Member not found');
      }
      return member;
    },

    members: async (_, { filter, pagination }, { user }) => {
      const gymUuid = await getGymUuid(user);
      const safeFilter = filter || {};
      const safePagination = pagination || {};
      const { page = 1, limit = 10 } = safePagination;
      const skip = (page - 1) * limit;

      const query = { gymUuid };

      if (safeFilter.status) query.status = safeFilter.status;
      if (safeFilter.membershipType) query.membershipType = safeFilter.membershipType;
      if (safeFilter.assignedTrainer) query.assignedTrainer = safeFilter.assignedTrainer;
      if (safeFilter.search) {
        query.$or = [
          { firstName: { $regex: safeFilter.search, $options: 'i' } },
          { lastName: { $regex: safeFilter.search, $options: 'i' } },
          { email: { $regex: safeFilter.search, $options: 'i' } },
          { phone: { $regex: safeFilter.search, $options: 'i' } },
        ];
      }

      const [members, total, totalAll, activeCount, inactiveCount, expiredCount] = await Promise.all([
        Member.find(query).populate('assignedTrainer').skip(skip).limit(limit).sort({ createdAt: -1 }),
        Member.countDocuments(query),
        Member.countDocuments({ gymUuid }),
        Member.countDocuments({ gymUuid, status: 'active' }),
        Member.countDocuments({ gymUuid, status: 'inactive' }),
        Member.countDocuments({ gymUuid, status: 'expired' }),
      ]);

      return {
        members,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        stats: {
          total: totalAll,
          active: activeCount,
          inactive: inactiveCount,
          expired: expiredCount,
        },
      };
    },

    membersCount: async (_, __, { user }) => {
      const gymUuid = await getGymUuid(user);
      return await Member.countDocuments({ gymUuid });
    },

    // Trainer Queries
    trainer: async (_, { id }, { user }) => {
      const gymUuid = await getGymUuid(user);
      const trainer = await Trainer.findOne({ _id: id, gymUuid });
      if (!trainer) {
        throw new Error('Trainer not found');
      }
      return trainer;
    },

    trainers: async (_, { filter, pagination }, { user }) => {
      const gymUuid = await getGymUuid(user);
      const safeFilter = filter || {};
      const safePagination = pagination || {};
      const { page = 1, limit = 10 } = safePagination;
      const skip = (page - 1) * limit;

      const query = { gymUuid };

      if (safeFilter.status) query.status = safeFilter.status;
      if (safeFilter.role) query.role = safeFilter.role;
      if (safeFilter.specialization) query.specializations = safeFilter.specialization;
      if (safeFilter.search) {
        query.$or = [
          { firstName: { $regex: safeFilter.search, $options: 'i' } },
          { lastName: { $regex: safeFilter.search, $options: 'i' } },
          { email: { $regex: safeFilter.search, $options: 'i' } },
          { phone: { $regex: safeFilter.search, $options: 'i' } },
        ];
      }

      const [trainers, total, allTrainers] = await Promise.all([
        Trainer.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
        Trainer.countDocuments(query),
        Trainer.find({ gymUuid }),
      ]);

      const activeCount = allTrainers.filter(t => t.status === 'active').length;
      const trainersRoleCount = allTrainers.filter(t => t.role === 'trainer').length;
      const totalSalary = allTrainers.filter(t => t.status === 'active').reduce((sum, t) => sum + (t.salary || 0), 0);

      return {
        trainers,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        stats: {
          total: allTrainers.length,
          active: activeCount,
          trainers: trainersRoleCount,
          totalSalary,
        },
      };
    },

    trainersCount: async (_, __, { user }) => {
      const gymUuid = await getGymUuid(user);
      return await Trainer.countDocuments({ gymUuid });
    },

    // Followup Queries
    followup: async (_, { id }, { user }) => {
      const gymUuid = await getGymUuid(user);
      const followup = await Followup.findOne({ _id: id, gymUuid })
        .populate('member')
        .populate('trainer')
        .populate('createdBy');
      if (!followup) {
        throw new Error('Followup not found');
      }
      return followup;
    },

    followups: async (_, { filter, pagination }, { user }) => {
      const gymUuid = await getGymUuid(user);
      const safeFilter = filter || {};
      const safePagination = pagination || {};
      const { page = 1, limit = 10 } = safePagination;
      const skip = (page - 1) * limit;

      const query = { gymUuid };

      if (safeFilter.status) query.status = safeFilter.status;
      if (safeFilter.type) query.type = safeFilter.type;
      if (safeFilter.priority) query.priority = safeFilter.priority;
      if (safeFilter.member) query.member = safeFilter.member;
      if (safeFilter.trainer) query.trainer = safeFilter.trainer;
      if (safeFilter.startDate || safeFilter.endDate) {
        query.scheduledDate = {};
        if (safeFilter.startDate) query.scheduledDate.$gte = new Date(safeFilter.startDate);
        if (safeFilter.endDate) query.scheduledDate.$lte = new Date(safeFilter.endDate);
      }
      if (safeFilter.search) {
        query.$or = [
          { title: { $regex: safeFilter.search, $options: 'i' } },
          { description: { $regex: safeFilter.search, $options: 'i' } },
        ];
      }

      const [followups, total, pendingCount, completedCount, highPriorityCount] = await Promise.all([
        Followup.find(query)
          .populate('member')
          .populate('trainer')
          .populate('createdBy')
          .skip(skip)
          .limit(limit)
          .sort({ scheduledDate: 1 }),
        Followup.countDocuments(query),
        Followup.countDocuments({ gymUuid, status: 'pending' }),
        Followup.countDocuments({ gymUuid, status: 'completed' }),
        Followup.countDocuments({ gymUuid, priority: 'high', status: 'pending' }),
      ]);

      return {
        followups,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        stats: {
          total: pendingCount + completedCount,
          pending: pendingCount,
          completed: completedCount,
          highPriority: highPriorityCount,
        },
      };
    },

    followupsCount: async (_, __, { user }) => {
      const gymUuid = await getGymUuid(user);
      return await Followup.countDocuments({ gymUuid });
    },

    upcomingFollowups: async (_, { days = 7 }, { user }) => {
      const gymUuid = await getGymUuid(user);
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      return await Followup.find({
        gymUuid,
        status: 'pending',
        scheduledDate: { $gte: now, $lte: futureDate },
      })
        .populate('member')
        .populate('trainer')
        .populate('createdBy')
        .sort({ scheduledDate: 1 });
    },

    // Resource Queries
    resource: async (_, { id }, { user }) => {
      const gymUuid = await getGymUuid(user);
      const resource = await Resource.findOne({ _id: id, gymUuid });
      if (!resource) {
        throw new Error('Resource not found');
      }
      return resource;
    },

    resources: async (_, { filter, pagination }, { user }) => {
      const gymUuid = await getGymUuid(user);
      const safeFilter = filter || {};
      const safePagination = pagination || {};
      const { page = 1, limit = 10 } = safePagination;
      const skip = (page - 1) * limit;

      const query = { gymUuid };

      if (safeFilter.category) query.category = safeFilter.category;
      if (safeFilter.status) query.status = safeFilter.status;
      if (safeFilter.search) {
        query.$or = [
          { name: { $regex: safeFilter.search, $options: 'i' } },
          { description: { $regex: safeFilter.search, $options: 'i' } },
        ];
      }

      const [resources, total, availableCount, maintenanceCount, outOfOrderCount] = await Promise.all([
        Resource.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
        Resource.countDocuments(query),
        Resource.countDocuments({ gymUuid, status: 'available' }),
        Resource.countDocuments({ gymUuid, status: 'maintenance' }),
        Resource.countDocuments({ gymUuid, status: 'out_of_order' }),
      ]);

      return {
        resources,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        stats: {
          total: await Resource.countDocuments({ gymUuid }),
          available: availableCount,
          maintenance: maintenanceCount,
          outOfOrder: outOfOrderCount,
        },
      };
    },

    resourcesCount: async (_, __, { user }) => {
      const gymUuid = await getGymUuid(user);
      return await Resource.countDocuments({ gymUuid });
    },

    // Event Queries
    event: async (_, { id }, { user }) => {
      const gymUuid = await getGymUuid(user);
      const event = await Event.findOne({ _id: id, gymUuid }).populate('trainer');
      if (!event) {
        throw new Error('Event not found');
      }
      return event;
    },

    events: async (_, { filter, pagination }, { user }) => {
      const gymUuid = await getGymUuid(user);
      const safeFilter = filter || {};
      const safePagination = pagination || {};
      const { page = 1, limit = 10 } = safePagination;
      const skip = (page - 1) * limit;

      const query = { gymUuid };

      if (safeFilter.type) query.type = safeFilter.type;
      if (safeFilter.status) query.status = safeFilter.status;
      if (safeFilter.startDate || safeFilter.endDate) {
        query.startDate = {};
        if (safeFilter.startDate) query.startDate.$gte = new Date(safeFilter.startDate);
        if (safeFilter.endDate) query.startDate.$lte = new Date(safeFilter.endDate);
      }
      if (safeFilter.search) {
        query.$or = [
          { title: { $regex: safeFilter.search, $options: 'i' } },
          { description: { $regex: safeFilter.search, $options: 'i' } },
          { location: { $regex: safeFilter.search, $options: 'i' } },
        ];
      }

      const [events, total, allEvents] = await Promise.all([
        Event.find(query).populate('trainer').skip(skip).limit(limit).sort({ startDate: 1 }),
        Event.countDocuments(query),
        Event.find({ gymUuid }),
      ]);

      const upcomingCount = allEvents.filter(e => e.status === 'upcoming').length;
      const ongoingCount = allEvents.filter(e => e.status === 'ongoing').length;
      const totalParticipants = allEvents.reduce((sum, e) => sum + (e.currentParticipants || 0), 0);

      return {
        events,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        stats: {
          total: allEvents.length,
          upcoming: upcomingCount,
          ongoing: ongoingCount,
          totalParticipants,
        },
      };
    },

    eventsCount: async (_, __, { user }) => {
      const gymUuid = await getGymUuid(user);
      return await Event.countDocuments({ gymUuid });
    },

    upcomingEvents: async (_, { days = 30 }, { user }) => {
      const gymUuid = await getGymUuid(user);
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      return await Event.find({
        gymUuid,
        status: { $in: ['upcoming', 'ongoing'] },
        startDate: { $gte: now, $lte: futureDate },
      })
        .populate('trainer')
        .sort({ startDate: 1 });
    },
  },

  Mutation: {
    signup: async (_, { firstName, lastName, email, phone, password, role, gymName }) => {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // All users are gym admins by default - each signup creates a new gym
      const userData = {
        firstName,
        lastName,
        email,
        phone,
        password,
        role: 'admin',
        gymName: gymName || `${firstName}'s Gym`,
      };

      const user = await User.create(userData);
      const token = generateToken(user._id);

      return {
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          gymUuid: user.gymUuid,
          gymName: user.gymName,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
      };
    },

    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('Invalid email or password');
      }

      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      const token = generateToken(user._id);

      return {
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          gymUuid: user.gymUuid,
          gymName: user.gymName,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
      };
    },

    // Member Mutations
    createMember: async (_, { input }, { user }) => {
      const gymUuid = await getGymUuid(user);

      const existingMember = await Member.findOne({ gymUuid, email: input.email });
      if (existingMember) {
        throw new Error('Member with this email already exists in your gym');
      }

      const memberData = {
        ...input,
        gymUuid,
        dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
        membershipStartDate: input.membershipStartDate ? new Date(input.membershipStartDate) : new Date(),
        membershipEndDate: input.membershipEndDate ? new Date(input.membershipEndDate) : undefined,
      };

      // If there's an initial payment, add it to payment history
      if (input.payment && input.payment.paidAmount > 0) {
        memberData.paymentHistory = [{
          amount: input.payment.paidAmount,
          method: input.payment.method || 'cash',
          date: new Date(),
          notes: 'Initial payment',
        }];
      }

      const member = await Member.create(memberData);
      return await Member.findById(member._id).populate('assignedTrainer');
    },

    updateMember: async (_, { id, input }, { user }) => {
      const gymUuid = await getGymUuid(user);

      const member = await Member.findOne({ _id: id, gymUuid });
      if (!member) {
        throw new Error('Member not found');
      }

      const updateData = { ...input };
      if (input.dateOfBirth) updateData.dateOfBirth = new Date(input.dateOfBirth);
      if (input.membershipStartDate) updateData.membershipStartDate = new Date(input.membershipStartDate);
      if (input.membershipEndDate) updateData.membershipEndDate = new Date(input.membershipEndDate);

      const updatedMember = await Member.findByIdAndUpdate(id, updateData, { new: true }).populate('assignedTrainer');
      return updatedMember;
    },

    deleteMember: async (_, { id }, { user }) => {
      const gymUuid = await getGymUuid(user);

      const member = await Member.findOne({ _id: id, gymUuid });
      if (!member) {
        throw new Error('Member not found');
      }

      await Member.findByIdAndDelete(id);
      await Followup.deleteMany({ member: id, gymUuid });
      return true;
    },

    addPayment: async (_, { memberId, payment }, { user }) => {
      const gymUuid = await getGymUuid(user);

      const member = await Member.findOne({ _id: memberId, gymUuid });
      if (!member) {
        throw new Error('Member not found');
      }

      const paymentRecord = {
        amount: payment.amount,
        method: payment.method,
        date: payment.date ? new Date(payment.date) : new Date(),
        notes: payment.notes || '',
        receiptNumber: payment.receiptNumber || '',
      };

      // Add to payment history
      if (!member.paymentHistory) {
        member.paymentHistory = [];
      }
      member.paymentHistory.push(paymentRecord);

      // Update payment summary
      const newPaidAmount = (member.payment?.paidAmount || 0) + payment.amount;
      const totalAmount = member.payment?.amount || 0;
      
      member.payment = {
        ...member.payment,
        paidAmount: newPaidAmount,
        lastPaymentDate: paymentRecord.date,
        status: newPaidAmount >= totalAmount ? 'paid' : newPaidAmount > 0 ? 'partial' : 'pending',
      };

      // Update member status if fully paid
      if (newPaidAmount >= totalAmount && member.status === 'pending') {
        member.status = 'active';
      }

      await member.save();
      return await Member.findById(memberId).populate('assignedTrainer');
    },

    // Trainer/Team Member Mutations
    createTrainer: async (_, { input }, { user }) => {
      const gymUuid = await getGymUuid(user);

      const existingTrainer = await Trainer.findOne({ gymUuid, email: input.email });
      if (existingTrainer) {
        throw new Error('Team member with this email already exists in your gym');
      }

      const trainerData = {
        ...input,
        gymUuid,
        joiningDate: input.joiningDate ? new Date(input.joiningDate) : new Date(),
      };

      const trainer = await Trainer.create(trainerData);
      return trainer;
    },

    updateTrainer: async (_, { id, input }, { user }) => {
      const gymUuid = await getGymUuid(user);

      const trainer = await Trainer.findOne({ _id: id, gymUuid });
      if (!trainer) {
        throw new Error('Team member not found');
      }

      const updateData = { ...input };
      if (input.joiningDate) updateData.joiningDate = new Date(input.joiningDate);

      const updatedTrainer = await Trainer.findByIdAndUpdate(id, updateData, { new: true });
      return updatedTrainer;
    },

    deleteTrainer: async (_, { id }, { user }) => {
      const gymUuid = await getGymUuid(user);

      const trainer = await Trainer.findOne({ _id: id, gymUuid });
      if (!trainer) {
        throw new Error('Trainer not found');
      }

      await Member.updateMany({ assignedTrainer: id, gymUuid }, { $unset: { assignedTrainer: 1 } });
      await Trainer.findByIdAndDelete(id);
      return true;
    },

    // Followup Mutations
    createFollowup: async (_, { input }, { user }) => {
      const gymUuid = await getGymUuid(user);

      const member = await Member.findOne({ _id: input.member, gymUuid });
      if (!member) {
        throw new Error('Member not found');
      }

      if (input.trainer) {
        const trainer = await Trainer.findOne({ _id: input.trainer, gymUuid });
        if (!trainer) {
          throw new Error('Trainer not found');
        }
      }

      const followupData = {
        ...input,
        gymUuid,
        scheduledDate: new Date(input.scheduledDate),
        createdBy: user.userId,
      };

      const followup = await Followup.create(followupData);
      return await Followup.findById(followup._id)
        .populate('member')
        .populate('trainer')
        .populate('createdBy');
    },

    updateFollowup: async (_, { id, input }, { user }) => {
      const gymUuid = await getGymUuid(user);

      const followup = await Followup.findOne({ _id: id, gymUuid });
      if (!followup) {
        throw new Error('Followup not found');
      }

      const updateData = { ...input };
      if (input.scheduledDate) updateData.scheduledDate = new Date(input.scheduledDate);
      if (input.completedDate) updateData.completedDate = new Date(input.completedDate);

      const updatedFollowup = await Followup.findByIdAndUpdate(id, updateData, { new: true })
        .populate('member')
        .populate('trainer')
        .populate('createdBy');
      return updatedFollowup;
    },

    deleteFollowup: async (_, { id }, { user }) => {
      const gymUuid = await getGymUuid(user);

      const followup = await Followup.findOne({ _id: id, gymUuid });
      if (!followup) {
        throw new Error('Followup not found');
      }

      await Followup.findByIdAndDelete(id);
      return true;
    },

    completeFollowup: async (_, { id, outcome }, { user }) => {
      const gymUuid = await getGymUuid(user);

      const followup = await Followup.findOne({ _id: id, gymUuid });
      if (!followup) {
        throw new Error('Followup not found');
      }

      const updatedFollowup = await Followup.findByIdAndUpdate(
        id,
        {
          status: 'completed',
          completedDate: new Date(),
          outcome: outcome || '',
        },
        { new: true }
      )
        .populate('member')
        .populate('trainer')
        .populate('createdBy');
      return updatedFollowup;
    },

    // Resource Mutations
    createResource: async (_, { input }, { user }) => {
      const gymUuid = await getGymUuid(user);

      const resourceData = {
        ...input,
        gymUuid,
        purchaseDate: input.purchaseDate ? new Date(input.purchaseDate) : undefined,
      };

      if (input.maintenanceSchedule) {
        resourceData.maintenanceSchedule = {};
        if (input.maintenanceSchedule.lastMaintenance) {
          resourceData.maintenanceSchedule.lastMaintenance = new Date(input.maintenanceSchedule.lastMaintenance);
        }
        if (input.maintenanceSchedule.nextMaintenance) {
          resourceData.maintenanceSchedule.nextMaintenance = new Date(input.maintenanceSchedule.nextMaintenance);
        }
        if (input.maintenanceSchedule.frequency) {
          resourceData.maintenanceSchedule.frequency = input.maintenanceSchedule.frequency;
        }
      }

      if (input.specifications) {
        resourceData.specifications = {};
        if (input.specifications.brand) resourceData.specifications.brand = input.specifications.brand;
        if (input.specifications.model) resourceData.specifications.model = input.specifications.model;
        if (input.specifications.serialNumber) resourceData.specifications.serialNumber = input.specifications.serialNumber;
        if (input.specifications.warranty) {
          resourceData.specifications.warranty = {};
          if (input.specifications.warranty.expiryDate) {
            resourceData.specifications.warranty.expiryDate = new Date(input.specifications.warranty.expiryDate);
          }
          if (input.specifications.warranty.provider) {
            resourceData.specifications.warranty.provider = input.specifications.warranty.provider;
          }
        }
      }

      const resource = await Resource.create(resourceData);
      return resource;
    },

    updateResource: async (_, { id, input }, { user }) => {
      const gymUuid = await getGymUuid(user);

      const resource = await Resource.findOne({ _id: id, gymUuid });
      if (!resource) {
        throw new Error('Resource not found');
      }

      const updateData = { ...input };
      if (input.purchaseDate) updateData.purchaseDate = new Date(input.purchaseDate);

      if (input.maintenanceSchedule) {
        updateData.maintenanceSchedule = {};
        if (input.maintenanceSchedule.lastMaintenance) {
          updateData.maintenanceSchedule.lastMaintenance = new Date(input.maintenanceSchedule.lastMaintenance);
        }
        if (input.maintenanceSchedule.nextMaintenance) {
          updateData.maintenanceSchedule.nextMaintenance = new Date(input.maintenanceSchedule.nextMaintenance);
        }
        if (input.maintenanceSchedule.frequency) {
          updateData.maintenanceSchedule.frequency = input.maintenanceSchedule.frequency;
        }
      }

      if (input.specifications) {
        updateData.specifications = {};
        if (input.specifications.brand) updateData.specifications.brand = input.specifications.brand;
        if (input.specifications.model) updateData.specifications.model = input.specifications.model;
        if (input.specifications.serialNumber) updateData.specifications.serialNumber = input.specifications.serialNumber;
        if (input.specifications.warranty) {
          updateData.specifications.warranty = {};
          if (input.specifications.warranty.expiryDate) {
            updateData.specifications.warranty.expiryDate = new Date(input.specifications.warranty.expiryDate);
          }
          if (input.specifications.warranty.provider) {
            updateData.specifications.warranty.provider = input.specifications.warranty.provider;
          }
        }
      }

      const updatedResource = await Resource.findByIdAndUpdate(id, updateData, { new: true });
      return updatedResource;
    },

    deleteResource: async (_, { id }, { user }) => {
      const gymUuid = await getGymUuid(user);

      const resource = await Resource.findOne({ _id: id, gymUuid });
      if (!resource) {
        throw new Error('Resource not found');
      }

      await Resource.findByIdAndDelete(id);
      return true;
    },

    // Event Mutations
    createEvent: async (_, { input }, { user }) => {
      const gymUuid = await getGymUuid(user);

      if (input.trainer) {
        const trainer = await Trainer.findOne({ _id: input.trainer, gymUuid });
        if (!trainer) {
          throw new Error('Trainer not found');
        }
      }

      const eventData = {
        ...input,
        gymUuid,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
      };

      const event = await Event.create(eventData);
      return await Event.findById(event._id).populate('trainer');
    },

    updateEvent: async (_, { id, input }, { user }) => {
      const gymUuid = await getGymUuid(user);

      const event = await Event.findOne({ _id: id, gymUuid });
      if (!event) {
        throw new Error('Event not found');
      }

      if (input.trainer) {
        const trainer = await Trainer.findOne({ _id: input.trainer, gymUuid });
        if (!trainer) {
          throw new Error('Trainer not found');
        }
      }

      const updateData = { ...input };
      if (input.startDate) updateData.startDate = new Date(input.startDate);
      if (input.endDate) updateData.endDate = new Date(input.endDate);

      const updatedEvent = await Event.findByIdAndUpdate(id, updateData, { new: true }).populate('trainer');
      return updatedEvent;
    },

    deleteEvent: async (_, { id }, { user }) => {
      const gymUuid = await getGymUuid(user);

      const event = await Event.findOne({ _id: id, gymUuid });
      if (!event) {
        throw new Error('Event not found');
      }

      await Event.findByIdAndDelete(id);
      return true;
    },
  },

  // Field Resolvers
  Member: {
    id: (parent) => parent._id || parent.id,
    dateOfBirth: (parent) => formatDate(parent.dateOfBirth),
    membershipStartDate: (parent) => formatDate(parent.membershipStartDate),
    membershipEndDate: (parent) => formatDate(parent.membershipEndDate),
    createdAt: (parent) => formatDate(parent.createdAt),
    updatedAt: (parent) => formatDate(parent.updatedAt),
    paymentHistory: (parent) => {
      if (!parent.paymentHistory) return [];
      return parent.paymentHistory.map((record) => ({
        id: record._id || record.id,
        amount: record.amount,
        method: record.method,
        date: formatDate(record.date),
        notes: record.notes,
        receiptNumber: record.receiptNumber,
      }));
    },
  },

  Trainer: {
    id: (parent) => parent._id || parent.id,
    role: (parent) => parent.role || 'trainer',
    joiningDate: (parent) => formatDate(parent.joiningDate),
    createdAt: (parent) => formatDate(parent.createdAt),
    updatedAt: (parent) => formatDate(parent.updatedAt),
  },

  Followup: {
    id: (parent) => parent._id || parent.id,
    scheduledDate: (parent) => formatDate(parent.scheduledDate),
    completedDate: (parent) => formatDate(parent.completedDate),
    createdAt: (parent) => formatDate(parent.createdAt),
    updatedAt: (parent) => formatDate(parent.updatedAt),
  },

  Resource: {
    id: (parent) => parent._id || parent.id,
    purchaseDate: (parent) => formatDate(parent.purchaseDate),
    createdAt: (parent) => formatDate(parent.createdAt),
    updatedAt: (parent) => formatDate(parent.updatedAt),
    maintenanceSchedule: (parent) => {
      if (!parent.maintenanceSchedule) return null;
      return {
        lastMaintenance: formatDate(parent.maintenanceSchedule.lastMaintenance),
        nextMaintenance: formatDate(parent.maintenanceSchedule.nextMaintenance),
        frequency: parent.maintenanceSchedule.frequency,
      };
    },
    specifications: (parent) => {
      if (!parent.specifications) return null;
      return {
        brand: parent.specifications.brand,
        model: parent.specifications.model,
        serialNumber: parent.specifications.serialNumber,
        warranty: parent.specifications.warranty ? {
          expiryDate: formatDate(parent.specifications.warranty.expiryDate),
          provider: parent.specifications.warranty.provider,
        } : null,
      };
    },
  },

  User: {
    id: (parent) => parent._id || parent.id,
    createdAt: (parent) => formatDate(parent.createdAt),
    updatedAt: (parent) => formatDate(parent.updatedAt),
  },

  Event: {
    id: (parent) => parent._id || parent.id,
    startDate: (parent) => formatDate(parent.startDate),
    endDate: (parent) => formatDate(parent.endDate),
    createdAt: (parent) => formatDate(parent.createdAt),
    updatedAt: (parent) => formatDate(parent.updatedAt),
  },
};

module.exports = resolvers;
