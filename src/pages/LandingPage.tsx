import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { Logs } from '../types/type';

import axios from 'axios';

// Enhanced error interface
interface ApiError {
  message: string;
  status?: number;
  retry?: boolean;
}

// Validation functions
const validateArticle = (logs: any): logs is Logs => {
  return (
    typeof logs === 'object' &&
    logs !== null &&
    typeof logs.title === 'string' &&
    logs.title.trim().length > 0 &&
    typeof logs.slug === 'string' &&
    logs.slug.trim().length > 0
  );
};

const sanitizeSlug = (slug: string): string => {
  // Remove potentially dangerous characters and ensure URL safety
  return encodeURIComponent(slug.trim());
};

const sanitizeTitle = (title: string): string => {
  // Basic XSS prevention - strip HTML tags and limit length
  return title
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .trim()
    .substring(0, 200); // Limit title length
};

// Enhanced LogCard component with better props validation
interface LogCardProps {
  index: number;
  title: string;
  slug: string;
}

function LogCard({ index, title, slug }: LogCardProps) {
  // Validate and sanitize props
  const safeIndex = Math.max(0, Math.floor(index));
  const safeTitle = sanitizeTitle(title || 'Untitled');
  const safeSlug = sanitizeSlug(slug || '');

  // Don't render if essential data is missing
  if (!safeSlug) {
    return null;
  }

  return (
    <div className="relative bg-white w-full h-auto min-h-[120px] shadow-md border border-gray-200 mx-auto p-4 rounded-md hover:shadow-lg transition-shadow duration-300">
      <h3 className="text-2xl font-semibold text-gray-800 mb-2">
        {`Day - ${safeIndex + 1}`}
      </h3>
      <h4 
        className="text-xl text-gray-700 mb-4 pr-16 line-clamp-2 overflow-hidden"
        title={safeTitle} // Show full title on hover
      >
        {safeTitle}
      </h4>
      <div className="absolute right-4 bottom-4">
        <Link 
          to={`/logs/${safeSlug}`} 
          className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 px-4 py-2 rounded-md text-sm text-white font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label={`Baca artikel: ${safeTitle}`}
        >
          Baca
        </Link>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [articles, setArticles] = useState<Logs[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  const MAX_RETRY_ATTEMPTS = 3;
  const RETRY_DELAY = 1000; // 1 second

  // Enhanced fetch function with comprehensive error handling
  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate environment variable
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl || typeof apiUrl !== 'string') {
        throw new Error("API URL not configured properly");
      }

      // Create axios instance with proper configuration
      const apiClient = axios.create({
        timeout: 15000, // 15 second timeout for list requests
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const response = await apiClient.get(`${apiUrl}/articles`);

      // Validate response structure
      if (!response.data) {
        throw new Error("No data received from server");
      }

      // Handle different response formats
      let articlesData: any[];
      if (Array.isArray(response.data)) {
        articlesData = response.data;
      } else if (response.data.articles && Array.isArray(response.data.articles)) {
        articlesData = response.data.articles;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        articlesData = response.data.data;
      } else {
        throw new Error("Invalid response format from server");
      }

      // Validate and filter articles
      const validArticles = articlesData
        .filter(validateArticle)
        .slice(0, 50); // Limit to 50 articles for performance

      if (validArticles.length === 0 && articlesData.length > 0) {
        throw new Error("No valid articles found in response");
      }

      setArticles(validArticles);
      setRetryCount(0); // Reset retry count on success

    } catch (err) {
      let errorInfo: ApiError = {
        message: "Failed to load articles",
        retry: true
      };

	

      setError(errorInfo);

      // Auto-retry logic for retryable errors
      if (errorInfo.retry && retryCount < MAX_RETRY_ATTEMPTS) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchArticles();
        }, RETRY_DELAY * Math.pow(2, retryCount)); // Exponential backoff
      }

    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Manual retry function
  const handleRetry = () => {
    setRetryCount(0);
    fetchArticles();
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="w-full shadow-sm border-b">
          <h5 className="text-blue-500 text-2xl font-bold px-4 py-4">LogBook KKN 309</h5>
        </div>
        
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Memuat artikel...</p>
            {retryCount > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Percobaan ke-{retryCount + 1} dari {MAX_RETRY_ATTEMPTS + 1}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white min-h-screen">
        <div className="w-full shadow-sm border-b">
          <h5 className="text-blue-500 text-2xl font-bold px-4 py-4">LogBook KKN 309</h5>
        </div>
        
        <div className="flex items-center justify-center py-20">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-6xl mb-4">
              {error.status === 404 ? "📄" : "⚠️"}
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              {error.status === 404 ? "Tidak Ada Artikel" : "Terjadi Kesalahan"}
            </h2>
            <p className="text-gray-600 mb-6">{error.message}</p>
            
            {error.retry && (
              <div className="space-y-3">
                <button 
                  onClick={handleRetry}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors duration-200 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  disabled={loading}
                >
                  {loading ? "Mencoba..." : "Coba Lagi"}
                </button>
                <p className="text-xs text-gray-500">
                  Atau refresh halaman ini
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="bg-white min-h-screen">
      <div className="w-full shadow-sm border-b">
        <h5 className="text-blue-500 text-2xl font-bold px-4 py-4">LogBook KKN 309</h5>
      </div>
      
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-blue-700 text-center py-8 text-4xl font-bold">
          Selamat Datang di LogBook KKN 309
        </h1>
        
        <p className="text-blue-600 text-center pb-8 text-xl max-w-3xl mx-auto">
          Berikut merupakan dokumentasi kegiatan dari KKN kelompok 309. 
          Ikuti perjalanan kami dalam mengabdi kepada masyarakat.
        </p>
        
        {articles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📝</div>
            <p className="text-gray-600 text-lg">Belum ada artikel yang tersedia</p>
            <button 
              onClick={handleRetry}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
            >
              Refresh
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <p className="text-gray-600">
                Menampilkan {articles.length} artikel
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
              {articles.map((item, index) => (
                <LogCard 
                  key={`${item.slug}-${index}`} // More robust key
                  index={index} 
                  title={item.title} 
                  slug={item.slug}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}