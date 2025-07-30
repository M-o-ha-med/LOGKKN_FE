import { useState, useEffect, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { useParams, useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import Toast from '../components/toast.tsx';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createArticleSchema, updateArticleSchema } from '../utils/FormValidation/ArticleSchema.tsx';
import { z } from 'zod';
import ThumbnailImage from '../components/ThumbnailImage.tsx';
import type { Dispatch, SetStateAction } from 'react';

// Enhanced interfaces for better type safety
interface ApiError {
  message: string;
  status?: number;
}

interface ArticleData {
  title: string;
  content: string;
  id?: number;
}


// Input validation and sanitization functions
const validateTitle = (title: string): boolean => {
  return typeof title === 'string' && title.trim().length > 0 && title.length <= 200;
};

const validateContent = (content: string): boolean => {
  return typeof content === 'string' && content.trim().length > 0;
};

const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
};

const validateImageFile = (file: File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  return (
    file instanceof File &&
    allowedTypes.includes(file.type) &&
    file.size <= maxSize &&
    file.size > 0
  );
};

export default function ArticleForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [buttonText, setButtonText] = useState<string>('Create Article');
  const [error, setError] = useState<ApiError | null>(null);
  const { slug } = useParams<{ slug: string }>();
  const [images, setImages] = useState<string[]>([]);
  const [ _ , setImageFiles] = useState<File[]>([]);
  const [imageToDelete, setImageToDelete] = useState<string[]>([]);
  
  // Safely determine if this is an update operation
  const isUpdate = Boolean(slug && location.pathname.includes(`/admin/Articles/update/${slug}`));
  const activeSchema = isUpdate ? updateArticleSchema : createArticleSchema;
  
  type ArticleFormData = z.infer<typeof activeSchema>;

  const { 
    register, 
    handleSubmit, 
    control, 
    setValue, 
    reset, 
    formState: { errors, isValid } 
  } = useForm<ArticleFormData>({
    resolver: zodResolver(activeSchema),
    defaultValues: {
      title: '',
      content: '',
      images: undefined,
    },
    mode: 'onChange' // Enable real-time validation
  });

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
      <span className="ml-3 text-gray-600">Loading...</span>
    </div>
  );

  // Enhanced image removal with proper type safety
  const handleImageRemoval = useCallback((
    urlToDelete: string,
    setImages: Dispatch<SetStateAction<string[]>>,
    setFiles: Dispatch<SetStateAction<File[]>>,
    fieldValues: File | File[] | string[] | (File | string)[] | undefined,
    setFormImages: (newImages: File | File[] | string[] | (File | string)[] | undefined) => void,
  ) => {
    try {
      const isExistingImage = !urlToDelete.startsWith('blob:');
      
      if (isExistingImage) {
        setImageToDelete(prev => [...prev, urlToDelete]);
      }
      
      setImages((prev: string[]) => prev.filter((url: string) => url !== urlToDelete));
      
      // Handle different field value types safely
      let newFieldValues: typeof fieldValues;
      
      if (Array.isArray(fieldValues)) {
        newFieldValues = fieldValues.filter((item) => {
          if (typeof item === 'string') return item !== urlToDelete;
          if (item instanceof File) {
            const fileUrl = URL.createObjectURL(item);
            const shouldKeep = fileUrl !== urlToDelete;
            if (!shouldKeep) URL.revokeObjectURL(fileUrl);
            return shouldKeep;
          }
          return true;
        });
      } else {
        newFieldValues = fieldValues;
      }
      
      setFormImages(newFieldValues);
      
      if (!isExistingImage) {
        setFiles((prev: File[]) => prev.filter((file: File) => {
          const fileUrl = URL.createObjectURL(file);
          const shouldKeep = fileUrl !== urlToDelete;
          if (!shouldKeep) URL.revokeObjectURL(fileUrl);
          return shouldKeep;
        }));
      }
    } catch (err) {
      console.error('Error removing image:', err);
      Toast.fire({
        title: "Error removing image",
        icon: "error"
      });
    }
  }, [setImageToDelete]);

  // Enhanced fetch function with comprehensive error handling
  const fetchArticle = useCallback(async () => {
    if (!slug || !isUpdate) return;

    try {
      setLoading(true);
      setError(null);

      // Validate environment variable
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) {
        throw new Error("API URL not configured");
      }

      // Create axios instance with proper configuration
      const apiClient = axios.create({
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await apiClient.get(
        `${apiUrl}/articles/${encodeURIComponent(slug)}`
      );

      // Validate response structure
      if (!response.data || !Array.isArray(response.data) || response.data.length < 2) {
        throw new Error("Invalid response format from server");
      }

      const [articleArray, imageArray] = response.data;
      
      // Validate article data
      if (!Array.isArray(articleArray) || articleArray.length === 0) {
        throw new Error("No article data found");
      }

      const articleData: ArticleData = articleArray[0];
      
      // Validate required fields
      if (!validateTitle(articleData.title) || !validateContent(articleData.content)) {
        throw new Error("Invalid article data structure");
      }

      // Safely handle images
      const imageUrls: string[] = [];
      if (Array.isArray(imageArray)) {
        imageArray.forEach((img: any) => {
          if (img && typeof img.image_url === 'string' && img.image_url.trim()) {
            try {
              new URL(img.image_url); // Validate URL format
              imageUrls.push(img.image_url);
            } catch {
              console.warn('Invalid image URL:', img.image_url);
            }
          }
        });
      }

      // Update form with sanitized data
      setValue('title', sanitizeInput(articleData.title));
      setValue('content', sanitizeInput(articleData.content));
      setImages(imageUrls);
      
      if (imageUrls.length > 0) {
        setValue('images', imageUrls);
      }

      setButtonText('Update Article');

    } catch (err) {
      let errorMessage = "Failed to load article";


      setError({ 
        message: errorMessage, 
        status: err instanceof AxiosError ? err.response?.status : undefined 
      });

    } finally {
      setLoading(false);
    }
  }, [slug, isUpdate, setValue]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  // Enhanced form submission with comprehensive validation
  const onSubmit = async (data: ArticleFormData) => {
    try {
      setSubmitLoading(true);
      setError(null);

      // Validate inputs before submission
      if (!validateTitle(data.title)) {
        throw new Error("Invalid title format");
      }
      
      if (!validateContent(data.content)) {
        throw new Error("Invalid content format");
      }

      // Check authentication
      const credentials = await axios.get(
        `${import.meta.env.VITE_API_URL}/auth/check`,
        { withCredentials: true, timeout: 5000 }
      );

      if (!credentials.data?.token) {
        throw new Error("Authentication failed");
      }

      const formData = new FormData();
      formData.append("title", sanitizeInput(data.title));
      formData.append("content", sanitizeInput(data.content));

      // Handle images safely
      if (data.images) {
        if (Array.isArray(data.images)) {
          data.images.forEach((image, index) => {
            if (image instanceof File) {
              if (validateImageFile(image)) {
                formData.append(`images`, image);
              } else {
                console.warn(`Invalid image file at index ${index}`);
              }
            } else if (typeof image === 'string') {
              formData.append(`existing_images`, image);
            }
          });
        } else if (data.images instanceof File) {
          if (validateImageFile(data.images)) {
            formData.append("images", data.images);
          }
        }
      }

      // Add images to delete for updates
      if (isUpdate && imageToDelete.length > 0) {
        formData.append("images_to_delete", JSON.stringify(imageToDelete));
      }

      const config = {
        withCredentials: true,
        timeout: 30000, // 30 seconds for file uploads
        headers: {
          'authorization': `Bearer ${credentials.data.token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      if (isUpdate && slug) {
        await axios.patch(
          `${import.meta.env.VITE_API_URL}/articles/update/${encodeURIComponent(slug)}`,
          formData,
          config
        );
        
        Toast.fire({
          title: "Article updated successfully!",
          icon: "success"
        });
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/articles/new`,
          formData,
          config
        );
        
        Toast.fire({
          title: "Article created successfully!",
          icon: "success"
        });
        
        // Reset form after successful creation
        reset();
        setImages([]);
        setImageFiles([]);
        setImageToDelete([]);
      }

      // Navigate back or refresh
      setTimeout(() => {
        navigate('/admin/articles');
      }, 1500);

    } catch (err) {
      let errorMessage = isUpdate ? "Failed to update article" : "Failed to create article";

      if (err instanceof AxiosError) {
        if (err.code === 'ECONNABORTED') {
          errorMessage = "Request timeout - please try again";
        } else if (err.response?.status === 401) {
          errorMessage = "Authentication failed - please login again";
        } else if (err.response?.status === 413) {
          errorMessage = "File too large - please use smaller images";
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      console.error('Form submission error:', err);
      Toast.fire({
        title: errorMessage,
        icon: "error"
      });

      setError({ message: errorMessage });
    } finally {
      setSubmitLoading(false);
    }
  };

  // Error state
  if (error && !loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Form</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button 
            onClick={() => {
              setError(null);
              if (isUpdate) fetchArticle();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {isUpdate ? 'Update Article' : 'Create New Article'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isUpdate ? 'Edit your article details below' : 'Fill in the details to create a new article'}
        </p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
          {/* Title Field */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input 
              {...register('title')}
              type="text"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 ${
                errors.title ? 'border-red-500' : ''
              }`}
              placeholder="Enter article title..."
              maxLength={200}
              disabled={submitLoading}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Content Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content <span className="text-red-500">*</span>
            </label>
            <Controller
              control={control}
              name="content"
              render={({ field }) => (
                <textarea 
                  {...field}
                  className={`w-full min-h-[200px] p-3 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors.content ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Write your article content here..."
                  disabled={submitLoading}
                />
              )}
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>

          {/* Images Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images
            </label>
            <Controller
              control={control}
              name="images"
              render={({ field }) => (
                <>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple={!isUpdate}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const files = Array.from(e.target.files);
                        const validFiles = files.filter(validateImageFile);
                        
                        if (validFiles.length !== files.length) {
                          Toast.fire({
                            title: "Some images were invalid and skipped",
                            icon: "warning"
                          });
                        }

                        if (validFiles.length > 0) {
                          const newImageUrls = validFiles.map(file => URL.createObjectURL(file));
                          setImages(prev => [...prev, ...newImageUrls]);
                          setImageFiles(prev => [...prev, ...validFiles]);
                          
                          if (isUpdate) {
                            field.onChange(validFiles[0]);
                          } else {
                            field.onChange(validFiles);
                          }
                        }
                      }
                    }}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                    disabled={submitLoading}
                  />
                  
                  <p className="mt-1 text-sm text-gray-500">
                    Accepted formats: JPEG, PNG, WebP. Maximum size: 5MB per image.
                  </p>

                  {images.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Image Previews:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {images.map((url, index) => (
                          <ThumbnailImage 
                            key={`${url}-${index}`}
                            url={url} 
                            index={index} 
                            onRemove={() => handleImageRemoval(
                              url, 
                              setImages, 
                              setImageFiles, 
                              field.value, 
                              field.onChange
                            )} 
                           
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            />
            {errors.images && (
              <p className="mt-1 text-sm text-red-600">{errors.images.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={submitLoading || !isValid}
              className={`flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors ${
                submitLoading || !isValid
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {submitLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isUpdate ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                buttonText
              )}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/admin/articles')}
              disabled={submitLoading}
              className="px-6 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
