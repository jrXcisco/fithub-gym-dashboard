const typeDefs = `#graphql
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    phone: String
    role: String!
    gymUuid: String
    gymName: String
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  # Member Types
  type EmergencyContact {
    name: String
    phone: String
    relationship: String
  }

  type HealthInfo {
    height: Float
    weight: Float
    bloodGroup: String
    medicalConditions: [String]
  }

  type Address {
    street: String
    city: String
    state: String
    zipCode: String
    country: String
  }

  type PaymentRecord {
    id: ID
    amount: Float!
    method: String!
    date: String!
    notes: String
    receiptNumber: String
  }

  type Payment {
    method: String
    amount: Float
    paidAmount: Float
    status: String
    dueDate: String
    lastPaymentDate: String
  }

  type WorkoutProgram {
    goal: String
    startDate: String
    notes: String
  }

  type Member {
    id: ID!
    gymUuid: String!
    firstName: String!
    lastName: String!
    email: String!
    phone: String
    dateOfBirth: String
    gender: String
    address: Address
    membershipType: String!
    membershipStartDate: String!
    membershipEndDate: String
    status: String!
    emergencyContact: EmergencyContact
    assignedTrainer: Trainer
    healthInfo: HealthInfo
    payment: Payment
    paymentHistory: [PaymentRecord]
    workoutProgram: WorkoutProgram
    specialRequirements: String
    profileImage: String
    createdAt: String!
    updatedAt: String!
  }

  type MemberStats {
    total: Int!
    active: Int!
    inactive: Int!
    expired: Int!
  }

  type MemberList {
    members: [Member!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
    stats: MemberStats
  }

  input EmergencyContactInput {
    name: String
    phone: String
    relationship: String
  }

  input HealthInfoInput {
    height: Float
    weight: Float
    bloodGroup: String
    medicalConditions: [String]
  }

  input AddressInput {
    street: String
    city: String
    state: String
    zipCode: String
    country: String
  }

  input PaymentRecordInput {
    amount: Float!
    method: String!
    date: String
    notes: String
    receiptNumber: String
  }

  input PaymentInput {
    method: String
    amount: Float
    paidAmount: Float
    status: String
    dueDate: String
    lastPaymentDate: String
  }

  input WorkoutProgramInput {
    goal: String
    startDate: String
    notes: String
  }

  input MemberInput {
    firstName: String!
    lastName: String!
    email: String!
    phone: String
    dateOfBirth: String
    gender: String
    address: AddressInput
    membershipType: String
    membershipStartDate: String
    membershipEndDate: String
    status: String
    emergencyContact: EmergencyContactInput
    assignedTrainer: ID
    healthInfo: HealthInfoInput
    payment: PaymentInput
    workoutProgram: WorkoutProgramInput
    specialRequirements: String
    profileImage: String
  }

  input MemberUpdateInput {
    firstName: String
    lastName: String
    email: String
    phone: String
    dateOfBirth: String
    gender: String
    address: AddressInput
    membershipType: String
    membershipStartDate: String
    membershipEndDate: String
    status: String
    emergencyContact: EmergencyContactInput
    assignedTrainer: ID
    healthInfo: HealthInfoInput
    payment: PaymentInput
    workoutProgram: WorkoutProgramInput
    specialRequirements: String
    profileImage: String
  }

  input MemberFilterInput {
    status: String
    membershipType: String
    fitnessGoal: String
    assignedTrainer: ID
    search: String
  }

  # Team Member Types (formerly Trainer)
  type TeamAvailability {
    days: [String]
    startTime: String
    endTime: String
  }

  type TeamEmergencyContact {
    name: String
    phone: String
    relation: String
  }

  type Trainer {
    id: ID!
    gymUuid: String!
    firstName: String!
    lastName: String!
    email: String!
    phone: String
    role: String!
    specializations: [String]
    certifications: [String]
    experience: Int
    bio: String
    salary: Float
    joiningDate: String
    availability: TeamAvailability
    status: String!
    profileImage: String
    address: Address
    emergencyContact: TeamEmergencyContact
    createdAt: String!
    updatedAt: String!
  }

  type TrainerStats {
    total: Int!
    active: Int!
    trainers: Int!
    totalSalary: Float!
  }

  type TrainerList {
    trainers: [Trainer!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
    stats: TrainerStats
  }

  input TeamAvailabilityInput {
    days: [String]
    startTime: String
    endTime: String
  }

  input TeamEmergencyContactInput {
    name: String
    phone: String
    relation: String
  }

  input TrainerInput {
    firstName: String!
    lastName: String!
    email: String!
    phone: String
    role: String
    specializations: [String]
    certifications: [String]
    experience: Int
    bio: String
    salary: Float
    joiningDate: String
    availability: TeamAvailabilityInput
    status: String
    profileImage: String
    address: AddressInput
    emergencyContact: TeamEmergencyContactInput
  }

  input TrainerUpdateInput {
    firstName: String
    lastName: String
    email: String
    phone: String
    role: String
    specializations: [String]
    certifications: [String]
    experience: Int
    bio: String
    salary: Float
    joiningDate: String
    availability: TeamAvailabilityInput
    status: String
    profileImage: String
    address: AddressInput
    emergencyContact: TeamEmergencyContactInput
  }

  input TrainerFilterInput {
    status: String
    role: String
    specialization: String
    search: String
    dayPresent: String
  }

  # Followup Types
  type Followup {
    id: ID!
    gymUuid: String!
    member: Member
    trainer: Trainer
    type: String!
    title: String!
    description: String
    scheduledDate: String!
    completedDate: String
    status: String!
    priority: String!
    notes: String
    outcome: String
    createdBy: User
    createdAt: String!
    updatedAt: String!
  }

  type FollowupStats {
    total: Int!
    pending: Int!
    completed: Int!
    highPriority: Int!
  }

  type FollowupList {
    followups: [Followup!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
    stats: FollowupStats
  }

  input FollowupInput {
    member: ID
    trainer: ID
    type: String
    title: String!
    description: String
    scheduledDate: String!
    priority: String
    notes: String
  }

  input FollowupUpdateInput {
    member: ID
    trainer: ID
    type: String
    title: String
    description: String
    scheduledDate: String
    completedDate: String
    status: String
    priority: String
    notes: String
    outcome: String
  }

  input FollowupFilterInput {
    status: String
    type: String
    priority: String
    member: ID
    trainer: ID
    startDate: String
    endDate: String
    search: String
  }

  # Resource Types
  type MaintenanceSchedule {
    lastMaintenance: String
    nextMaintenance: String
    frequency: String
  }

  type Warranty {
    expiryDate: String
    provider: String
  }

  type Specifications {
    brand: String
    model: String
    serialNumber: String
    warranty: Warranty
  }

  type Resource {
    id: ID!
    gymUuid: String!
    name: String!
    category: String!
    description: String
    quantity: Int!
    availableQuantity: Int!
    status: String!
    location: String
    purchaseDate: String
    purchasePrice: Float
    maintenanceSchedule: MaintenanceSchedule
    specifications: Specifications
    image: String
    notes: String
    createdAt: String!
    updatedAt: String!
  }

  type ResourceStats {
    total: Int!
    available: Int!
    maintenance: Int!
    outOfOrder: Int!
  }

  type ResourceList {
    resources: [Resource!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
    stats: ResourceStats
  }

  input WarrantyInput {
    expiryDate: String
    provider: String
  }

  input SpecificationsInput {
    brand: String
    model: String
    serialNumber: String
    warranty: WarrantyInput
  }

  input MaintenanceScheduleInput {
    lastMaintenance: String
    nextMaintenance: String
    frequency: String
  }

  input ResourceInput {
    name: String!
    category: String
    description: String
    quantity: Int
    availableQuantity: Int
    status: String
    location: String
    purchaseDate: String
    purchasePrice: Float
    maintenanceSchedule: MaintenanceScheduleInput
    specifications: SpecificationsInput
    image: String
    notes: String
  }

  input ResourceUpdateInput {
    name: String
    category: String
    description: String
    quantity: Int
    availableQuantity: Int
    status: String
    location: String
    purchaseDate: String
    purchasePrice: Float
    maintenanceSchedule: MaintenanceScheduleInput
    specifications: SpecificationsInput
    image: String
    notes: String
  }

  input ResourceFilterInput {
    category: String
    status: String
    search: String
  }

  # Event Types
  type Event {
    id: ID!
    gymUuid: String!
    title: String!
    description: String
    type: String!
    startDate: String!
    endDate: String!
    location: String
    maxParticipants: Int!
    currentParticipants: Int!
    fee: Float!
    status: String!
    trainer: Trainer
    image: String
    notes: String
    createdAt: String!
    updatedAt: String!
  }

  type EventStats {
    total: Int!
    upcoming: Int!
    ongoing: Int!
    totalParticipants: Int!
  }

  type EventList {
    events: [Event!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
    stats: EventStats
  }

  input EventInput {
    title: String!
    description: String
    type: String
    startDate: String!
    endDate: String!
    location: String
    maxParticipants: Int
    currentParticipants: Int
    fee: Float
    status: String
    trainer: ID
    image: String
    notes: String
  }

  input EventUpdateInput {
    title: String
    description: String
    type: String
    startDate: String
    endDate: String
    location: String
    maxParticipants: Int
    currentParticipants: Int
    fee: Float
    status: String
    trainer: ID
    image: String
    notes: String
  }

  input EventFilterInput {
    type: String
    status: String
    startDate: String
    endDate: String
    search: String
  }

  # Pagination Input
  input PaginationInput {
    page: Int
    limit: Int
  }

  type Query {
    me: User
    users: [User!]!
    usersCount: Int!

    # Member Queries
    member(id: ID!): Member
    members(filter: MemberFilterInput, pagination: PaginationInput): MemberList!
    membersCount: Int!
    memberSearchSuggestions(search: String!, limit: Int): [Member!]!

    # Trainer Queries
    trainer(id: ID!): Trainer
    trainers(filter: TrainerFilterInput, pagination: PaginationInput): TrainerList!
    trainersCount: Int!
    teamSearchSuggestions(search: String!, limit: Int): [Trainer!]!

    # Followup Queries
    followup(id: ID!): Followup
    followups(filter: FollowupFilterInput, pagination: PaginationInput): FollowupList!
    followupsCount: Int!
    upcomingFollowups(days: Int): [Followup!]!
    followupSearchSuggestions(search: String!, limit: Int): [Followup!]!

    # Resource Queries
    resource(id: ID!): Resource
    resources(filter: ResourceFilterInput, pagination: PaginationInput): ResourceList!
    resourcesCount: Int!
    resourceSearchSuggestions(search: String!, limit: Int): [Resource!]!

    # Event Queries
    event(id: ID!): Event
    events(filter: EventFilterInput, pagination: PaginationInput): EventList!
    eventsCount: Int!
    upcomingEvents(days: Int): [Event!]!
    eventSearchSuggestions(search: String!, limit: Int): [Event!]!
  }

  type Mutation {
    signup(
      firstName: String!
      lastName: String!
      email: String!
      phone: String
      password: String!
      role: String
      gymName: String
    ): AuthPayload!

    login(email: String!, password: String!): AuthPayload!

    # Member Mutations
    createMember(input: MemberInput!): Member!
    updateMember(id: ID!, input: MemberUpdateInput!): Member!
    deleteMember(id: ID!): Boolean!
    addPayment(memberId: ID!, payment: PaymentRecordInput!): Member!

    # Trainer Mutations
    createTrainer(input: TrainerInput!): Trainer!
    updateTrainer(id: ID!, input: TrainerUpdateInput!): Trainer!
    deleteTrainer(id: ID!): Boolean!

    # Followup Mutations
    createFollowup(input: FollowupInput!): Followup!
    updateFollowup(id: ID!, input: FollowupUpdateInput!): Followup!
    deleteFollowup(id: ID!): Boolean!
    completeFollowup(id: ID!, outcome: String): Followup!

    # Resource Mutations
    createResource(input: ResourceInput!): Resource!
    updateResource(id: ID!, input: ResourceUpdateInput!): Resource!
    deleteResource(id: ID!): Boolean!

    # Event Mutations
    createEvent(input: EventInput!): Event!
    updateEvent(id: ID!, input: EventUpdateInput!): Event!
    deleteEvent(id: ID!): Boolean!
  }
`;

module.exports = typeDefs;
