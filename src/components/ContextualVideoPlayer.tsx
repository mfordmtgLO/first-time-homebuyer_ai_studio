import React, { useState } from 'react';
import { Play } from 'lucide-react';

interface ContextualVideoPlayerProps {
  videoId: string;
  title: string;
  description?: string;
  className?: string;
}

export const ContextualVideoPlayer: React.FC<ContextualVideoPlayerProps> = ({ 
  videoId, 
  title, 
  description,
  className = "" 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Use the standard YouTube thumbnail URL structure
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  // Fallback to hqdefault if maxresdefault isn't available for some videos
  const fallbackThumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div 
        className="relative w-full overflow-hidden rounded-2xl shadow-sm border border-[#EAE7E0] bg-[#2D362E] aspect-video group cursor-pointer"
        onClick={() => setIsPlaying(true)}
      >
        {!isPlaying ? (
          <>
            <img 
              src={thumbnailUrl} 
              alt={title} 
              onError={(e) => {
                // Fallback if maxresdefault doesn't exist
                (e.target as HTMLImageElement).src = fallbackThumbnailUrl;
              }}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-90 transition-opacity duration-300"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#183922]/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#C18C5D] transition-all duration-300">
                <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white fill-white ml-1" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white font-bold text-sm sm:text-base line-clamp-1">{title}</p>
              {description && <p className="text-white/80 text-xs mt-1 line-clamp-1">{description}</p>}
            </div>
          </>
        ) : (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full"
          ></iframe>
        )}
      </div>
    </div>
  );
};
