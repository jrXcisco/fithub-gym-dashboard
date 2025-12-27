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

  type MemberList {
    members: [Member!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
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
    assignedTrainer: ID
    search: String
  }

  # Trainer Types
  type Availability {
    start: String
    end: String
  }

  type TrainerAvailability {
    monday: Availability
    tuesday: Availability
    wednesday: Availability
    thursday: Availability
    friday: Availability
    saturday: Availability
    sunday: Availability
  }

  type Trainer {
    id: ID!
    gymUuid: String!
    firstName: String!
    lastName: String!
    email: String!
    phone: String
    specializations: [String]
    certifications: [String]
    experience: Int
    bio: String
    hourlyRate: Float
    availability: TrainerAvailability
    status: String!
    profileImage: String
    rating: Float
    totalClients: Int
    createdAt: String!
    updatedAt: String!
  }

  type TrainerList {
    trainers: [Trainer!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  input AvailabilityInput {
    start: String
    end: String
  }

  input TrainerAvailabilityInput {
    monday: AvailabilityInput
    tuesday: AvailabilityInput
    wednesday: AvailabilityInput
    thursday: AvailabilityInput
    friday: AvailabilityInput
    saturday: AvailabilityInput
    sunday: AvailabilityInput
  }

  input TrainerInput {
    firstName: String!
    lastName: String!
    email: String!
    phone: String
    specializations: [String]
    certifications: [String]
    experience: Int
    bio: String
    hourlyRate: Float
    availability: TrainerAvailabilityInput
    status: String
    profileImage: String
  }

  input TrainerUpdateInput {
    firstName: String
    lastName: String
    email: String
    phone: String
    specializations: [String]
    certifications: [String]
    experience: Int
    bio: String
    hourlyRate: Float
    availability: TrainerAvailabilityInput
    status: String
    profileImage: String
  }

  input TrainerFilterInput {
    status: String
    specialization: String
    search: String
  }

  # Followup Types
  type Followup {
    id: ID!
    gymUuid: String!
    member: Member!
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

  type FollowupList {
    followups: [Followup!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  input FollowupInput {
    member: ID!
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

  type ResourceList {
    resources: [Resource!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
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

    # Trainer Queries
    trainer(id: ID!): Trainer
    trainers(filter: TrainerFilterInput, pagination: PaginationInput): TrainerList!
    trainersCount: Int!

    # Followup Queries
    followup(id: ID!): Followup
    followups(filter: FollowupFilterInput, pagination: PaginationInput): FollowupList!
    followupsCount: Int!
    upcomingFollowups(days: Int): [Followup!]!

    # Resource Queries
    resource(id: ID!): Resource
    resources(filter: ResourceFilterInput, pagination: PaginationInput): ResourceList!
    resourcesCount: Int!
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
  }
`;

module.exports = typeDefs;
