export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
export const MAX_FIGURE_PHOTOS = 5;
const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

export type ImageValidationError = 'unsupported' | 'tooLarge';

export const validateImageFile = (file: File): ImageValidationError | null => {
  if (!SUPPORTED_IMAGE_TYPES.has(file.type)) return 'unsupported';
  if (file.size > MAX_IMAGE_SIZE) return 'tooLarge';
  return null;
};

export const revokeObjectUrl = (url: string | null | undefined) => {
  if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
};
