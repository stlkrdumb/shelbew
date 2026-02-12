
import React from 'react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { BlobData } from "./BlobItem"; // Import BlobData type
import { Download, Trash2, File, Music, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface FilePreviewModalProps {
  blob: BlobData | null;
  isOpen: boolean;
  onClose: () => void;
  account: string;
  onNavigate?: (direction: 'prev' | 'next') => void;
  hasNext?: boolean;
  hasPrev?: boolean;
  currentIndex?: number;
  totalCount?: number;
}

export function FilePreviewModal({ 
  blob, 
  isOpen, 
  onClose, 
  account,
  onNavigate,
  hasNext = false,
  hasPrev = false,
  currentIndex,
  totalCount
}: FilePreviewModalProps) {
  // Keyboard navigation
  React.useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && hasPrev && onNavigate) {
        onNavigate('prev');
      } else if (e.key === 'ArrowRight' && hasNext && onNavigate) {
        onNavigate('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNavigate, hasNext, hasPrev]);

  if (!blob) return null;

  const fileName = blob.blobNameSuffix;
  // Safely encode filename parts
  const encodedFileName = fileName.split('/').map(part => encodeURIComponent(part)).join('/');
  const fileUrl = `https://api.shelbynet.shelby.xyz/shelby/v1/blobs/${account}/${encodedFileName}`;
  
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext);
  const isVideo = ['mp4', 'webm', 'mov', 'avi', 'm4v', 'mkv', 'ogv'].includes(ext);
  const isAudio = ['mp3', 'wav', 'ogg'].includes(ext);
  const isDocument = ['pdf', 'doc', 'docx', 'txt', 'md'].includes(ext);

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

  const handleDelete = () => {
    // Placeholder for delete functionality
    toast.info("Delete feature coming soon!", {
      description: "We are working on adding file deletion capabilities.",
    });
  };

  const renderPreview = () => {
    if (isImage) {
      return (
        <div className="w-full h-[60vh] flex items-center justify-center overflow-hidden">
          <img 
            src={fileUrl} 
            alt={fileName} 
            className="max-w-full max-h-full object-contain"
          />
        </div>
      );
    }
    
    if (isVideo) {
      return (
        <div className="w-full h-[60vh] flex items-center justify-center overflow-hidden">
          <video 
            src={fileUrl} 
            controls 
            className="max-w-full max-h-full"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    if (isAudio) {
      return (
        <div className="w-full h-[60vh] flex flex-col items-center justify-center p-8 gap-4">
          <div className="w-24 h-24 rounded-full bg-chocodark flex items-center justify-center text-green-400">
             <Music className="w-12 h-12" />
          </div>
          <audio src={fileUrl} controls className="w-full max-w-md" />
        </div>
      );
    }

    // Default / Document fallback
    let IconComponent = File;
    let colorClass = "text-gray-400";
    
    if (isDocument) {
      IconComponent = FileText;
      colorClass = "text-orange-400";
    }

    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center p-8 gap-4 text-center">
        <IconComponent className={`w-24 h-24 ${colorClass}`} />
        <p className="text-gray-400">Preview not available for this file type.</p>
        <Button variant="outline" asChild className="mt-4 border-shelbypink text-shelbypink hover:bg-shelbypink hover:text-white">
            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                Open in New Tab
            </a>
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={false} className="sm:max-w-5xl bg-transparent border-none shadow-none text-white p-0 overflow-hidden flex flex-col max-h-[95vh] w-[95vw]">
        
        {/* File Info Overlay - Top */}
        <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/60 to-transparent p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white truncate mb-1">{fileName}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-300">
                <span>{formatFileSize(blob.size)}</span>
                <span>•</span>
                <span>{formatDate(blob.creationMicros)}</span>
                {currentIndex !== undefined && totalCount !== undefined && (
                  <>
                    <span>•</span>
                    <span>{currentIndex + 1} of {totalCount}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto flex flex-col items-center justify-center relative group">
          {/* Navigation Arrows */}
          {hasPrev && onNavigate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate('prev');
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
              aria-label="Previous file"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {hasNext && onNavigate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate('next');
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
              aria-label="Next file"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Preview Content */}
          <div className="w-full h-full flex items-center justify-center p-6">
            {renderPreview()}
          </div>
        </div>

        {/* Action Buttons - Bottom (appear on hover) */}
        <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/60 to-transparent p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center justify-between">
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 backdrop-blur-sm"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>

            <div className="flex gap-2">
              <Button variant="secondary" onClick={onClose} className="bg-black/40 text-gray-300 hover:bg-black/60 backdrop-blur-sm">
                Close
              </Button>
              <Button asChild className="bg-linear-to-r from-shelbypink to-pink-600 hover:opacity-90 text-white border-0 shadow-lg">
                <a href={fileUrl} download target="_blank" rel="noopener noreferrer">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </a>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
