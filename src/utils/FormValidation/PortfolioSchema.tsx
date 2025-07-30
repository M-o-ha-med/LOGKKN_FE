import { z } from 'zod';

export const createPortfolioSchema = z.object({
  portfolio_title: z.string().min(5, 'Title must be at least 5 characters'),
  portfolio_description: z.string().min(10, 'Description must be at least 10 characters'),
  portfolio_region: z.string().min(1, 'region must be at least 10 characters'),
  cover_images:  z.array(z.instanceof(File)).min(1, 'Cover image is required').max(1, 'Only one cover image is allowed'), 
  concept_images:  z.array(z.instanceof(File)).min(1 , 'Concept image is required'),
  exterior_images:  z.array(z.instanceof(File)).min(1 , 'Exterior image is required'),
  interior_images:  z.array(z.instanceof(File)).min(1 , 'Interior Image is required'),
  
});

export const updatePortfolioSchema = z.object({
  portfolio_title: z.string().min(5, 'Title must be at least 5 characters'),
  portfolio_description: z.string().min(1, 'Description must be at least 10 characters'),
  portfolio_region: z.string().min(1, 'region must be at least 10 characters'),
  
  cover_images: z.array(z.union([
    z.instanceof(File),
    z.string()
  ])).min(1, 'Cover image is required'),
  
  concept_images: z.array(z.union([
	z.instanceof(File),
	z.string()
  ])).min(1 , 'Concept image is required'),
  
  exterior_images: z.array(z.union([
	z.instanceof(File),
	z.string()
  ])).min(1 , 'Exterior image is required'),
  
  interior_images: z.array(z.union([
	z.instanceof(File),
	z.string()
  ])).min(1 , 'Interior Image is required'),
});

