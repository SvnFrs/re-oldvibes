"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { IconTag } from "@tabler/icons-react";
import { updateVibe } from "../../_apis/common/vibes";

export function VibeUpdate({ data }: { data: any }) {
  const [tags, setTags] = useState<string[]>(data?.tags || []);
  const [newTag, setNewTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    itemName: data?.itemName || "",
    description: data?.description || "",
    price: data?.price || "",
    category: data?.category || "",
    condition: data?.condition || "",
    location: data?.location || "",
  });

  // Update form data when data prop changes
  useEffect(() => {
    if (data) {
      setFormData({
        itemName: data.itemName || "",
        description: data.description || "",
        price: data.price || "",
        category: data.category || "",
        condition: data.condition || "",
        location: data.location || "",
      });
      setTags(data.tags || []);
    }
  }, [data]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const categories = [
    "Electronics",
    "Fashion",
    "Books",
    "Toys",
    "Home",
    "Sports",
    "Beauty",
    "Other",
  ];

  const conditions = ["new", "like-new", "good", "fair", "poor"];

  const vietnameseCities = [
    "Bà Rịa",
    "Bạc Liêu",
    "Bắc Giang",
    "Bắc Ninh",
    "Bến Tre",
    "Biên Hòa",
    "Buôn Ma Thuột",
    "Cà Mau",
    "Cam Ranh",
    "Cần Thơ",
    "Cao Bằng",
    "Đà Lạt",
    "Đà Nẵng",
    "Điện Biên",
    "Đông Hà",
    "Đồng Hới",
    "Hà Giang",
    "Hà Nội",
    "Hải Dương",
    "Hải Phòng",
    "Hòa Bình",
    "Hội An",
    "Huế",
    "Hưng Yên",
    "Lai Châu",
    "Lạng Sơn",
    "Lào Cai",
    "Mỹ Tho",
    "Nam Định",
    "Nha Trang",
    "Phan Rang",
    "Phan Thiết",
    "Phú Thọ",
    "Pleiku",
    "Quảng Ngãi",
    "Quảng Ninh",
    "Quảng Trị",
    "Quy Nhơn",
    "Rạch Giá",
    "Sóc Trăng",
    "Sơn La",
    "Tam Kỳ",
    "Tân An",
    "Thái Bình",
    "Thái Nguyên",
    "Thanh Hóa",
    "Thành phố Hồ Chí Minh",
    "Thủ Dầu Một",
    "Trà Vinh",
    "Tuyên Quang",
    "Tuy Hòa",
    "Vinh",
    "Vĩnh Phúc",
    "Vũng Tàu",
    "Yên Bái",
  ];

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    const updateData = {
      ...formData,
      tags,
      price: Number(formData.price),
    };

    try {
      const response = await updateVibe(data.id, data.userId, updateData);
      // Optionally close the dialog or refresh the page
      window.location.reload();
    } catch (error) {
      console.error("Error updating vibe:", error);
      alert("Failed to update vibe. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="bg-gruvbox-orange text-white text-base cursor-pointer h-10 px-4 py-1 rounded-lg">
          Edit
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto bg-white">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Vibe</DialogTitle>
            <DialogDescription>
              Update your vibe details. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Vibe Name */}
            <div className="grid gap-2">
              <Label htmlFor="vibe-name">Vibe Name</Label>
              <Input
                id="vibe-name"
                name="itemName"
                value={formData.itemName}
                onChange={handleInputChange}
                placeholder="Enter vibe name"
                required
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your vibe..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>

            {/* Price */}
            <div className="grid gap-2">
              <Label htmlFor="price">Price (VND)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Enter price"
                min="0"
                step="1000"
                required
              />
            </div>

            {/* Tags */}
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a tag and press Enter"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="bg-gruvbox-orange text-white px-3 py-2 rounded-md text-sm hover:bg-gruvbox-orange/90"
                >
                  Add
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm flex items-center gap-1"
                    >
                      <IconTag size={14} /> {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Media Files */}
            {/* <div className="grid gap-2">
              <Label htmlFor="media">Media Files</Label>
              <Input
                id="media"
                name="media"
                type="file"
                accept="image/*"
                multiple
                className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gruvbox-orange file:text-white hover:file:bg-gruvbox-orange/90"
              />
            </div> */}

            {/* Category */}
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Condition */}
            <div className="grid gap-2">
              <Label htmlFor="condition">Condition</Label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="">Select condition</option>
                {conditions.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition.charAt(0).toUpperCase() + condition.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="">Select a city</option>
                {vietnameseCities.map((city, index) => (
                  <option key={index} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <button
                type="button"
                className="bg-gray-500 text-white text-base cursor-pointer px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </DialogClose>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-gruvbox-orange text-white text-base cursor-pointer px-4 py-2 rounded-lg hover:bg-gruvbox-orange/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Save changes"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
