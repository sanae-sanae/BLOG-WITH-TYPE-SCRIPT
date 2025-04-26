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
import { Checkbox } from '@/components/ui/checkbox';
import { FiArrowRight, FiLock, FiUser } from 'react-icons/fi';

// Login form schema
const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { user, loginMutation } = useAuth();
  
  // If user is already logged in, redirect to home page
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Login form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate({
      username: data.username,
      password: data.password,
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
              Welcome Back
            </motion.h1>
            <p className="text-gray-400">Sign in to continue to Blogosphere</p>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1 flex flex-col">
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
                        <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        <Input
                          {...field}
                          className="w-full pl-10 pr-4 py-3 bg-gray-900/50 text-gray-100 rounded-lg border border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                          placeholder="Enter your username"
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
                          placeholder="Enter your password"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              
              <div className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex items-center">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="text-purple-500 border-gray-600 rounded bg-gray-900/50"
                        />
                      </FormControl>
                      <div className="ml-2 text-sm text-gray-400">Remember me</div>
                    </FormItem>
                  )}
                />
                <a href="#" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                  Forgot password?
                </a>
              </div>
              
              <Button
                type="submit"
                className="mt-6 py-3 px-6 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg hover:from-purple-500 hover:to-fuchsia-500 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-fuchsia-900/30 flex items-center justify-center"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full" />
                ) : null}
                <span>Sign In</span>
                <FiArrowRight className="ml-2" />
              </Button>
            </form>
          </Form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}