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
import { deleteVibe } from "@/app/_apis/common/vibes";

export function VibeDelete({ data }: { data: any }) {
  const [tags, setTags] = useState<string[]>(data?.tags || []);
  const [newTag, setNewTag] = useState("");
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

    try {
      // TODO: Implement API call to delete vibe
      const response = await deleteVibe(data.id);
      console.log("Response:", response);
      console.log("Vibe ID:", data.id);
      window.location.href = "/";
    } catch (error) {
      console.error("Error deleting vibe:", error);
      alert("Failed to delete vibe. Please try again.");
      window.location.href = "/";
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="bg-red-700 text-white text-base cursor-pointer h-10 px-4 py-1 rounded-lg">
          Delete
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>Delete Vibe</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this vibe?
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
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
                disabled
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
                disabled
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
                disabled
              />
            </div>

            {/* Tags */}
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags</Label>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm flex items-center gap-1"
                    >
                      <IconTag size={14} /> {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Media Files */}
            <div className="grid gap-2">
              <Label htmlFor="media">Media Files</Label>
              <Input
                id="media"
                name="media"
                type="file"
                accept="image/*"
                multiple
                className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gruvbox-orange file:text-white hover:file:bg-gruvbox-orange/90"
                disabled
              />
            </div>

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
                disabled
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
                disabled
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
                disabled
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
              className="bg-red-700 text-white text-base cursor-pointer px-4 py-2 rounded-lg hover:bg-gruvbox-orange/90"
            >
              Delete
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
