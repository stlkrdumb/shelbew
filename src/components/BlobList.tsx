import React, { useState } from "react";
import { useAccountBlobs } from "@shelby-protocol/react";
import { shelbyClient } from "../lib/shelby";

import { Button } from "@/components/ui/button";
import { File, HardDrive } from "lucide-react";
import { BlobItem, type BlobData } from "./BlobItem";
import { FilePreviewModal } from "./FilePreviewModal";

interface BlobListProps {
  account: string;
}

export function BlobList({ account }: BlobListProps) {
  const { data: blobs, isLoading, error } = useAccountBlobs({
    client: shelbyClient,
    account,
    refetchInterval: 5000, // Refetch every 5s to keep list updated
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBlob, setSelectedBlob] = useState<BlobData | null>(null);
  const itemsPerPage = 8; // Increased for grid view

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

  // Pagination
  const totalPages = Math.ceil((sortedBlobs?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBlobs = sortedBlobs?.slice(startIndex, endIndex) || [];



  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <HardDrive className="w-6 h-6 text-shelbypink" />
            My Files
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {sortedBlobs.length} items stored on Shelby Network
          </p>
        </div>
      </div>

      {/* Empty State */}
      {currentBlobs.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-700 rounded-xl bg-gray-800/30">
          <div className="bg-gray-700/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <File className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No files found</h3>
          <p className="text-gray-400 max-w-sm mx-auto">
            Upload files using the button in the bottom right corner to get started.
          </p>
        </div>
      ) : (
        /* Grid Layout */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {currentBlobs.map((blob) => (
            <BlobItem 
              key={blob.name} 
              blob={blob as unknown as BlobData} 
              account={account} 
              onClick={() => setSelectedBlob(blob as unknown as BlobData)}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`
              border-shelbypink text-shelbypink hover:bg-shelbypink hover:text-white transition-colors
              ${currentPage === 1 ? "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-shelbypink" : ""}
            `}
          >
            Previous
          </Button>

          <span className="text-sm text-gray-400 font-medium bg-gray-800 px-3 py-1 rounded-md border border-gray-700">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`
              border-shelbypink text-shelbypink hover:bg-shelbypink hover:text-white transition-colors
              ${currentPage === totalPages ? "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-shelbypink" : ""}
            `}
          >
            Next
          </Button>
        </div>
      )}

      {/* File Preview Modal */}
      <FilePreviewModal
        blob={selectedBlob}
        isOpen={!!selectedBlob}
        onClose={() => setSelectedBlob(null)}
        account={account}
        onNavigate={(direction) => {
          const currentIdx = sortedBlobs.findIndex(b => b.name === selectedBlob?.name);
          if (direction === 'next' && currentIdx < sortedBlobs.length - 1) {
            setSelectedBlob(sortedBlobs[currentIdx + 1] as unknown as BlobData);
          } else if (direction === 'prev' && currentIdx > 0) {
            setSelectedBlob(sortedBlobs[currentIdx - 1] as unknown as BlobData);
          }
        }}
        hasNext={selectedBlob ? sortedBlobs.findIndex(b => b.name === selectedBlob.name) < sortedBlobs.length - 1 : false}
        hasPrev={selectedBlob ? sortedBlobs.findIndex(b => b.name === selectedBlob.name) > 0 : false}
        currentIndex={selectedBlob ? sortedBlobs.findIndex(b => b.name === selectedBlob.name) : undefined}
        totalCount={sortedBlobs.length}
      />
    </div>
  );
};