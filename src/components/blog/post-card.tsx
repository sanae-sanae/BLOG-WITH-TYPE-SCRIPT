import { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Post, User } from '@shared/schema';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FiEdit2, FiTrash2, FiMessageCircle } from 'react-icons/fi';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import PostForm from './post-form-simplified';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface PostCardProps {
  post: Post;
  author?: User;
  isFeatured?: boolean;
  onDelete?: () => void;
}

export default function PostCard({ post, author, isFeatured = false, onDelete }: PostCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const canEdit = user && (user.id === post.authorId || user.isAdmin);
  
  const formattedDate = post.createdAt 
    ? format(new Date(post.createdAt), 'MMMM dd, yyyy')
    : '';
    
  // Get color for category badge
  const getCategoryColor = (category?: string | null) => {
    if (!category) return 'bg-gray-700/50 text-gray-300 border-gray-600/50';
    
    switch(category.toLowerCase()) {
      case 'technology':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'travel':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'food':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'lifestyle':
        return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      case 'health':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'writing':
        return 'bg-violet-500/20 text-violet-400 border-violet-500/30';
      default:
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    }
  };
  
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/posts/${post.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      toast({
        title: "Post deleted",
        description: "The post has been successfully deleted.",
      });
      if (onDelete) onDelete();
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete post: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleDeletePost = () => {
    deleteMutation.mutate();
  };

  if (isFeatured) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden shadow-lg hover:shadow-purple-900/20 transition-all duration-300">
          <div className="md:flex">
            <div className="md:w-1/2">
              {post.imageUrl ? (
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-64 md:h-full object-cover"
                />
              ) : (
                <div className="w-full h-64 md:h-full bg-gray-700/50 flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>
            <div className="p-6 md:w-1/2 flex flex-col">
              <div className="flex items-center mb-2">
                <Badge variant="outline" className={getCategoryColor(post.category || undefined)}>
                  {post.category || 'Uncategorized'}
                </Badge>
                <span className="text-xs text-gray-400 ml-3">{formattedDate}</span>
              </div>
              <h3 className="font-heading font-bold text-xl mb-3 text-gray-200">{post.title}</h3>
              <p className="text-gray-400 mb-4 line-clamp-3">{post.content}</p>
              <div className="flex items-center mt-auto">
                <Avatar className="h-10 w-10 mr-3 border-2 border-purple-500/30 bg-gray-800">
                  <AvatarFallback className="bg-purple-800/30 text-purple-300">{author?.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-300">{author?.fullName || author?.username || 'Unknown'}</p>
                  <p className="text-sm text-gray-500">{author?.isAdmin ? 'Admin' : 'User'}</p>
                </div>
              </div>
              
              {canEdit && (
                <div className="flex mt-4 space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center bg-gray-800/80 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-purple-400"
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    <FiEdit2 className="mr-1" /> Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center bg-gray-800/80 border-red-900/50 text-red-400 hover:bg-red-900/20"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <FiTrash2 className="mr-1" /> Delete
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
        
        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-4xl bg-gray-900 border border-gray-700/50">
            <DialogHeader>
              <DialogTitle className="text-gray-200">Edit Post</DialogTitle>
            </DialogHeader>
            <PostForm 
              post={post} 
              onSuccess={() => setIsEditModalOpen(false)} 
            />
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="bg-gray-900 border border-gray-700/50">
            <DialogHeader>
              <DialogTitle className="text-gray-200">Confirm Deletion</DialogTitle>
            </DialogHeader>
            <p className="py-4 text-gray-300">Are you sure you want to delete this post? This action cannot be undone.</p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 hover:text-gray-200">Cancel</Button>
              <Button 
                variant="destructive" 
                onClick={handleDeletePost}
                disabled={deleteMutation.isPending}
                className="bg-red-900/80 hover:bg-red-800 text-gray-200"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="h-full"
    >
      <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden shadow-lg h-full flex flex-col hover:shadow-purple-900/20 transition-all duration-300">
        <div className="relative h-48">
          {post.imageUrl ? (
            <img 
              src={post.imageUrl} 
              alt={post.title} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full bg-gray-700/50 flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <Badge variant="outline" className={`${getCategoryColor(post.category || undefined)} backdrop-blur-sm`}>
              {post.category || 'Uncategorized'}
            </Badge>
          </div>
        </div>
        <CardContent className="p-5 flex-grow">
          <h3 className="font-heading font-bold text-lg mb-2 text-gray-200">{post.title}</h3>
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">{post.content}</p>
        </CardContent>
        <CardFooter className="px-5 py-4 border-t border-gray-700/50 flex justify-between items-center">
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2 border border-purple-500/30 bg-gray-800">
              <AvatarFallback className="bg-purple-800/30 text-purple-300">{author?.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-300">{author?.username || 'Unknown'}</span>
          </div>
          <span className="text-xs text-gray-500">{formattedDate}</span>
        </CardFooter>
        
        {canEdit && (
          <div className="px-5 py-3 border-t border-gray-700/50 flex justify-end space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-purple-400 hover:bg-gray-700/50 hover:text-purple-300"
              onClick={() => setIsEditModalOpen(true)}
            >
              <FiEdit2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-red-400 hover:bg-red-900/20 hover:text-red-300"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <FiTrash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </Card>
      
      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-4xl bg-gray-900 border border-gray-700/50">
          <DialogHeader>
            <DialogTitle className="text-gray-200">Edit Post</DialogTitle>
          </DialogHeader>
          <PostForm 
            post={post} 
            onSuccess={() => setIsEditModalOpen(false)} 
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-gray-900 border border-gray-700/50">
          <DialogHeader>
            <DialogTitle className="text-gray-200">Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="py-4 text-gray-300">Are you sure you want to delete this post? This action cannot be undone.</p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 hover:text-gray-200">Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleDeletePost}
              disabled={deleteMutation.isPending}
              className="bg-red-900/80 hover:bg-red-800 text-gray-200"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
