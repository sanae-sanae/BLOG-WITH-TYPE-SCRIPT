import { Post } from '@shared/schema';

// Type for external API data
interface ExternalBlogPost {
  id: number;
  title: string;
  body: string;
  userId: number;
  tags: string[];
  reactions: number;
}

interface ExternalApiResponse {
  posts: ExternalBlogPost[];
  total: number;
  skip: number;
  limit: number;
}

// Function to map external post data to our Post schema
export function mapExternalPostToSchema(post: ExternalBlogPost): Omit<Post, 'createdAt'> & { createdAt: Date } {
  return {
    id: post.id,
    title: post.title,
    content: post.body,
    authorId: post.userId,
    category: post.tags[0] || 'Uncategorized',
    tags: post.tags.join(','),
    imageUrl: `https://picsum.photos/seed/${post.id}/800/500`, // Random images using the post id as seed
    createdAt: new Date(),
    published: true,
  };
}

// Fetch posts from external API
export async function fetchExternalPosts(limit = 10, skip = 0): Promise<Post[]> {
  try {
    const response = await fetch(`https://dummyjson.com/posts?limit=${limit}&skip=${skip}`);
    if (!response.ok) {
      throw new Error('Failed to fetch posts from external API');
    }
    const data: ExternalApiResponse = await response.json();
    return data.posts.map(mapExternalPostToSchema);
  } catch (error) {
    console.error('Error fetching external posts:', error);
    return [];
  }
}

// Fetch posts by category
export async function fetchExternalPostsByCategory(category: string): Promise<Post[]> {
  try {
    if (category === 'all') {
      return fetchExternalPosts(20);
    }
    
    // For specific categories, use a separate API
    if (['technology', 'travel', 'food', 'lifestyle', 'health'].includes(category.toLowerCase())) {
      // For now we'll use a single source and apply category tags, but this could be
      // switched to category-specific APIs in a production environment
      console.log(`Fetching posts for category: ${category}`);
      
      // Get a variety of posts to categorize
      const response = await fetch(`https://dummyjson.com/posts?limit=100`);
      if (!response.ok) {
        throw new Error('Failed to fetch posts from external API');
      }
      
      const data: ExternalApiResponse = await response.json();
      
      // Map category names to potential tags and keywords in the API data
      const categoryToTags: Record<string, string[]> = {
        'technology': ['tech', 'digital', 'programming', 'computer', 'technology', 'software', 'hardware', 'app', 'innovation'],
        'travel': ['travel', 'trip', 'adventure', 'vacation', 'journey', 'tourism', 'destination', 'explore', 'world'],
        'food': ['food', 'cooking', 'recipe', 'cuisine', 'meal', 'restaurant', 'dinner', 'lunch', 'breakfast', 'eat'],
        'lifestyle': ['lifestyle', 'life', 'living', 'family', 'home', 'personal', 'style', 'trends', 'fashion'],
        'health': ['health', 'fitness', 'wellness', 'exercise', 'medical', 'nutrition', 'workout', 'diet', 'mental'],
      };

      // Keywords to search in post content or title
      const categoryKeywords: Record<string, string[]> = {
        'technology': ['new', 'digital', 'future', 'smart', 'device', 'online', 'virtual', 'product'],
        'travel': ['visit', 'place', 'country', 'hotel', 'experience', 'flight', 'tour', 'holiday'],
        'food': ['delicious', 'tasty', 'recipe', 'cook', 'restaurant', 'chef', 'ingredients', 'flavor'],
        'lifestyle': ['trend', 'modern', 'style', 'design', 'fashion', 'home', 'decoration', 'living'],
        'health': ['healthy', 'exercise', 'fitness', 'diet', 'nutrition', 'weight', 'wellness', 'body'],
      };

      // Enhanced filtering logic - match against tags AND content
      const matchingTags = categoryToTags[category.toLowerCase()] || [category.toLowerCase()];
      const matchingKeywords = categoryKeywords[category.toLowerCase()] || [];
      
      let filteredPosts = data.posts.filter(post => {
        // Check if any tag matches our category tags
        const tagMatch = post.tags.some(tag => 
          matchingTags.some(matchTag => tag.toLowerCase().includes(matchTag))
        );
        
        // Check if title or content contains any of our category keywords
        const contentMatch = matchingKeywords.some(keyword => 
          post.title.toLowerCase().includes(keyword) || 
          post.body.toLowerCase().includes(keyword)
        );
        
        return tagMatch || contentMatch;
      });
      
      // Force category assignment for better user experience
      filteredPosts = filteredPosts.map(post => ({
        ...post,
        // Make sure the first tag is the category for proper display
        tags: [category.toLowerCase(), ...post.tags.filter(tag => tag.toLowerCase() !== category.toLowerCase())]
      }));
      
      // If not enough posts match the category, add some with the category tag
      if (filteredPosts.length < 5) {
        // Select random posts and add the category tag
        const additionalPosts = data.posts
          .filter(post => !filteredPosts.includes(post))
          .slice(0, 10 - filteredPosts.length)
          .map(post => ({
            ...post,
            tags: [category.toLowerCase(), ...post.tags]
          }));
        
        filteredPosts = [...filteredPosts, ...additionalPosts];
      }
      
      console.log(`Found ${filteredPosts.length} posts for category: ${category}`);
      
      // Map to our schema and ensure the category is set correctly
      return filteredPosts.map(post => {
        const mappedPost = mapExternalPostToSchema(post);
        // Force the category to be correct
        mappedPost.category = category.toLowerCase();
        return mappedPost;
      });
    }
    
    // For other categories, use the original approach
    const response = await fetch(`https://dummyjson.com/posts?limit=100`);
    if (!response.ok) {
      throw new Error('Failed to fetch posts from external API');
    }
    
    const data: ExternalApiResponse = await response.json();
    
    // Map category names to potential tags in the API data
    const categoryToTags: Record<string, string[]> = {
      'writing': ['writing', 'writer', 'blog', 'content', 'author', 'blogging', 'story', 'fiction'],
    };

    // Filter posts based on matching tags
    const matchingTags = categoryToTags[category.toLowerCase()] || [category.toLowerCase()];
    const filteredPosts = data.posts.filter(post => 
      post.tags.some(tag => 
        matchingTags.some(matchTag => tag.toLowerCase().includes(matchTag))
      )
    );
    
    // If no posts match the exact category, provide a few posts anyway
    // This ensures users always see some content regardless of category selection
    if (filteredPosts.length === 0) {
      return data.posts.slice(0, 6).map(post => {
        const mappedPost = mapExternalPostToSchema(post);
        mappedPost.category = category.toLowerCase();
        return mappedPost;
      });
    }
    
    return filteredPosts.map(post => {
      const mappedPost = mapExternalPostToSchema(post);
      mappedPost.category = category.toLowerCase();
      return mappedPost;
    });
  } catch (error) {
    console.error('Error fetching external posts by category:', error);
    return [];
  }
}

// Search posts
export async function searchExternalPosts(query: string): Promise<Post[]> {
  try {
    const response = await fetch(`https://dummyjson.com/posts/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Failed to search posts from external API');
    }
    
    const data: ExternalApiResponse = await response.json();
    return data.posts.map(mapExternalPostToSchema);
  } catch (error) {
    console.error('Error searching external posts:', error);
    return [];
  }
}