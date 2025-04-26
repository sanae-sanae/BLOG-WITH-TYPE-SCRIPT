import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Post, User } from '@shared/schema';
import PostForm from '@/components/blog/post-form-simplified';
import { FiTrendingUp, FiEye, FiUsers, FiMessageCircle, FiPlus, FiActivity, FiFileText, FiUser, FiMessageSquare, FiSettings, FiEdit, FiTrash2, FiGrid } from 'react-icons/fi';

export default function AdminPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Redirect non-admin users to the home page
  if (user && !user.isAdmin) {
    navigate('/');
    return null;
  }

  // Fetch all posts and users
  const { data: posts = [] } = useQuery<Post[]>({
    queryKey: ['/api/posts'],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  // Stats calculations
  const totalPosts = posts.length;
  const totalViews = 12500; // This would come from a real API
  const totalUsers = users.length;
  const totalComments = 324; // This would come from a real API

  return (
    <div className="bg-gray-900 min-h-screen text-gray-200">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800/50 shadow-md fixed h-full border-r border-gray-700/50">
          <div className="p-6 border-b">
            <h2 className="font-heading text-xl font-bold gradient-text">Admin Panel</h2>
          </div>
          <nav className="mt-6 px-4">
            <ul className="space-y-2">
              <li>
                <a href="#" className="flex items-center px-4 py-3 text-primary bg-primary/10 rounded-lg">
                  <FiGrid className="w-5 h-5 mr-3" />
                  <span>Dashboard</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors">
                  <FiFileText className="w-5 h-5 mr-3" />
                  <span>Posts</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors">
                  <FiUsers className="w-5 h-5 mr-3" />
                  <span>Users</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors">
                  <FiMessageSquare className="w-5 h-5 mr-3" />
                  <span>Comments</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors">
                  <FiSettings className="w-5 h-5 mr-3" />
                  <span>Settings</span>
                </a>
              </li>
              <li>
                <a href="/" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors">
                  <FiUser className="w-5 h-5 mr-3" />
                  <span>Return to Blog</span>
                </a>
              </li>
            </ul>
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="ml-64 flex-1 p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-heading font-bold">Dashboard Overview</h1>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors shadow"
            >
              <FiPlus className="mr-2" />
              <span>Create Post</span>
            </Button>
          </div>
          
          {/* Stats Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-purple-500/20 p-3 mr-4">
                  <FiFileText className="text-purple-400 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Posts</p>
                  <h3 className="text-2xl font-bold text-gray-200">{totalPosts}</h3>
                </div>
              </div>
              <div className="mt-4 text-xs text-green-400 flex items-center">
                <FiTrendingUp className="mr-1" />
                <span>12% increase this month</span>
              </div>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-indigo-500/20 p-3 mr-4">
                  <FiEye className="text-indigo-400 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Views</p>
                  <h3 className="text-2xl font-bold text-gray-200">{totalViews.toLocaleString()}</h3>
                </div>
              </div>
              <div className="mt-4 text-xs text-green-400 flex items-center">
                <FiTrendingUp className="mr-1" />
                <span>18% increase this month</span>
              </div>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-blue-500/20 p-3 mr-4">
                  <FiUsers className="text-blue-400 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Users</p>
                  <h3 className="text-2xl font-bold text-gray-200">{totalUsers}</h3>
                </div>
              </div>
              <div className="mt-4 text-xs text-green-400 flex items-center">
                <FiTrendingUp className="mr-1" />
                <span>7% increase this month</span>
              </div>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-pink-500/20 p-3 mr-4">
                  <FiMessageCircle className="text-pink-400 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Comments</p>
                  <h3 className="text-2xl font-bold text-gray-200">{totalComments}</h3>
                </div>
              </div>
              <div className="mt-4 text-xs text-green-400 flex items-center">
                <FiTrendingUp className="mr-1" />
                <span>24% increase this month</span>
              </div>
            </div>
          </motion.div>
          
          {/* Recent Posts Table */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden mb-8"
          >
            <div className="px-6 py-4 border-b border-gray-700/50 flex justify-between items-center">
              <h2 className="font-heading font-semibold text-lg text-gray-200">Recent Posts</h2>
              <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">View All</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/70">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Published</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/30">
                  {posts.slice(0, 5).map((post) => (
                    <tr key={post.id} className="bg-gray-800/20 hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-200">{post.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 mr-2">
                            <FiUser className="w-3 h-3" />
                          </div>
                          <div className="text-sm text-gray-300">
                            {users.find(u => u.id === post.authorId)?.username || 'Unknown'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-500/20 text-purple-400">
                          {post.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          post.published 
                            ? 'bg-green-900/30 text-green-400' 
                            : 'bg-yellow-900/30 text-yellow-400'
                        }`}>
                          {post.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a href="#" className="text-purple-400 hover:text-purple-300 mr-3">
                          <FiEdit className="inline h-4 w-4" />
                        </a>
                        <a href="#" className="text-red-400 hover:text-red-300">
                          <FiTrash2 className="inline h-4 w-4" />
                        </a>
                      </td>
                    </tr>
                  ))}
                  
                  {posts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                        No posts found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
          
          {/* Recent Users Table */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-700/50 flex justify-between items-center">
              <h2 className="font-heading font-semibold text-lg text-gray-200">Recent Users</h2>
              <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">View All</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/70">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Full Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Posts</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/30">
                  {users.map((user) => {
                    const userPosts = posts.filter(p => p.authorId === user.id);
                    
                    return (
                      <tr key={user.id} className="bg-gray-800/20 hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-200">{user.username}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {user.fullName || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.isAdmin 
                              ? 'bg-purple-900/30 text-purple-400' 
                              : 'bg-blue-900/30 text-blue-400'
                          }`}>
                            {user.isAdmin ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {userPosts.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <a href="#" className="text-purple-400 hover:text-purple-300 mr-3">View</a>
                        </td>
                      </tr>
                    );
                  })}
                  
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-400">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </main>
      </div>
      
      {/* Create Post Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border border-gray-700/50">
          <DialogHeader>
            <DialogTitle className="text-gray-200">Create New Post</DialogTitle>
          </DialogHeader>
          <PostForm onSuccess={() => setIsCreateModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
