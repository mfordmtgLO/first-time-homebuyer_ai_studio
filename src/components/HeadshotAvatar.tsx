import React, { useState, useEffect } from "react";
import { getInitials } from "../utils/imageUtils";

interface HeadshotAvatarProps {
  src?: string;
  name: string;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const HeadshotAvatar: React.FC<HeadshotAvatarProps> = ({
  src,
  name,
  title,
  className = "w-12 h-12 rounded-2xl border-2 border-white shadow-md bg-[#EAE7E0]",
  style
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  // Reset error state whenever src changes (e.g. user uploads a new headshot)
  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  const initials = getInitials(name);

  if (!src || imageFailed) {
    return (
      <div
        style={style}
        className={`${className} flex flex-col items-center justify-center bg-gradient-to-br from-[#2D362E] via-[#3A4A3C] to-[#4A5D4E] text-white font-serif font-bold shadow-sm select-none shrink-0 overflow-hidden relative`}
        title={title || name}
      >
        <span className="text-sm tracking-wider">{initials}</span>
        <span className="text-[8px] uppercase tracking-widest text-emerald-200/80 -mt-0.5">Guide</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      title={title || name}
      referrerPolicy="no-referrer"
      className={`${className} object-cover object-top shrink-0 bg-[#EAE7E0]`}
      style={style}
      onError={() => setImageFailed(true)}
    />
  );
};
