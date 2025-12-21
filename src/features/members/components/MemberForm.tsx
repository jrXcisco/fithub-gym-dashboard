import { useState } from 'react';
import { Button, Input, Select, Stepper, Textarea } from '../../../components/ui';
import type { Member, SubscriptionPlan, WorkoutGoal, PaymentMethod } from '../../../types';

interface MemberFormProps {
  initialData?: Partial<Member>;
  onSubmit: (data: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const steps = [
  { id: 1, title: 'Personal Info', description: 'Basic details' },
  { id: 2, title: 'Address', description: 'Location info' },
  { id: 3, title: 'Membership', description: 'Plan details' },
  { id: 4, title: 'Payment', description: 'Payment info' },
  { id: 5, title: 'Workout', description: 'Fitness goals' },
];

const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

const subscriptionOptions = [
  { label: 'Monthly - ₹3,000', value: 'monthly' },
  { label: 'Quarterly - ₹8,000', value: 'quarterly' },
  { label: 'Half-Yearly - ₹15,000', value: 'half-yearly' },
  { label: 'Yearly - ₹25,000', value: 'yearly' },
];

const paymentMethodOptions = [
  { label: 'Cash', value: 'cash' },
  { label: 'Card', value: 'card' },
  { label: 'UPI', value: 'upi' },
  { label: 'Bank Transfer', value: 'bank-transfer' },
];

const workoutGoalOptions = [
  { label: 'Weight Loss', value: 'weight-loss' },
  { label: 'Weight Gain', value: 'weight-gain' },
  { label: 'Muscle Building', value: 'muscle-building' },
  { label: 'General Fitness', value: 'general-fitness' },
  { label: 'Cardio', value: 'cardio' },
  { label: 'Flexibility', value: 'flexibility' },
];

const planPrices: Record<SubscriptionPlan, number> = {
  monthly: 3000,
  quarterly: 8000,
  'half-yearly': 15000,
  yearly: 25000,
};

export function MemberForm({ initialData, onSubmit, onCancel }: MemberFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    dateOfBirth: initialData?.dateOfBirth || '',
    gender: initialData?.gender || 'male',
    street: initialData?.address?.street || '',
    city: initialData?.address?.city || '',
    state: initialData?.address?.state || '',
    zipCode: initialData?.address?.zipCode || '',
    country: initialData?.address?.country || 'India',
    emergencyName: initialData?.emergencyContact?.name || '',
    emergencyPhone: initialData?.emergencyContact?.phone || '',
    emergencyRelation: initialData?.emergencyContact?.relation || '',
    subscriptionPlan: initialData?.subscriptionPlan || 'monthly',
    membershipStartDate: initialData?.membershipStartDate || new Date().toISOString().split('T')[0],
    paymentMethod: initialData?.payment?.method || 'cash',
    paidAmount: initialData?.payment?.paidAmount || 0,
    workoutGoal: initialData?.workoutProgram?.goal || 'general-fitness',
    workoutNotes: initialData?.workoutProgram?.notes || '',
  });

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const calculateEndDate = (startDate: string, plan: SubscriptionPlan): string => {
    const start = new Date(startDate);
    switch (plan) {
      case 'monthly':
        start.setMonth(start.getMonth() + 1);
        break;
      case 'quarterly':
        start.setMonth(start.getMonth() + 3);
        break;
      case 'half-yearly':
        start.setMonth(start.getMonth() + 6);
        break;
      case 'yearly':
        start.setFullYear(start.getFullYear() + 1);
        break;
    }
    return start.toISOString().split('T')[0];
  };

