import React, { useState } from "react";
import { useAccountBlobs } from "@shelby-protocol/react";
import { shelbyClient } from "../lib/shelby";


import { File, HardDrive } from "lucide-react";
import { BlobItem, type BlobData } from "./BlobItem";
import  { FilePreviewModal } from "./FilePreviewModal";

interface BlobListProps {
  account: string;
}

export function BlobList({ account }: BlobListProps) {
  const { data: blobs, isLoading, error } = useAccountBlobs({
    client: shelbyClient,
    account,
    refetchInterval: 5000, // Refetch every 5s to keep list updated
  });

  const [selectedBlob, setSelectedBlob] = useState<BlobData | null>(null);
  const [activeCategory, setActiveCategory] = useState<'media' | 'documents'>('media');
  const [displayCount, setDisplayCount] = useState(12); // Initial number of items to show

  const loadMore = () => {
    setDisplayCount(prev => prev + 12); // Load 12 more items
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-shelbypink"></div>
        <p className="text-gray-400">Loading your files...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center border border-red-500/50 bg-red-500/10 rounded-lg">
        <p className="text-red-400">Error loading files: {error.message}</p>
      </div>
    );
  }

  // Sort blobs by creationMicros (newest first)
  const sortedBlobs = blobs ? [...blobs].sort((a, b) => {
    const timeA = a.creationMicros ? Number(a.creationMicros) : 0;
    const timeB = b.creationMicros ? Number(b.creationMicros) : 0;
    return timeB - timeA;
  }) : [];

  // Helper: Categorize files
  const getFileCategory = (fileName: string): 'media' | 'document' | 'other' => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    
    const mediaExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'mp4', 'webm', 'mov', 'avi', 'm4v', 'mkv', 'ogv', 'mp3', 'wav', 'ogg'];
    const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'md', 'rtf', 'odt', 'xlsx', 'xls', 'ppt', 'pptx', 'csv'];
    
    if (mediaExtensions.includes(ext)) return 'media';
    if (documentExtensions.includes(ext)) return 'document';
    return 'other';
  };

  // Categorize files
  const mediaFiles = sortedBlobs.filter(blob => getFileCategory(blob.name) === 'media');
  const documentFiles = sortedBlobs.filter(blob => {
    const category = getFileCategory(blob.name);
    return category === 'document' || category === 'other';
  });

  // Helper for formatting
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (micros?: string | number) => {
    if (!micros) return 'Unknown';
    const date = new Date(Number(micros) / 1000);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const displayFiles = activeCategory === 'media' ? mediaFiles : documentFiles;
  const visibleFiles = displayFiles.slice(0, displayCount);
  const hasMore = displayFiles.length > displayCount;

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6 mt-15">
      {/* Header with Tab Navigation */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <HardDrive className="w-6 h-6 text-shelbypink" />
          <div>
            <h2 className="text-xl font-semibold text-white">My Files</h2>
            <p className="text-sm text-gray-400">
              {sortedBlobs.length} {sortedBlobs.length === 1 ? 'item' : 'items'} stored on Shelby Network
            </p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setActiveCategory('media');
              setDisplayCount(12); // Reset count when switching tabs
            }}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
              ${activeCategory === 'media'
                ? 'bg-shelbypink text-white shadow-lg shadow-shelbypink/20'
                : 'bg-chocodark text-gray-400 hover:text-white hover:bg-chocodark/80 border border-gray-700'
              }
            `}
          >
            Media
            <span className="ml-2 text-xs opacity-75">({mediaFiles.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveCategory('documents');
              setDisplayCount(12); // Reset count when switching tabs
            }}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
              ${activeCategory === 'documents'
                ? 'bg-shelbypink text-white shadow-lg shadow-shelbypink/20'
                : 'bg-chocodark text-gray-400 hover:text-white hover:bg-chocodark/80 border border-gray-700'
              }
            `}
          >
            Documents
            <span className="ml-2 text-xs opacity-75">({documentFiles.length})</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      {visibleFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3 text-center">
          <File className="w-16 h-16 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-400">No {activeCategory} files</h3>
          <p className="text-gray-400 max-w-sm mx-auto">
            Upload {activeCategory} files using the button in the bottom right corner.
          </p>
        </div>
      ) : (
        <>
          {/* Media Grid View */}
          {activeCategory === 'media' && (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-0 space-y-0">
              {visibleFiles.map((blob) => (
                <div key={blob.name} className="break-inside-avoid mb-0">
                  <BlobItem 
                    blob={blob as unknown as BlobData} 
                    account={account} 
                    onClick={() => setSelectedBlob(blob as unknown as BlobData)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Documents List View */}
          {activeCategory === 'documents' && (
            <div className="space-y-2">
              {visibleFiles.map((blob) => {
                const fileName = blob.name.split('/').pop() || blob.name;
                const ext = fileName.split('.').pop()?.toLowerCase() || '';
                
                return (
                  <div
                    key={blob.name}
                    onClick={() => setSelectedBlob(blob as unknown as BlobData)}
                    className="flex items-center gap-4 px-4 py-3 bg-transparent border-b border-gray-800 hover:bg-chocodark/30 transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-chocodark flex items-center justify-center text-blue-400 group-hover:bg-chocodark/80 transition-colors">
                      <File className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{fileName}</p>
                      <p className="text-xs text-gray-400">
                        {formatFileSize(blob.size)} • {formatDate(blob.creationMicros)}
                      </p>
                    </div>
                    <div className="text-xs font-medium text-gray-500 uppercase px-2 py-1 bg-chocodark rounded">
                      {ext}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-8">
              <button
                onClick={loadMore}
                className="px-6 py-3 bg-shelbypink text-white font-medium rounded-lg hover:bg-shelbypink/90 transition-all duration-200 shadow-lg shadow-shelbypink/20"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}

      {/* File Preview Modal */}
      <FilePreviewModal
        blob={selectedBlob}
        isOpen={!!selectedBlob}
        onClose={() => setSelectedBlob(null)}
        account={account}
        onNavigate={(direction) => {
          const currentIdx = visibleFiles.findIndex(b => b.name === selectedBlob?.name);
          if (direction === 'next' && currentIdx < visibleFiles.length - 1) {
            setSelectedBlob(visibleFiles[currentIdx + 1] as unknown as BlobData);
          } else if (direction === 'prev' && currentIdx > 0) {
            setSelectedBlob(visibleFiles[currentIdx - 1] as unknown as BlobData);
          }
        }}
        hasNext={selectedBlob ? visibleFiles.findIndex(b => b.name === selectedBlob.name) < visibleFiles.length - 1 : false}
        hasPrev={selectedBlob ? visibleFiles.findIndex(b => b.name === selectedBlob.name) > 0 : false}
        currentIndex={selectedBlob ? visibleFiles.findIndex(b => b.name === selectedBlob.name) : undefined}
        totalCount={visibleFiles.length}
      />
    </div>
  );
}