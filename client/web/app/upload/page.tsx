"use client";

import React, { useState } from 'react';
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


  const handleInputChange = (field: keyof CreateVibeInput, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length > 5) {
      alert('You can only upload up to 5 files');
      return;
    }
    
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
    
    if (!formData.itemName || !formData.description || !formData.price || !formData.location) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create vibe first
      const response = await createVibe(formData);
      
      // Upload media if any
      if (selectedFiles.length > 0 && response.vibe?.id) {
        await uploadVibeMedia(response.vibe.id, selectedFiles);
      }

      alert('Vibe uploaded successfully! It will be reviewed before being published.');
      router.push('/feed');
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Failed to upload vibe: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  className="w-full px-4 py-3 rounded-xl border border-gruvbox-gray bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 focus:ring-2 focus:ring-gruvbox-orange focus:border-transparent transition-colors"
                  placeholder="e.g., Vintage Camera"
                  required
                />
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
                  className="w-full px-4 py-3 rounded-xl border border-gruvbox-gray bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 focus:ring-2 focus:ring-gruvbox-orange focus:border-transparent transition-colors resize-none"
                  placeholder="Describe your item in detail..."
                  required
                />
              </div>

              {/* Price and Category Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-2">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 rounded-xl border border-gruvbox-gray bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 focus:ring-2 focus:ring-gruvbox-orange focus:border-transparent transition-colors"
                    placeholder="0.00"
                    required
                  />
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
                    className="w-full px-4 py-3 rounded-xl border border-gruvbox-gray bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 focus:ring-2 focus:ring-gruvbox-orange focus:border-transparent transition-colors"
                    placeholder="e.g., New York, NY"
                    required
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gruvbox-gray bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 focus:ring-2 focus:ring-gruvbox-orange focus:border-transparent transition-colors"
                  placeholder="vintage, camera, film (comma separated)"
                />
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
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    'Upload Vibe'
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
