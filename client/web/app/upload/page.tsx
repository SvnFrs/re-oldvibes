"use client";

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '../_components/auth/AuthGuard';
import { createVibe, uploadVibeMedia, CreateVibeInput } from '../_apis/common/vibes';
import MediaPreview from '../_components/upload/MediaPreview';

const CATEGORIES = ['Electronics', 'Fashion', 'Books', 'Toys', 'Home', 'Other'];
const CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'like-new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' }
];

// Validation utilities
const validatePrice = (price: number): string | null => {
  if (price <= 0) return 'Price must be greater than 0';
  if (price > 1000000000) return 'Price cannot exceed 1 billion VND';
  if (!Number.isInteger(price)) return 'Price must be a whole number';
  return null;
};

const validateItemName = (name: string): string | null => {
  if (!name.trim()) return 'Item name cannot be empty';
  if (name.length < 3) return 'Item name must be at least 3 characters';
  if (name.length > 100) return 'Item name cannot exceed 100 characters';
  return null;
};

const validateDescription = (description: string): string | null => {
  if (!description.trim()) return 'Description cannot be empty';
  if (description.length < 10) return 'Description must be at least 10 characters';
  if (description.length > 1000) return 'Description cannot exceed 1000 characters';
  return null;
};

const validateLocation = (location: string): string | null => {
  if (!location.trim()) return 'Location cannot be empty';
  if (location.length < 3) return 'Location must be at least 3 characters';
  return null;
};

const validateTags = (tags: string[]): string | null => {
  if (tags.length > 10) return 'Cannot have more than 10 tags';
  for (const tag of tags) {
    if (tag.length > 20) return 'Each tag cannot exceed 20 characters';
    if (!/^[a-zA-Z0-9\s]+$/.test(tag)) return 'Tags can only contain letters, numbers and spaces';
  }
  return null;
};

const formatPrice = (value: string): number => {
  // Remove all non-numeric characters except decimal point
  const cleaned = value.replace(/[^\d]/g, '');
  return parseInt(cleaned) || 0;
};

const formatPriceDisplay = (price: number): string => {
  return new Intl.NumberFormat('vi-VN').format(price);
};

