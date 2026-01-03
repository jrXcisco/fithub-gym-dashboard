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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stepsWithErrors, setStepsWithErrors] = useState<number[]>([]);
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
    // Clear error when field is updated
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    // Clear step from error list when user starts fixing
    if (stepsWithErrors.includes(currentStep)) {
      setStepsWithErrors((prev) => prev.filter((s) => s !== currentStep));
    }
  };

  const validateStep = (step: number): Record<string, string> => {
    const stepErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.firstName.trim()) stepErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) stepErrors.lastName = 'Last name is required';
      if (!formData.email.trim()) stepErrors.email = 'Email is required';
      if (!formData.phone.trim()) stepErrors.phone = 'Phone is required';
      if (!formData.dateOfBirth) stepErrors.dateOfBirth = 'Date of birth is required';
      if (!formData.gender) stepErrors.gender = 'Gender is required';
    }

    if (step === 3) {
      if (!formData.subscriptionPlan) stepErrors.subscriptionPlan = 'Subscription plan is required';
      if (!formData.membershipStartDate) stepErrors.membershipStartDate = 'Membership start date is required';
    }

    if (step === 4) {
      if (!formData.paymentMethod) stepErrors.paymentMethod = 'Payment method is required';
      if (formData.paidAmount < 0) stepErrors.paidAmount = 'Amount cannot be negative';
    }

    if (step === 5) {
      if (!formData.workoutGoal) stepErrors.workoutGoal = 'Fitness goal is required';
    }

    return stepErrors;
  };

  const validateAllSteps = (): boolean => {
    const allErrors: Record<string, string> = {};
    const errorSteps: number[] = [];

    // Validate all steps
    [1, 3, 4, 5].forEach((step) => {
      const stepErrors = validateStep(step);
      if (Object.keys(stepErrors).length > 0) {
        errorSteps.push(step);
        Object.assign(allErrors, stepErrors);
      }
    });

    setErrors(allErrors);
    setStepsWithErrors(errorSteps);

    // If there are errors, navigate to the first step with errors
    if (errorSteps.length > 0) {
      setCurrentStep(errorSteps[0]);
      return false;
    }

    return true;
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
    if (!validateAllSteps()) return;
    
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

  const validateCurrentStep = () => {
    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...stepErrors }));
      if (!stepsWithErrors.includes(currentStep)) {
        setStepsWithErrors((prev) => [...prev, currentStep]);
      }
    } else {
      // Clear errors for this step if it's now valid
      setStepsWithErrors((prev) => prev.filter((s) => s !== currentStep));
    }
  };

  const nextStep = () => {
    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...stepErrors }));
      if (!stepsWithErrors.includes(currentStep)) {
        setStepsWithErrors((prev) => [...prev, currentStep]);
      }
      return; // Block navigation if current step has errors
    }
    setStepsWithErrors((prev) => prev.filter((s) => s !== currentStep));
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };
  const prevStep = () => {
    validateCurrentStep();
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleStepClick = (step: number) => {
    validateCurrentStep();
    setCurrentStep(step);
  };

  return (
    <div className="space-y-8">
      <Stepper steps={steps} currentStep={currentStep} onStepClick={handleStepClick} stepsWithErrors={stepsWithErrors} />

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
                error={errors.firstName}
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                required
                error={errors.lastName}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                error={errors.email}
              />
              <Input
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                required
                error={errors.phone}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                required
                error={errors.dateOfBirth}
              />
              <Select
                label="Gender"
                options={genderOptions}
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                required
                error={errors.gender}
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
              required
              error={errors.subscriptionPlan}
            />
            <Input
              label="Membership Start Date"
              type="date"
              value={formData.membershipStartDate}
              onChange={(e) => handleChange('membershipStartDate', e.target.value)}
              required
              error={errors.membershipStartDate}
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
              required
              error={errors.paymentMethod}
            />
            <Input
              label="Amount Paid"
              type="number"
              value={formData.paidAmount}
              onChange={(e) => handleChange('paidAmount', Number(e.target.value))}
              required
              error={errors.paidAmount}
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
              required
              error={errors.workoutGoal}
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