  const handleSubmit = () => {
    const plan = formData.subscriptionPlan as SubscriptionPlan;
    const amount = planPrices[plan];
    const endDate = calculateEndDate(formData.membershipStartDate, plan);

    const memberData: Omit<Member, 'id' | 'createdAt' | 'updatedAt'> = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender as 'male' | 'female' | 'other',
      address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
      },
      emergencyContact: {
        name: formData.emergencyName,
        phone: formData.emergencyPhone,
        relation: formData.emergencyRelation,
      },
      membershipStartDate: formData.membershipStartDate,
      membershipEndDate: endDate,
      subscriptionPlan: plan,
      status: formData.paidAmount >= amount ? 'active' : 'pending',
      payment: {
        method: formData.paymentMethod as PaymentMethod,
        status: formData.paidAmount >= amount ? 'paid' : formData.paidAmount > 0 ? 'partial' : 'pending',
        amount,
        paidAmount: formData.paidAmount,
        dueDate: formData.membershipStartDate,
        lastPaymentDate: formData.paidAmount > 0 ? new Date().toISOString().split('T')[0] : undefined,
      },
      workoutProgram: {
        goal: formData.workoutGoal as WorkoutGoal,
        startDate: formData.membershipStartDate,
        notes: formData.workoutNotes,
      },
    };

    onSubmit(memberData);
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="space-y-8">
      <Stepper steps={steps} currentStep={currentStep} />

      <div className="mt-8">
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                required
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
              <Input
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                required
              />
              <Select
                label="Gender"
                options={genderOptions}
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
              />
            </div>
            <h4 className="text-md font-medium text-gray-800 mt-6 mb-2">Emergency Contact</h4>
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Name"
                value={formData.emergencyName}
                onChange={(e) => handleChange('emergencyName', e.target.value)}
              />
              <Input
                label="Phone"
                type="tel"
                value={formData.emergencyPhone}
                onChange={(e) => handleChange('emergencyPhone', e.target.value)}
              />
              <Input
                label="Relation"
                value={formData.emergencyRelation}
                onChange={(e) => handleChange('emergencyRelation', e.target.value)}
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
            <Input
              label="Street Address"
              value={formData.street}
              onChange={(e) => handleChange('street', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
              />
              <Input
                label="State"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="ZIP Code"
                value={formData.zipCode}
                onChange={(e) => handleChange('zipCode', e.target.value)}
              />
              <Input
                label="Country"
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Membership Details</h3>
            <Select
              label="Subscription Plan"
              options={subscriptionOptions}
              value={formData.subscriptionPlan}
              onChange={(e) => handleChange('subscriptionPlan', e.target.value)}
            />
            <Input
              label="Membership Start Date"
              type="date"
              value={formData.membershipStartDate}
              onChange={(e) => handleChange('membershipStartDate', e.target.value)}
            />
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Plan Amount:</strong> ₹{planPrices[formData.subscriptionPlan as SubscriptionPlan].toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <strong>End Date:</strong> {calculateEndDate(formData.membershipStartDate, formData.subscriptionPlan as SubscriptionPlan)}
              </p>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
            <Select
              label="Payment Method"
              options={paymentMethodOptions}
              value={formData.paymentMethod}
              onChange={(e) => handleChange('paymentMethod', e.target.value)}
            />
            <Input
              label="Amount Paid"
              type="number"
              value={formData.paidAmount}
              onChange={(e) => handleChange('paidAmount', Number(e.target.value))}
            />
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Total Amount:</strong> ₹{planPrices[formData.subscriptionPlan as SubscriptionPlan].toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Balance:</strong> ₹{(planPrices[formData.subscriptionPlan as SubscriptionPlan] - formData.paidAmount).toLocaleString()}
              </p>
              <p className={`text-sm mt-1 font-medium ${formData.paidAmount >= planPrices[formData.subscriptionPlan as SubscriptionPlan] ? 'text-green-600' : 'text-yellow-600'}`}>
                Status: {formData.paidAmount >= planPrices[formData.subscriptionPlan as SubscriptionPlan] ? 'Fully Paid' : formData.paidAmount > 0 ? 'Partial Payment' : 'Pending'}
              </p>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Workout Program</h3>
            <Select
              label="Fitness Goal"
              options={workoutGoalOptions}
              value={formData.workoutGoal}
              onChange={(e) => handleChange('workoutGoal', e.target.value)}
            />
            <Textarea
              label="Notes / Special Requirements"
              value={formData.workoutNotes}
              onChange={(e) => handleChange('workoutNotes', e.target.value)}
              rows={4}
              placeholder="Any specific requirements, health conditions, or preferences..."
            />
          </div>
        )}
      </div>

      <div className="flex justify-between pt-6 border-t border-gray-200">
        <Button variant="secondary" onClick={currentStep === 1 ? onCancel : prevStep}>
          {currentStep === 1 ? 'Cancel' : 'Previous'}
        </Button>
        <Button onClick={currentStep === 5 ? handleSubmit : nextStep}>
          {currentStep === 5 ? 'Submit' : 'Next'}
        </Button>
      </div>
    </div>
  );
}