export default function UploadPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateVibeInput>({
    itemName: '',
    description: '',
    price: 0,
    category: CATEGORIES[0],
    condition: 'new',
    tags: [],
    location: ''
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [tagsInput, setTagsInput] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [fileErrors, setFileErrors] = useState<string[]>([]);


  const validateForm = useCallback((): boolean => {
    const errors: {[key: string]: string} = {};
    
    // Validate each field
    const itemNameError = validateItemName(formData.itemName);
    if (itemNameError) errors.itemName = itemNameError;
    
    const descriptionError = validateDescription(formData.description);
    if (descriptionError) errors.description = descriptionError;
    
    const priceError = validatePrice(formData.price);
    if (priceError) errors.price = priceError;
    
    const locationError = validateLocation(formData.location);
    if (locationError) errors.location = locationError;
    
    const tagsError = validateTags(formData.tags);
    if (tagsError) errors.tags = tagsError;
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleInputChange = (field: keyof CreateVibeInput, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePriceChange = (value: string) => {
    setPriceInput(value);
    const numericPrice = formatPrice(value);
    handleInputChange('price', numericPrice);
  };

  const validateFiles = (files: File[]): string[] => {
    const errors: string[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/avi', 'video/mov', 'video/wmv'];
    
    if (files.length > 5) {
      errors.push('Maximum 5 files allowed');
    }
    
    files.forEach((file, index) => {
      if (file.size > maxSize) {
        errors.push(`File ${index + 1} (${file.name}) exceeds 10MB limit`);
      }
      
      if (!allowedTypes.includes(file.type)) {
        errors.push(`File ${index + 1} (${file.name}) has unsupported format`);
      }
    });
    
    return errors;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const fileErrors = validateFiles(files);
    
    if (fileErrors.length > 0) {
      setFileErrors(fileErrors);
      return;
    }
    
    setFileErrors([]);
    setSelectedFiles(files);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleTagsChange = (value: string) => {
    setTagsInput(value);
    const tags = value.split(',').map(tag => tag.trim()).filter(Boolean);
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      alert('Please check your information');
      return;
    }
    
    // Validate files if any
    if (selectedFiles.length > 0) {
      const fileValidationErrors = validateFiles(selectedFiles);
      if (fileValidationErrors.length > 0) {
        setFileErrors(fileValidationErrors);
        alert('Please check your uploaded files');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Create vibe first
      const response = await createVibe(formData);
      
      // Upload media if any
      if (selectedFiles.length > 0 && response.vibe?.id) {
        await uploadVibeMedia(response.vibe.id, selectedFiles);
      }

      alert('Vibe created successfully! It will be reviewed before being published.');
      router.push('/feed');
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Failed to create vibe: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/')}
              className="flex items-center space-x-2 text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 hover:text-gruvbox-orange transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Home</span>
            </button>
          </div>

          <div className="bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 rounded-2xl shadow-xl border border-gruvbox-gray p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gruvbox-orange-light dark:text-gruvbox-orange-dark mb-2">
                Upload Your Vibe
              </h1>
              <p className="text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1">
                Share your vintage finds with the community
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Item Name */}
              <div>
                <label className="block text-sm font-medium text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={formData.itemName}
                  onChange={(e) => handleInputChange('itemName', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    validationErrors.itemName 
                      ? 'border-red-500' 
                      : 'border-gruvbox-gray'
                  } bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 focus:ring-2 focus:ring-gruvbox-orange focus:border-transparent transition-colors`}
                  placeholder="e.g., Vintage Camera"
                  required
                />
                {validationErrors.itemName && (
                  <p className="mt-1 text-sm text-red-500">{validationErrors.itemName}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    validationErrors.description 
                      ? 'border-red-500' 
                      : 'border-gruvbox-gray'
                  } bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 focus:ring-2 focus:ring-gruvbox-orange focus:border-transparent transition-colors resize-none`}
                  placeholder="Describe your item in detail..."
                  required
                />
                <div className="flex justify-between mt-1">
                  {validationErrors.description && (
                    <p className="text-sm text-red-500">{validationErrors.description}</p>
                  )}
                  <p className="text-sm text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 ml-auto">
                    {formData.description.length}/1000
                  </p>
                </div>
              </div>

              {/* Price and Category Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-2">
                    Price (VND) *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={priceInput}
                      onChange={(e) => handlePriceChange(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        validationErrors.price 
                          ? 'border-red-500' 
                          : 'border-gruvbox-gray'
                      } bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 focus:ring-2 focus:ring-gruvbox-orange focus:border-transparent transition-colors`}
                      placeholder="Enter price (VND)"
                      required
                    />
                    {formData.price > 0 && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1">
                        {formatPriceDisplay(formData.price)} VND
                      </div>
                    )}
                  </div>
                  {validationErrors.price && (
                    <p className="mt-1 text-sm text-red-500">{validationErrors.price}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gruvbox-gray bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 focus:ring-2 focus:ring-gruvbox-orange focus:border-transparent transition-colors"
                  >
                    {CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Condition and Location Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-2">
                    Condition
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) => handleInputChange('condition', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gruvbox-gray bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 focus:ring-2 focus:ring-gruvbox-orange focus:border-transparent transition-colors"
                  >
                    {CONDITIONS.map(condition => (
                      <option key={condition.value} value={condition.value}>
                        {condition.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      validationErrors.location 
                        ? 'border-red-500' 
                        : 'border-gruvbox-gray'
                    } bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 focus:ring-2 focus:ring-gruvbox-orange focus:border-transparent transition-colors`}
                    placeholder="e.g., Ho Chi Minh City"
                    required
                  />
                  {validationErrors.location && (
                    <p className="mt-1 text-sm text-red-500">{validationErrors.location}</p>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    validationErrors.tags 
                      ? 'border-red-500' 
                      : 'border-gruvbox-gray'
                  } bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 focus:ring-2 focus:ring-gruvbox-orange focus:border-transparent transition-colors`}
                  placeholder="vintage, camera, film"
                />
                {validationErrors.tags && (
                  <p className="mt-1 text-sm text-red-500">{validationErrors.tags}</p>
                )}
                {formData.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gruvbox-orange-light dark:bg-gruvbox-orange-dark text-white text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-sm text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 mt-1">
                  Separate tags with commas
                </p>
              </div>

              {/* Media Upload */}
              <div>
                <label className="block text-sm font-medium text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-2">
                  Photos/Videos (max 5)
                </label>
                <div className="border-2 border-dashed border-gruvbox-gray rounded-xl p-6 text-center hover:border-gruvbox-orange transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="media-upload"
                  />
                  <label
                    htmlFor="media-upload"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <div className="w-12 h-12 bg-gruvbox-orange-light dark:bg-gruvbox-orange-dark rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <span className="text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 font-medium">
                      Click to upload files
                    </span>
                    <span className="text-sm text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1">
                      Images and videos up to 10MB each
                    </span>
                  </label>
                </div>
                
                {/* File Errors */}
                {fileErrors.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {fileErrors.map((error, index) => (
                      <p key={index} className="text-sm text-red-500">{error}</p>
                    ))}
                  </div>
                )}

                {/* Selected Files Preview */}
                <MediaPreview files={selectedFiles} onRemove={handleRemoveFile} />
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gruvbox-orange-light dark:bg-gruvbox-orange-dark text-white font-bold py-4 px-6 rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Vibe...</span>
                    </div>
                  ) : (
                    'Create Vibe'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
