const fs = require('fs');
let code = fs.readFileSync('src/components/NewPropertyModal.tsx', 'utf8');

// replace imageUrl state with images
code = code.replace(
  /const \[imageUrl, setImageUrl\] = useState\(""\);/g,
  `const [images, setImages] = useState<string[]>([]);\n  const [imageUrl, setImageUrl] = useState("");`
);

// add file handle logic inside NewPropertyModal
const fileUploadLogic = `
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
    const placeholderUrl = \`https://picsum.photos/seed/\${randomId}/800/600\`;
    setImages(prev => [...prev, placeholderUrl]);
  };
`;
code = code.replace(
  /const handleSubmit = \(e: React\.FormEvent\) => \{/,
  fileUploadLogic + '\n  const handleSubmit = (e: React.FormEvent) => {'
);

// add images to newProp
code = code.replace(
  /imageUrl: imageUrl\.trim\(\) \|\| undefined,/g,
  `imageUrl: images.length > 0 ? images[0] : (imageUrl.trim() || undefined),\n      images: images.length > 0 ? images : (imageUrl.trim() ? [imageUrl.trim()] : []),`
);

// replace input section
const inputSection = `          <div>
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
          </div>`;

code = code.replace(
  /<div>\s*<label className="block font-semibold text-\[#606C5D\] mb-1">\s*Authentic MLS \/ Listing Photo URL <span className="font-normal text-\[#9A9488\]">\(Optional\)<\/span>\s*<\/label>\s*<input\s*type="text"\s*placeholder="Leave blank for clean architectural data card, or paste authentic MLS image URL"\s*value={imageUrl}\s*onChange={\(e\) => setImageUrl\(e\.target\.value\)}\s*className="w-full bg-\[#F9F8F4\] border border-\[#EAE7E0\] rounded-xl px-3\.5 py-2 text-xs text-\[#2D362E\] placeholder-\[#9A9488\]"\s*\/>\s*<\/div>/m,
  inputSection
);

fs.writeFileSync('src/components/NewPropertyModal.tsx', code);
