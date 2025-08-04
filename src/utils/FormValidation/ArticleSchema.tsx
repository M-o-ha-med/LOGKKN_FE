import { z } from 'zod';

export const createArticleSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  images: z.custom<File>((file) => file instanceof File, 'Images are required'),
});

export const updateArticleSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  images: z.array(z.union([
	z.instanceof(File),
	z.string()
  ])).min(1 , 'images are required'),
  
  
});
