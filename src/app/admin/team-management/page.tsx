'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { Shield, KeyRound, UserPlus, Mail, User, Loader2 } from 'lucide-react';

const employeeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

export default function TeamManagementPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    }
  });

  const generateSecurePassword = () => {
    setIsGenerating(true);
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let newPassword = "";
    for (let i = 0, n = charset.length; i < 12; ++i) {
      newPassword += charset.charAt(Math.floor(Math.random() * n));
    }
    
    // Small delay for visual feedback
    setTimeout(() => {
      setValue('password', newPassword, { shouldValidate: true });
      setIsGenerating(false);
      toast.success('Secure password generated');
    }, 400);
  };

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      const response = await fetch('/api/admin/team/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add employee');
      }

      toast.success('Employee added successfully! Onboarding email sent.');
      reset();
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 dark:text-white">
          <Shield className="w-8 h-8 text-blue-600" />
          Team Management
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Onboard new employees and grant them access to the platform. They will receive an email with their login credentials.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            Add New Employee
          </h3>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            
            {/* Name Field */}
            <div className="sm:col-span-1">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  {...register('name')}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md py-2.5 transition-colors"
                  placeholder="John Doe"
                />
              </div>
              {errors.name && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="sm:col-span-1">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  {...register('email')}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md py-2.5 transition-colors"
                  placeholder="john@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="sm:col-span-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password <span className="text-gray-400 font-normal">(Leave blank to auto-generate)</span>
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <div className="relative flex-grow focus-within:z-10">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="password"
                    {...register('password')}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 rounded-none rounded-l-md sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white py-2.5 transition-colors"
                    placeholder="Enter custom password or auto-generate"
                  />
                </div>
                <button
                  type="button"
                  onClick={generateSecurePassword}
                  disabled={isGenerating}
                  className="relative -ml-px inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-r-md text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin text-blue-500" /> : <Shield className="h-4 w-4 text-blue-500" />}
                  <span>Generate</span>
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center items-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Employee'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
