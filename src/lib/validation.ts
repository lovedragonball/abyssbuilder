import { z } from 'zod';

// Build validation schema
export const buildSchema = z.object({
  buildName: z.string().min(1, 'Build name is required').max(100, 'Build name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  guide: z.string().max(5000, 'Guide is too long').optional(),
  visibility: z.enum(['public', 'private']),
  itemType: z.enum(['character', 'weapon']),
  itemId: z.string().min(1, 'Item ID is required'),
  itemName: z.string().min(1, 'Item name is required'),
  mods: z.array(z.string()).max(8, 'Maximum 8 mods allowed'),
  team: z.array(z.string()).max(2, 'Maximum 2 support characters allowed'),
  supportWeapons: z.array(z.string()).max(2, 'Maximum 2 support weapons allowed'),
});

export type BuildInput = z.infer<typeof buildSchema>;

// User validation schema
export const userSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username is too long'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().min(1, 'Display name is required').max(50, 'Display name is too long').optional(),
});

export type UserInput = z.infer<typeof userSchema>;

// Validation helper functions
export function validateBuild(data: unknown) {
  try {
    return { success: true, data: buildSchema.parse(data) };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors };
    }
    return { success: false, errors: [{ message: 'Unknown validation error' }] };
  }
}

export function validateUser(data: unknown) {
  try {
    return { success: true, data: userSchema.parse(data) };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors };
    }
    return { success: false, errors: [{ message: 'Unknown validation error' }] };
  }
}
