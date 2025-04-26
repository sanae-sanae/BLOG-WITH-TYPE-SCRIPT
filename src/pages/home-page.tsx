import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Post, User } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';
import PostCard from '@/components/blog/post-card';
import PostForm from '@/components/blog/post-form-simplified';

import PostFilters from '@/components/blog/post-filters';
import { useLocation } from 'wouter';
import { FiLogOut, FiPlus, FiUser, FiSettings, FiChevronDown, FiRefreshCw, FiTrendingUp } from 'react-icons/fi';
import { from, map, filter } from 'rxjs';
import { fetchExternalPosts, fetchExternalPostsByCategory, searchExternalPosts } from '@/lib/api-service';
import { queryClient } from '@/lib/queryClient';

export default function HomePage() {

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();

  // Fetch all posts from internal API
  const { data: internalPosts = [], isLoading: isLoadingInternalPosts } = useQuery<Post[]>({
    queryKey: ['/api/posts'],
  });
  
  // Fetch external posts based on selected category
  const { data: externalPosts = [], isLoading: isLoadingExternalPosts } = useQuery<Post[]>({
    queryKey: ['external-posts', selectedCategory],
    queryFn: () => selectedCategory === 'all' 
      ? fetchExternalPosts(20)
      : fetchExternalPostsByCategory(selectedCategory),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });
  
  // Pre-fetch other category posts in the background for faster category switching
  useEffect(() => {
    // If "writing" category is selected, open the create post modal
    if (selectedCategory === 'writing') {
      setIsCreateModalOpen(true);
      // Reset to "all" category after modal opens
      setSelectedCategory('all');
      return;
    }
    
    const preloadCategories = ['technology', 'travel', 'food', 'lifestyle', 'health', 'writing'];
    
    // Don't preload the current category
    const categoriesToPreload = preloadCategories.filter(cat => 
      cat.toLowerCase() !== selectedCategory.toLowerCase()
    );
    
    // Preload in the background
    for (const category of categoriesToPreload) {
      queryClient.prefetchQuery({
        queryKey: ['external-posts', category],
        queryFn: () => fetchExternalPostsByCategory(category),
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
      });
    }
  }, [selectedCategory]);
  
  // Combine internal and external posts
  const posts = [...internalPosts, ...externalPosts];
  const isLoadingPosts = isLoadingInternalPosts || isLoadingExternalPosts;

  // Categories available
  const categories = [
    'Technology',
    'Travel',
    'Food',
    'Lifestyle',
    'Health',
    'Writing',
  ];

  // Use RxJS to filter and sort posts
  useEffect(() => {
    const posts$ = from([posts]);
    
    const filtered$ = posts$.pipe(
      map(posts => {
        // Filter by category if not 'all'
        if (selectedCategory !== 'all') {
          return posts.filter(post => post.category?.toLowerCase() === selectedCategory);
        }
        return posts;
      }),
      map(posts => {
        // Filter by search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return posts.filter(post => 
            post.title.toLowerCase().includes(query) || 
            post.content.toLowerCase().includes(query) ||
            post.tags?.toLowerCase().includes(query)
          );
        }
        return posts;
      }),
      map(posts => {
        // Sort posts
        return [...posts].sort((a, b) => {
          switch (sortBy) {
            case 'oldest':
              return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
            case 'title_asc':
              return a.title.localeCompare(b.title);
            case 'title_desc':
              return b.title.localeCompare(a.title);
            case 'latest':
            default:
              return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          }
        });
      })
    );
    
    const subscription = filtered$.subscribe(filteredPosts => {
      setFilteredPosts(filteredPosts);
    });
    
    return () => subscription.unsubscribe();
  }, [posts, selectedCategory, searchQuery, sortBy]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleNavigateToAdmin = () => {
    navigate('/admin');
  };
  
  // Handle search functionality
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 0) {
      // Search using the external API
      const results = await searchExternalPosts(query);
      // Update the filtered posts directly with search results
      setFilteredPosts(results);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header/Navigation */}
      <header className="bg-gray-800/80 backdrop-blur-sm shadow-lg border-b border-gray-700/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <motion.h1 
                className="text-2xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-400"
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
            </div>
            
            <div className="flex items-center space-x-6">
              <nav className="hidden md:flex items-center space-x-6">
                <a href="/" className="font-medium text-gray-300 hover:text-purple-400 transition-colors">Home</a>
                <a href="#my-posts" className="font-medium text-gray-300 hover:text-purple-400 transition-colors">My Posts</a>
                <Button 
                  onClick={() => setIsCreateModalOpen(true)}
                  variant="ghost"
                  className="font-medium text-gray-300 hover:text-purple-400 transition-colors"
                >
                  <FiPlus className="mr-2" />
                  Create Post
                </Button>
              </nav>
              
              <div className="relative">
                <Button 
                  variant="ghost"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center focus:outline-none border border-gray-700 bg-gray-800/50 hover:bg-gray-700/50"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 mr-2">
                    <FiUser />
                  </div>
                  <span className="text-sm font-medium text-gray-300">{user?.fullName || user?.username}</span>
                  <FiChevronDown className="ml-2 text-gray-400" />
                </Button>
                
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-2 z-10 border border-gray-700"
                    >
                      <div className="px-4 py-2 border-b border-gray-700">
                        <p className="text-sm font-semibold text-gray-200">{user?.fullName || user?.username}</p>
                        <p className="text-xs text-gray-400">{user?.isAdmin ? 'Administrator' : 'User'}</p>
                      </div>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Profile</a>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Settings</a>
                      {user?.isAdmin && (
                        <button 
                          onClick={handleNavigateToAdmin}
                          className="w-full text-left block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                        >
                          Admin Dashboard
                        </button>
                      )}
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left block px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filter */}
        <PostFilters 
          onCategoryChange={setSelectedCategory}
          onSearchChange={handleSearch}
          onSortChange={setSortBy}
          categories={categories}
          selectedCategory={selectedCategory}
        />
        
        {/* Featured Post - first post or empty state */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <motion.h2 
            className="text-3xl font-heading font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-400 inline-block"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Featured Post
          </motion.h2>
          
          {isLoadingPosts ? (
            <Card className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-gray-700/50 h-64 animate-pulse">
              <div className="md:flex h-full">
                <div className="md:w-1/2 bg-gray-700/50"></div>
                <div className="p-6 md:w-1/2 flex flex-col">
                  <div className="h-4 bg-gray-700/50 rounded w-1/4 mb-4"></div>
                  <div className="h-6 bg-gray-700/50 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-700/50 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-700/50 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-700/50 rounded w-3/4 mb-4"></div>
                  <div className="mt-auto flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-700/50 mr-3"></div>
                    <div>
                      <div className="h-4 bg-gray-700/50 rounded w-24 mb-1"></div>
                      <div className="h-3 bg-gray-700/50 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ) : filteredPosts.length > 0 ? (
            <PostCard post={filteredPosts[0]} isFeatured={true} />
          ) : (
            <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="mb-6 text-purple-500/50">
                  <FiRefreshCw className="h-16 w-16 mx-auto animate-spin-slow" />
                </div>
                <h3 className="text-xl font-heading font-medium mb-3 text-gray-200">Loading Fresh Content</h3>
                <p className="text-gray-400 mb-6">
                  {searchQuery 
                    ? `Searching for "${searchQuery}" in our blog database...`
                    : selectedCategory !== 'all'
                    ? `Filtering for "${selectedCategory}" category...`
                    : "Connecting to external blogs to fetch the latest articles..."}
                </p>
                <Button 
                  onClick={() => setIsCreateModalOpen(true)} 
                  className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-medium"
                >
                  <FiPlus className="mr-2" />
                  Create Your Own Post
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
        
        {/* Recent Posts Grid */}
        {filteredPosts.length > 1 && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <motion.h2 
                className="text-3xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-400 inline-block"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                Recent Articles
              </motion.h2>
              
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  className="text-gray-300 hover:text-purple-400 mr-2"
                  title="Refresh posts"
                  onClick={() => {
                    queryClient.invalidateQueries({ queryKey: ['external-posts'] });
                  }}
                >
                  <FiRefreshCw className="mr-2" />
                  Refresh
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-gray-300 hover:text-purple-400"
                  title="View trending articles"
                >
                  <FiTrendingUp className="mr-2" />
                  Trending
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.slice(1).map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <PostCard 
                    post={post} 
                  />
                </motion.div>
              ))}
            </div>
            
            {filteredPosts.length > 10 && (
              <div className="mt-8 flex justify-center">
                <Button 
                  variant="outline" 
                  className="px-6 py-3 bg-gray-800/50 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-500/20 transition-colors shadow-lg shadow-purple-900/10"
                >
                  Load More Articles
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
      
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
