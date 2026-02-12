
import React from 'react';
import { 
  File, 
  Clock, 
  FileText, 
  Image as ImageIcon, 
  Music, 
  Video,
  Eye
} from "lucide-react";

export interface BlobData {
  name: string;
  size: number;
  creationMicros?: string | number;
  blobNameSuffix: string;
}

interface BlobItemProps {
  blob: BlobData;
  account: string;
  onClick: () => void;
}

export function BlobItem({ blob, account, onClick }: BlobItemProps) {
  const [imageError, setImageError] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (micros?: string | number) => {
    if (!micros) return 'Unknown date';
    const date = new Date(Number(micros) / 1000);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const fileName = blob.blobNameSuffix;
  const ext = fileName.split('.').pop()?.toLowerCase();
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '');
  
  // Safely encode the filename parts to handle spaces and special characters
  const encodedFileName = fileName.split('/').map(part => encodeURIComponent(part)).join('/');
  const imageUrl = `https://api.shelbynet.shelby.xyz/shelby/v1/blobs/${account}/${encodedFileName}`;

  const getIcon = () => {
    let IconComponent = File;
    let colorClass = "text-gray-400";

    if (['mp4', 'webm', 'mov', 'avi', 'm4v', 'mkv', 'ogv'].includes(ext || '')) {
      IconComponent = Video;
      colorClass = "text-purple-400";
    } else if (['mp3', 'wav', 'ogg'].includes(ext || '')) {
      IconComponent = Music;
      colorClass = "text-green-400";
    } else if (['pdf', 'doc', 'docx', 'txt', 'md'].includes(ext || '')) {
      IconComponent = FileText;
      colorClass = "text-orange-400";
    } else if (isImage) {
      // Fallback icon for images
      IconComponent = ImageIcon;
      colorClass = "text-blue-400";
    }

    return <IconComponent className={`w-16 h-16 ${colorClass}`} />;
  };

  return (
    <div 
      onClick={onClick}
      className="group overflow-hidden w-full relative cursor-pointer"
    >
      {/* Main content with natural aspect ratio */}
      <div className="relative w-full">
        {/* Render Image if it's an image file and hasn't errored */}
        {isImage && !imageError && (
          <img
            src={imageUrl}
            alt={fileName}
            className={`w-full h-auto transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}

        {/* Render Video Preview if it's a video file */}
        {(!isImage && ['mp4', 'webm', 'mov', 'avi', 'm4v', 'mkv', 'ogv'].includes(ext || '')) && (
          <video
            src={imageUrl}
            className="w-full h-auto"
            muted
            loop
            playsInline
            onMouseOver={(e) => e.currentTarget.play()}
            onMouseOut={(e) => {
              e.currentTarget.pause();
              e.currentTarget.currentTime = 0;
            }}
          />
        )}

        {/* Render Icon if not an image/video, or if media failed to load */}
        {(!isImage && !['mp4', 'webm', 'mov', 'avi', 'm4v', 'mkv', 'ogv'].includes(ext || '') || (isImage && imageError)) && (
          <div className={`w-full aspect-square bg-gray-900 flex items-center justify-center ${isImage && !imageError && !imageLoaded ? 'animate-pulse' : ''}`}>
            {getIcon()}
          </div>
        )}

        {/* Hover Overlay - Shows "Click to preview" */}
        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20 pointer-events-none backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2 text-white transform scale-90 group-hover:scale-100 transition-transform duration-300">
            <Eye className="w-10 h-10 text-shelbypink" />
            <span className="text-sm font-semibold tracking-wide">Click to preview</span>
          </div>
        </div>

        {/* Bottom metadata bar */}
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2 flex items-center justify-between text-[10px] text-gray-200 bg-black/60 backdrop-blur-sm shrink-0 h-10 z-10">
          <div className="flex items-center gap-1">
            <span className="font-medium">{formatFileSize(blob.size)}</span>
          </div>
          <div className="flex items-center gap-1" title={new Date(Number(blob.creationMicros) / 1000).toLocaleString()}>
            <Clock className="w-3 h-3" />
            <span>{formatDate(blob.creationMicros)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
