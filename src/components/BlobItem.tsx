
import React from 'react';
import { Card } from "@/components/ui/card";
import { 
  File, 
  Clock, 
  FileText, 
  Image as ImageIcon, 
  Music, 
  Video 
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
    <Card 
      onClick={onClick}
      className="bg-chocodark border-gray-700 hover:border-shelbypink/50 transition-all duration-300 hover:shadow-lg hover:shadow-shelbypink/10 group overflow-hidden h-64 relative p-0 gap-0 block cursor-pointer"
    >
      <div className="p-0 absolute inset-0 z-0">
        {/* Image Preview / Icon Area - Covers the card */}
        <div className="w-full h-full bg-chocodark flex items-center justify-center relative group-hover:opacity-90 transition-opacity">
          
          {/* Render Image if it's an image file and hasn't errored */}
          {isImage && !imageError && (
            <img
              src={imageUrl}
              alt={fileName}
              className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          )}

          {/* Render Video Preview if it's a video file */}
          {(!isImage && ['mp4', 'webm', 'mov', 'avi', 'm4v', 'mkv', 'ogv'].includes(ext || '')) && (
            <video
              src={imageUrl}
              className="w-full h-full object-cover"
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
            <div className={`absolute inset-0 flex items-center justify-center ${isImage && !imageError && !imageLoaded ? 'animate-pulse' : ''} ${isImage && !imageError && imageLoaded ? 'hidden' : ''}`}>
               {getIcon()}
            </div>
          )}

        </div>


      </div>

      <div className="absolute bottom-0 left-0 right-0 px-3 py-2 flex items-center justify-between text-[10px] text-gray-200 bg-black/60 backdrop-blur-sm shrink-0 h-10 z-10">
        <div className="flex items-center gap-1">
          <span className="font-medium">{formatFileSize(blob.size)}</span>
        </div>
        <div className="flex items-center gap-1" title={new Date(Number(blob.creationMicros) / 1000).toLocaleString()}>
          <Clock className="w-3 h-3" />
          <span>{formatDate(blob.creationMicros)}</span>
        </div>
      </div>
    </Card>
  );
}
