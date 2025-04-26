import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { FiUploadCloud, FiSave, FiSend, FiHelpCircle } from 'react-icons/fi';
import { Post } from '@shared/schema';

// Validation schema
const postSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  category: z.string().optional(),
  tags: z.string().optional(),
  imageUrl: z.string().optional(),
  published: z.boolean().default(true),
  authorId: z.number().optional(),
});

type PostFormValues = z.infer<typeof postSchema>;

interface PostFormProps {
  post?: Post;
  onSuccess?: () => void;
}

export default function PostForm({ post, onSuccess }: PostFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [previewImage, setPreviewImage] = useState<string | undefined>(post?.imageUrl || undefined);
  const [isGuidedMode, setIsGuidedMode] = useState(false);
  
  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: post?.title || '',
      content: post?.content || '',
      category: post?.category || '',
      tags: post?.tags || '',
      imageUrl: post?.imageUrl || '',
      published: post?.published === false ? false : true,
    },
  });
  
  const categories = [
    'Technology',
    'Travel',
    'Food',
    'Lifestyle',
    'Health',
    'Writing',
  ];

  // Create or update post mutation
  const mutation = useMutation({
    mutationFn: async (data: PostFormValues) => {
      console.log("Submitting post data:", data);
      try {
        if (post) {
          // Update existing post
          await apiRequest("PUT", `/api/posts/${post.id}`, data);
        } else {
          // Create new post
          await apiRequest("POST", "/api/posts", data);
        }
      } catch (error) {
        console.error("API request error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      toast({
        title: post ? "Post updated" : "Post created",
        description: post 
          ? "Your post has been updated successfully" 
          : "Your post has been published successfully",
      });
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to ${post ? 'update' : 'create'} post: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PostFormValues) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create or edit posts",
        variant: "destructive",
      });
      return;
    }
    
    // Ensure authorId is set and format tags properly
    const formattedData = {
      ...data,
      authorId: user.id,
      // Convert tags from string to array if needed
      tags: data.tags
    };
    
    console.log("Submitting formatted data:", formattedData);
    mutation.mutate(formattedData);
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    form.setValue('imageUrl', url);
    setPreviewImage(url);
  };

  const handleSaveDraft = () => {
    form.setValue('published', false);
    form.handleSubmit(onSubmit)();
  };

  // Guide for creating content
  const promptGuide = [
    "Start with a compelling introduction that hooks your reader",
    "Clearly define the problem or need your article addresses",
    "Share your expertise and insights in a structured way",
    "Include personal experiences or examples to illustrate points",
    "End with a conclusion that summarizes key points and includes a call to action"
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-2 flex items-center">
            <FiHelpCircle className="mr-2 text-purple-400" />
            Guided Writing Tips
          </h3>
          <ul className="space-y-2 text-gray-300">
            {promptGuide.map((tip, index) => (
              <li key={index} className="flex items-start">
                <span className="inline-block bg-purple-500/20 text-purple-400 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">{index + 1}</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
        
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-200">Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter post title..."
                  {...field}
                  className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-800/50 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-200">Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="border-gray-700 bg-gray-800/50 text-gray-200">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                    {categories.map((category) => (
                      <SelectItem key={category} value={category.toLowerCase()}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-200">Tags (comma separated)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. coding, web, tutorial"
                    {...field}
                    className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-800/50 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-200">Featured Image URL</FormLabel>
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 bg-gray-800/30">
                {previewImage ? (
                  <div className="mb-4">
                    <img 
                      src={previewImage} 
                      alt="Post preview" 
                      className="max-h-40 mx-auto"
                      onError={() => setPreviewImage(undefined)}
                    />
                  </div>
                ) : (
                  <div className="space-y-2 text-center">
                    <FiUploadCloud className="mx-auto text-3xl text-gray-400" />
                    <p className="text-sm text-gray-400">Enter an image URL below</p>
                  </div>
                )}
                <FormControl>
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={field.value || ''}
                    onChange={(e) => {
                      field.onChange(e);
                      handleImageUrlChange(e);
                    }}
                    className="mt-4 w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-800/50 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  />
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-200">Content</FormLabel>
              <div className="border border-gray-700 rounded-lg overflow-hidden bg-gray-800/50">
                <div className="flex border-b border-gray-700 bg-gray-800/80 px-3 py-2">
                  <button type="button" className="p-1 text-gray-400 hover:text-purple-400 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
                      <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
                    </svg>
                  </button>
                  <button type="button" className="p-1 text-gray-400 hover:text-purple-400 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="19" y1="4" x2="10" y2="4"></line>
                      <line x1="14" y1="20" x2="5" y2="20"></line>
                      <line x1="15" y1="4" x2="9" y2="20"></line>
                    </svg>
                  </button>
                  <button type="button" className="p-1 text-gray-400 hover:text-purple-400 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                    </svg>
                  </button>
                </div>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={10}
                    placeholder="Write your post content here..."
                    className="w-full px-4 py-3 focus:ring-0 focus:outline-none border-none bg-gray-800/30 text-gray-200"
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            className="px-6 py-3 bg-gray-800 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-gray-700 hover:text-purple-300 transition-colors"
            onClick={handleSaveDraft}
            disabled={mutation.isPending}
          >
            <FiSave className="mr-2" />
            Save as Draft
          </Button>
          <Button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-purple-900/20"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full" />
            ) : (
              <FiSend className="mr-2" />
            )}
            {post ? "Update Post" : "Publish Post"}
          </Button>
        </div>
      </form>
    </Form>
  );
}