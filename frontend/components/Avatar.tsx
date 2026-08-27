import React from "react";

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  ringClassName?: string;
}

const sizeClasses = {
  xs: "w-8 h-8 text-xs",
  sm: "w-9 h-9 text-sm",
  md: "w-11 h-11 text-base",
  lg: "w-16 h-16 text-lg",
  xl: "w-24 h-24 text-xl",
};

export default function Avatar({ src, name = "", size = "md", className = "", ringClassName = "" }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const baseClasses = `rounded-full bg-[#8B5E3C] text-white flex items-center justify-center font-medium overflow-hidden flex-shrink-0 ${sizeClasses[size]} ${className}`;

  const content = src ? (
    <img src={src} alt={name} className="w-full h-full object-cover" />
  ) : (
    <img src="/default-avatar.svg" alt={name || "User"} className="w-full h-full object-cover" />
  );

  return (
    <div className={`${baseClasses} ${ringClassName}`}>
      {content}
    </div>
  );
}
