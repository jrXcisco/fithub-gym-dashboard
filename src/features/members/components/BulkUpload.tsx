import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Button } from '../../../components/ui';
import type { Member } from '../../../types';

interface BulkUploadProps {
  onUpload: (members: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
  onClose: () => void;
}

interface ParsedRow {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  subscriptionPlan: string;
  paymentMethod: string;
  paidAmount: number;
}

export function BulkUpload({ onUpload, onClose }: BulkUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = async (file: File) => {
    setIsProcessing(true);
    setErrors([]);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<ParsedRow>(worksheet);

      const validationErrors: string[] = [];
      const validRows: ParsedRow[] = [];

      jsonData.forEach((row, index) => {
        const rowNum = index + 2;
        if (!row.firstName || !row.lastName) {
          validationErrors.push(`Row ${rowNum}: First name and last name are required`);
        } else if (!row.email) {
          validationErrors.push(`Row ${rowNum}: Email is required`);
        } else if (!row.phone) {
          validationErrors.push(`Row ${rowNum}: Phone is required`);
        } else {
          validRows.push(row);
        }
      });

      setErrors(validationErrors);
      setParsedData(validRows);
    } catch (error) {
      setErrors(['Failed to parse file. Please ensure it is a valid Excel file.']);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpload = () => {
    const members: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>[] = parsedData.map((row) => {
      const planPrices: Record<string, number> = {
        monthly: 3000,
        quarterly: 8000,
        'half-yearly': 15000,
        yearly: 25000,
      };

      const plan = row.subscriptionPlan || 'monthly';
      const amount = planPrices[plan] || 3000;
      const paidAmount = row.paidAmount || 0;
      const startDate = new Date().toISOString().split('T')[0];

      const calculateEndDate = (start: string, planType: string): string => {
        const date = new Date(start);
        switch (planType) {
          case 'monthly':
            date.setMonth(date.getMonth() + 1);
            break;
          case 'quarterly':
            date.setMonth(date.getMonth() + 3);
            break;
          case 'half-yearly':
            date.setMonth(date.getMonth() + 6);
            break;
          case 'yearly':
            date.setFullYear(date.getFullYear() + 1);
            break;
        }
        return date.toISOString().split('T')[0];
      };

      return {
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email,
        phone: row.phone,
        dateOfBirth: row.dateOfBirth || '',
        gender: (row.gender as 'male' | 'female' | 'other') || 'male',
        address: {
          street: row.street || '',
          city: row.city || '',
          state: row.state || '',
          zipCode: row.zipCode || '',
          country: 'India',
        },
        emergencyContact: {
          name: '',
          phone: '',
          relation: '',
        },
        membershipStartDate: startDate,
        membershipEndDate: calculateEndDate(startDate, plan),
        subscriptionPlan: plan as 'monthly' | 'quarterly' | 'half-yearly' | 'yearly',
        status: paidAmount >= amount ? 'active' : 'pending',
        payment: {
          method: (row.paymentMethod as 'cash' | 'card' | 'upi' | 'bank-transfer') || 'cash',
          status: paidAmount >= amount ? 'paid' : paidAmount > 0 ? 'partial' : 'pending',
          amount,
          paidAmount,
          dueDate: startDate,
        },
      };
    });

    onUpload(members);
    onClose();
  };

  const downloadTemplate = () => {
    const template = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+91 98765 43210',
        dateOfBirth: '1990-01-15',
        gender: 'male',
        street: '123 Main St',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        subscriptionPlan: 'monthly',
        paymentMethod: 'cash',
        paidAmount: 3000,
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Members');
    XLSX.writeFile(wb, 'member_upload_template.xlsx');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Bulk Upload Members</h3>
          <p className="text-sm text-gray-500 mt-1">
            Upload an Excel file to add multiple members at once
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={downloadTemplate}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Download Template
        </Button>
      </div>

      <div
        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-500 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">
          {file ? file.name : 'Click to upload or drag and drop'}
        </p>
        <p className="text-sm text-gray-400">Excel files only (.xlsx, .xls)</p>
      </div>

      {isProcessing && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          <span className="ml-3 text-gray-600">Processing file...</span>
        </div>
      )}

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800 mb-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Validation Errors</span>
          </div>
          <ul className="text-sm text-red-700 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {parsedData.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">
              {parsedData.length} valid records found
            </span>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          disabled={parsedData.length === 0 || isProcessing}
        >
          Upload {parsedData.length} Members
        </Button>
      </div>
    </div>
  );
}
