
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { BlobData } from "./BlobItem"; // Import BlobData type
import { Download, Trash2, File, Music, FileText } from "lucide-react";
import { toast } from "sonner";

interface FilePreviewModalProps {
  blob: BlobData | null;
  isOpen: boolean;
  onClose: () => void;
  account: string;
}

export function FilePreviewModal({ blob, isOpen, onClose, account }: FilePreviewModalProps) {
  if (!blob) return null;

  const fileName = blob.blobNameSuffix;
  // Safely encode filename parts
  const encodedFileName = fileName.split('/').map(part => encodeURIComponent(part)).join('/');
  const fileUrl = `https://api.shelbynet.shelby.xyz/shelby/v1/blobs/${account}/${encodedFileName}`;
  
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext);
  const isVideo = ['mp4', 'webm', 'mov', 'avi'].includes(ext);
  const isAudio = ['mp3', 'wav', 'ogg'].includes(ext);
  const isDocument = ['pdf', 'doc', 'docx', 'txt', 'md'].includes(ext);

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
          <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center text-green-400">
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
      <DialogContent className="sm:max-w-4xl bg-transparent border-none shadow-none text-white p-0 overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex-1 overflow-auto p-6 flex flex-col items-center justify-center">
            {renderPreview()}
        </div>

        <DialogFooter className="p-6 border-t-0 bg-transparent shrink-0 gap-2 sm:justify-between">
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
