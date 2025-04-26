import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FiSearch, FiX } from 'react-icons/fi';

interface PostFiltersProps {
  onCategoryChange: (category: string) => void;
  onSearchChange: (query: string) => void;
  onSortChange: (sortBy: string) => void;
  categories: string[];
  selectedCategory: string;
}

export default function PostFilters({
  onCategoryChange,
  onSearchChange,
  onSortChange,
  categories,
  selectedCategory,
}: PostFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(searchQuery);
  };
  
  const clearSearch = () => {
    setSearchQuery('');
    onSearchChange('');
  };
  
  const sortOptions = [
    { value: 'latest', label: 'Latest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'title_asc', label: 'Title (A-Z)' },
    { value: 'title_desc', label: 'Title (Z-A)' },
  ];

  return (
    <div className="mb-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.h2 
          className="text-2xl font-heading font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-400 inline-block"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          Explore Categories
        </motion.h2>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            className={selectedCategory === 'all' 
              ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white border-0' 
              : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50 hover:text-purple-400'
            }
            onClick={() => onCategoryChange('all')}
          >
            All
          </Button>
          
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category.toLowerCase() ? 'default' : 'outline'}
              className={
                selectedCategory === category.toLowerCase()
                  ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white border-0'
                  : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50 hover:text-purple-400'
              }
              onClick={() => onCategoryChange(category.toLowerCase())}
            >
              {category}
            </Button>
          ))}
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-800/30 backdrop-blur-sm p-4 rounded-lg border border-gray-700/50"
      >
        <form onSubmit={handleSearch} className="relative w-full sm:w-64">
          <Input
            type="text"
            placeholder="Search blogs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 py-2 rounded-full bg-gray-900/50 border-gray-700 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all w-full placeholder:text-gray-500"
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-purple-400"
            >
              <FiX />
            </button>
          )}
        </form>
        
        <div className="flex items-center">
          <span className="text-sm text-gray-400 mr-2">Sort by:</span>
          <Select onValueChange={onSortChange} defaultValue="latest">
            <SelectTrigger className="w-36 bg-gray-800/80 border-gray-700 text-gray-300 focus:ring-purple-500">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-gray-300">
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="hover:bg-gray-700 focus:bg-gray-700">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>
    </div>
  );
}
