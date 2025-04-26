import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import ThreeScene from '@/components/ui/three-scene';
import { FiArrowRight, FiUserPlus } from 'react-icons/fi';

// Login form schema
const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

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

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  
  // If user is already logged in, redirect to home page
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false,
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      fullName: '',
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate({
      username: data.username,
      password: data.password,
    });
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate({
      username: data.username,
      password: data.password,
      fullName: data.fullName,
    }, {
      onSuccess: () => {
        // After successful registration, flip back to the login page
        setIsFlipped(false);
        // Show a toast notification to inform the user
        toast({
          title: "Account created!",
          description: "You can now login with your credentials",
          variant: "default",
        });
      }
    });
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
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
        <motion.div 
          className="absolute top-1/2 right-1/3 w-72 h-72 rounded-full bg-fuchsia-700/20 blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1], 
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{ 
            duration: 12, 
            repeat: Infinity, 
            repeatType: 'reverse',
            ease: 'easeInOut',
            delay: 4
          }}
        />
      </div>
      
      {/* Animated Particles */}
      <div className="absolute inset-0 -z-5 opacity-30">
        <ThreeScene isFlipped={isFlipped} onFlip={handleFlip} />
      </div>
      
      {/* Card Container with frosted glass effect */}
      <div className="container max-w-md mx-auto px-4 z-10">
        <motion.div 
          className="preserve-3d relative w-full"
          style={{ height: 550 }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        >
          
          {/* Login Side */}
          <div className="absolute inset-0 backface-hidden bg-gray-800/90 backdrop-blur-sm rounded-xl border border-gray-700 shadow-2xl p-8 flex flex-col">
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
                Blogosphere
              </motion.h1>
              <p className="text-gray-400">Share your stories with the world</p>
            </div>
            
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6 flex-1 flex flex-col">
                <FormField
                  control={loginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">
                        Username
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="w-full px-4 py-3 bg-gray-900/50 text-gray-100 rounded-lg border border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                          placeholder="Enter your username"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          className="w-full px-4 py-3 bg-gray-900/50 text-gray-100 rounded-lg border border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                          placeholder="Enter your password"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <div className="flex items-center justify-between">
                  <FormField
                    control={loginForm.control}
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
                  className="mt-auto py-3 px-6 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg hover:from-purple-500 hover:to-fuchsia-500 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-fuchsia-900/30 flex items-center justify-center"
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
                <button
                  type="button"
                  onClick={handleFlip}
                  className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </div>
          
          {/* Register Side */}
          <div className="absolute inset-0 backface-hidden bg-gray-800/90 backdrop-blur-sm rounded-xl border border-gray-700 shadow-2xl p-8 flex flex-col rotate-y-180">
            <div className="text-center mb-6">
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
              <p className="text-gray-400">Create your account today</p>
            </div>
            
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4 flex-1 flex flex-col">
                <FormField
                  control={registerForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="w-full px-4 py-3 bg-gray-900/50 text-gray-100 rounded-lg border border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                          placeholder="Enter your full name"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">
                        Username
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="w-full px-4 py-3 bg-gray-900/50 text-gray-100 rounded-lg border border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                          placeholder="Choose a username"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          className="w-full px-4 py-3 bg-gray-900/50 text-gray-100 rounded-lg border border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                          placeholder="Create a password"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          className="w-full px-4 py-3 bg-gray-900/50 text-gray-100 rounded-lg border border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                          placeholder="Confirm your password"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <Button
                  type="submit"
                  className="mt-auto py-3 px-6 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg hover:from-purple-500 hover:to-fuchsia-500 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-fuchsia-900/30 flex items-center justify-center"
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
                <button
                  type="button"
                  onClick={handleFlip}
                  className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
