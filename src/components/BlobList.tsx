import { useState } from "react";
import { useAccountBlobs } from "@shelby-protocol/react";
import { shelbyClient } from "../lib/shelby";

export function BlobList({ account }) {
  const { data: blobs, isLoading, error } = useAccountBlobs({
    client: shelbyClient,
    account,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3; // Adjust as needed

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Sort blobs by creationMicros (newest first)
  const sortedBlobs = blobs ? [...blobs].sort((a, b) => {
    const timeA = a.creationMicros ? Number(a.creationMicros) : 0;
    const timeB = b.creationMicros ? Number(b.creationMicros) : 0;
    return timeB - timeA; // Descending order (newest first)
  }) : [];

  // Calculate pagination
  const totalPages = Math.ceil((sortedBlobs?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBlobs = sortedBlobs?.slice(startIndex, endIndex) || [];

  return (
    <div className="px-0 py-0 mx-auto w-full lg:w-1/2">
      <div className="border-1 border-shelbypink rounded-md">
        {currentBlobs.map((blob) => (
          <div key={blob.name} className="p-2 block flex justify-between items-center border-b-1 border-gray-500">
            <p>
              <span className="text-gray-300">
                {blob.blobNameSuffix.length > 20 ? blob.blobNameSuffix.substring(0, 20) + '...' : blob.blobNameSuffix}
              </span>
              <span className="ml-2 text-xs text-gray-500">{(blob.size / 1024).toFixed(2)} KB</span>
            </p>
            <a href={`https://api.shelbynet.shelby.xyz/shelby/v1/blobs/${account}/${blob.blobNameSuffix}`}
              className="bg-shelbypink px-2 py-1 hover:bg-pink-500 rounded-sm text-white flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </a>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-shelbypink text-white rounded 
            disabled:opacity-50 disabled:cursor-not-allowed 
            hover:bg-pink-600 cursor-pointer flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <span className="text-gray-300">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-shelbypink 
            text-white rounded 
            disabled:opacity-50 disabled:cursor-not-allowed 
            hover:bg-pink-600 cursor-pointer flex items-center gap-1"
          >
            Next
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}