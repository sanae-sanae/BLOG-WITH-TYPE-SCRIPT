import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FiArrowRight, FiLock, FiUser, FiUserPlus, FiMail } from 'react-icons/fi';

// Registration form schema
const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(3, 'Full name must be at least 3 characters').optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [, navigate] = useLocation();
  const { user, registerMutation } = useAuth();
  const { toast } = useToast();
  
  // If user is already logged in, redirect to home page
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Register form
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      fullName: '',
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate({
      username: data.username,
      password: data.password,
      fullName: data.fullName,
    }, {
      onSuccess: () => {
        // After successful registration, navigate to login
        navigate('/login');
        // Show a toast notification to inform the user
        toast({
          title: "Account created!",
          description: "You can now login with your credentials",
          variant: "default",
        });
      }
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gray-900">
      {/* Dark Mode Background with Glow Effect */}
      <div className="absolute inset-0 -z-10 bg-black">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-90"></div>
        <motion.div 
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-purple-700/20 blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1], 
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            repeatType: 'reverse',
            ease: 'easeInOut'
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-indigo-700/20 blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2], 
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity, 
            repeatType: 'reverse',
            ease: 'easeInOut',
            delay: 2
          }}
        />
      </div>
      
      {/* Card Container with frosted glass effect */}
      <div className="container max-w-md mx-auto px-4 z-10">
        <motion.div 
          className="bg-gray-800/90 backdrop-blur-sm rounded-xl border border-gray-700 shadow-2xl p-8 flex flex-col"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <motion.h1 
              className="font-heading text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-400 mb-2"
              animate={{ 
                backgroundPosition: ['0% center', '100% center', '0% center'],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              Join Blogosphere
            </motion.h1>
            <p className="text-gray-400">Create your account to start blogging</p>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex-1 flex flex-col">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        <Input
                          {...field}
                          className="w-full pl-10 pr-4 py-3 bg-gray-900/50 text-gray-100 rounded-lg border border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                          placeholder="Enter your full name"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">
                      Username
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        <Input
                          {...field}
                          className="w-full pl-10 pr-4 py-3 bg-gray-900/50 text-gray-100 rounded-lg border border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                          placeholder="Choose a username"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        <Input
                          {...field}
                          type="password"
                          className="w-full pl-10 pr-4 py-3 bg-gray-900/50 text-gray-100 rounded-lg border border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                          placeholder="Create a password"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        <Input
                          {...field}
                          type="password"
                          className="w-full pl-10 pr-4 py-3 bg-gray-900/50 text-gray-100 rounded-lg border border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                          placeholder="Confirm your password"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              
              <Button
                type="submit"
                className="mt-6 py-3 px-6 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg hover:from-purple-500 hover:to-fuchsia-500 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-fuchsia-900/30 flex items-center justify-center"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full" />
                ) : null}
                <span>Create Account</span>
                <FiUserPlus className="ml-2" />
              </Button>
            </form>
          </Form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}