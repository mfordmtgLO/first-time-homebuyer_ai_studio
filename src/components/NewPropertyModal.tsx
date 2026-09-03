import React, { useState } from "react";
import { X, Building, DollarSign, MapPin, Plus, Image } from "lucide-react";
import { PropertyListing } from "../types";

interface NewPropertyModalProps {
  onClose: () => void;
  onAdd: (newProperty: PropertyListing) => void;
}

export const NewPropertyModal: React.FC<NewPropertyModalProps> = ({
  onClose,
  onAdd,
}) => {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState(450000);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Coos Bay");
  const [state, setState] = useState("OR");
  const [zip, setZip] = useState("97420");
  const [beds, setBeds] = useState(3);
  const [baths, setBaths] = useState(2);
  const [sqft, setSqft] = useState(1650);
  const [yearBuilt, setYearBuilt] = useState(2016);
  const [hoaMonthly, setHoaMonthly] = useState(0);
  const [propertyTaxAnnual, setPropertyTaxAnnual] = useState(3400);
  const [propertyType, setPropertyType] = useState<PropertyListing["propertyType"]>("Single Family");
  const [images, setImages] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [notes, setNotes] = useState("");

  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newImages: string[] = [];
      filesArray.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            newImages.push(reader.result as string);
            if (newImages.length === filesArray.length) {
              setImages(prev => [...prev, ...newImages]);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleGenerateAIPlaceholder = () => {
    const randomId = Math.floor(Math.random() * 1000);
    const placeholderUrl = `https://picsum.photos/seed/${randomId}/800/600`;
    setImages(prev => [...prev, placeholderUrl]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !address.trim()) {
      alert("Please provide at least a title and street address.");
      return;
    }

    const newProp: PropertyListing = {
      id: `prop-${Date.now()}`,
      title,
      price,
      address,
      city,
      state,
      zip,
      beds,
      baths,
      sqft,
      yearBuilt,
      hoaMonthly,
      propertyTaxAnnual,
      isPubliclyPublished: false,
      propertyType,
      imageUrl: images.length > 0 ? images[0] : (imageUrl.trim() || undefined),
      images: images.length > 0 ? images : (imageUrl.trim() ? [imageUrl.trim()] : []),
      status: "touring",
      daysOnMarket: 4,
      notes,
      isFavorite: true,
      tourDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };

    onAdd(newProp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-[#EAE7E0] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-150 text-[#2D362E]">
        <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-4">
          <div>
            <h3 className="text-xl font-serif font-bold text-[#2D362E] flex items-center gap-2">
              <Building className="w-5 h-5 text-[#4A5D4E]" />
              <span>Add Prospective Home to Tour</span>
            </h3>
            <p className="text-xs text-[#606C5D]">Save a property listing to score during your walkthrough.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-[#F1EFE9] text-[#606C5D] hover:text-[#2D362E] border border-[#EAE7E0]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#606C5D] mb-1">Listing Title / Headline</label>
            <input
              type="text"
              required
              placeholder="e.g. Sunny Mid-Century Craftsman with Yard"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3.5 py-2.5 text-xs text-[#2D362E] placeholder-[#9A9488] focus:outline-none focus:border-[#4A5D4E]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#606C5D] mb-1">Asking Price ($)</label>
              <input
                type="number"
                step="5000"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3.5 py-2.5 text-xs text-[#2D362E] font-bold focus:outline-none focus:border-[#4A5D4E]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#606C5D] mb-1">Property Type</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as any)}
                className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3.5 py-2.5 text-xs text-[#2D362E] font-semibold focus:outline-none focus:border-[#4A5D4E]"
              >
                <option value="Single Family">Single Family</option>
                <option value="Townhouse">Townhouse</option>
                <option value="Condo">Condo</option>
                <option value="Multi-Family (2-4)">Multi-Family (2-4 Units)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6">
              <label className="block font-semibold text-[#606C5D] mb-1">Street Address</label>
              <input
                type="text"
                required
                placeholder="123 Maple Street"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3.5 py-2.5 text-xs text-[#2D362E] placeholder-[#9A9488] focus:outline-none focus:border-[#4A5D4E]"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block font-semibold text-[#606C5D] mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3.5 py-2.5 text-xs text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block font-semibold text-[#606C5D] mb-1">State / Zip</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-14 bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-2 py-2.5 text-xs text-[#2D362E] text-center"
                />
                <input
                  type="text"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="flex-1 bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-2 py-2.5 text-xs text-[#2D362E] text-center"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-[#606C5D] mb-1">Beds</label>
              <input
                type="number"
                value={beds}
                onChange={(e) => setBeds(Number(e.target.value))}
                className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs text-[#2D362E] font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#606C5D] mb-1">Baths</label>
              <input
                type="number"
                step="0.5"
                value={baths}
                onChange={(e) => setBaths(Number(e.target.value))}
                className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs text-[#2D362E] font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#606C5D] mb-1">Square Feet</label>
              <input
                type="number"
                step="50"
                value={sqft}
                onChange={(e) => setSqft(Number(e.target.value))}
                className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs text-[#2D362E] font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#606C5D] mb-1">Monthly HOA ($)</label>
              <input
                type="number"
                value={hoaMonthly}
                onChange={(e) => setHoaMonthly(Number(e.target.value))}
                className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs text-[#2D362E] font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#606C5D] mb-1">Annual Property Tax ($)</label>
              <input
                type="number"
                value={propertyTaxAnnual}
                onChange={(e) => setPropertyTaxAnnual(Number(e.target.value))}
                className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs text-[#2D362E] font-bold"
              />
            </div>
          </div>

                    <div>
            <label className="block font-semibold text-[#606C5D] mb-2">
              Property Images <span className="font-normal text-[#9A9488]">(Upload or Generate)</span>
            </label>
            <div className="space-y-3">
              {images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-[#EAE7E0]">
                      <img src={img} alt="Property" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 z-10">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-3">
                <label className="flex items-center justify-center gap-2 px-4 py-2 bg-[#F9F8F4] border border-[#EAE7E0] hover:bg-[#F1EFE9] text-[#2D362E] text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-2xs">
                  <Image className="w-4 h-4" />
                  <span>Upload Photos</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
                <button type="button" onClick={handleGenerateAIPlaceholder} className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-2xs">
                  <Plus className="w-4 h-4" />
                  <span>AI Placeholder</span>
                </button>
              </div>
              <div className="text-xs text-[#9A9488] font-medium pt-1">
                Or paste a URL:
              </div>
              <input
                type="text"
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3.5 py-2 text-xs text-[#2D362E] placeholder-[#9A9488]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#606C5D] mb-1">Initial Tour Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Love the kitchen island, but check if roof has active leak..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl p-3 text-xs text-[#2D362E]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EAE7E0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#F1EFE9] hover:bg-[#EAE7E0] text-[#606C5D] text-xs font-semibold border border-[#EAE7E0]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white font-semibold text-xs shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Property</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
