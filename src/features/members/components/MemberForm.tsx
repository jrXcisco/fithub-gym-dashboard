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

const taxOptions = [
  { label: '5%', value: '5' },
  { label: '18%', value: '18' },
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
    discount: initialData?.payment?.discount || 0,
    applyTaxes: initialData?.payment?.applyTaxes || false,
    taxRate: initialData?.payment?.taxRate || '18',
    workoutGoal: initialData?.workoutProgram?.goal || 'general-fitness',
    workoutNotes: initialData?.workoutProgram?.notes || '',
  });

  const handleChange = (field: string, value: string | number | boolean) => {
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
    const planAmount = planPrices[plan];
    const discountAmount = formData.discount || 0;
    const subtotal = planAmount - discountAmount;
    const taxRate = formData.applyTaxes ? Number(formData.taxRate) : 0;
    const totalTaxAmount = formData.applyTaxes ? (subtotal * taxRate) / 100 : 0;
    const cgstAmount = totalTaxAmount / 2;
    const sgstAmount = totalTaxAmount / 2;
    const payableAmount = subtotal + totalTaxAmount;
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
      status: formData.paidAmount >= payableAmount ? 'active' : 'pending',
      payment: {
        method: formData.paymentMethod as PaymentMethod,
        status: formData.paidAmount >= payableAmount ? 'paid' : formData.paidAmount > 0 ? 'partial' : 'pending',
        amount: payableAmount,
        paidAmount: formData.paidAmount,
        dueDate: formData.membershipStartDate,
        lastPaymentDate: formData.paidAmount > 0 ? new Date().toISOString().split('T')[0] : undefined,
        discount: discountAmount,
        applyTaxes: formData.applyTaxes,
        taxRate: formData.taxRate,
        cgst: cgstAmount,
        sgst: sgstAmount,
        totalTax: totalTaxAmount,
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

        {currentStep === 4 && (() => {
          const planAmount = planPrices[formData.subscriptionPlan as SubscriptionPlan];
          const discountAmount = formData.discount || 0;
          const subtotal = planAmount - discountAmount;
          const taxRate = formData.applyTaxes ? Number(formData.taxRate) : 0;
          const totalTaxAmount = formData.applyTaxes ? (subtotal * taxRate) / 100 : 0;
          const cgstAmount = totalTaxAmount / 2;
          const sgstAmount = totalTaxAmount / 2;
          const payableAmount = subtotal + totalTaxAmount;
          const balance = payableAmount - formData.paidAmount;

          return (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Select
                    label="Payment Method"
                    options={paymentMethodOptions}
                    value={formData.paymentMethod}
                    onChange={(e) => handleChange('paymentMethod', e.target.value)}
                    required
                    error={errors.paymentMethod}
                  />
                  
                  <Input
                    label="Discount"
                    type="number"
                    value={formData.discount}
                    onChange={(e) => handleChange('discount', Number(e.target.value))}
                    placeholder="Enter discount amount"
                  />

                  <div className="flex items-center gap-3 mt-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.applyTaxes}
                        onChange={(e) => handleChange('applyTaxes', e.target.checked)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Apply Taxes*</span>
                    </label>
                    {formData.applyTaxes && (
                      <Select
                        options={taxOptions}
                        value={formData.taxRate}
                        onChange={(e) => handleChange('taxRate', e.target.value)}
                        className="w-32"
                      />
                    )}
                  </div>

                  {formData.applyTaxes && (
                    <div className="bg-gray-50 p-3 rounded-lg mt-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>CGST ({Number(formData.taxRate) / 2}%)</span>
                        <span>₹{cgstAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600 mt-1">
                        <span>SGST ({Number(formData.taxRate) / 2}%)</span>
                        <span>₹{sgstAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-medium text-gray-700 mt-2 pt-2 border-t border-gray-200">
                        <span>Total Taxes (₹)</span>
                        <span>₹{totalTaxAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  <Input
                    label="Amount Paid"
                    type="number"
                    value={formData.paidAmount}
                    onChange={(e) => handleChange('paidAmount', Number(e.target.value))}
                    required
                    error={errors.paidAmount}
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg h-fit">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Selected Plans Total</span>
                      <span className="font-medium">₹{planAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total Discount</span>
                      <span className="font-medium text-red-600">₹{discountAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                    </div>
                    {formData.applyTaxes && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total Taxes</span>
                        <span className="font-medium">₹{totalTaxAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                      <span className="text-gray-700 font-medium">Payable Amount</span>
                      <span className="font-bold text-lg">₹{payableAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Amount Paid</span>
                      <span className="font-medium text-green-600">₹{formData.paidAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                      <span className="text-gray-700 font-medium">Remaining Amount</span>
                      <span className={`font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ₹{balance.toFixed(2)}
                      </span>
                    </div>
                    <p className={`text-sm mt-2 font-medium ${balance <= 0 ? 'text-green-600' : 'text-yellow-600'}`}>
                      Status: {balance <= 0 ? 'Fully Paid' : formData.paidAmount > 0 ? 'Partial Payment' : 'Pending'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

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
