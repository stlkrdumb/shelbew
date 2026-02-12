"use client";

import React, { useState, useCallback } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useUploadBlobs } from "@shelby-protocol/react";
import { shelbyClient } from "../lib/shelby";

import { toast } from "sonner";

interface FileUploadProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FileUpload({ isOpen, onClose }: FileUploadProps) {
  const { account, signAndSubmitTransaction, connected } = useWallet();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Set default expiration to 7 days from now
  const defaultExpiration = new Date();
  defaultExpiration.setDate(defaultExpiration.getDate() + 7);
  const [expirationDate, setExpirationDate] = useState<Date>(defaultExpiration);
  const [selectedDuration, setSelectedDuration] = useState<number>(7);

  const handleDurationChange = (days: number) => {
    setSelectedDuration(days);
    const date = new Date();
    date.setDate(date.getDate() + days);
    setExpirationDate(date);
  };

  const uploadBlobs = useUploadBlobs({
    client: shelbyClient,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess: (data?: any) => {
      // Debug: Log the full response to see what we're getting
      console.log("Upload success! Full response data:", data);
      console.log("Data type:", typeof data);
      console.log("Data keys:", data ? Object.keys(data) : "no data");
      
      // Get transaction hash from the response if available
      const txHash = data?.hash || data?.transaction?.hash || data?.transactionHash;
      
      if (txHash) {
        // Show success toast with transaction link
        toast.success("Files uploaded successfully!", {
          description: (
            <a 
              href={`https://explorer.shelby.xyz/shelbynet/txn/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              View transaction: {txHash.slice(0, 8)}...{txHash.slice(-6)}
            </a>
          ),
          duration: 10000,
        });
      } else {
        toast.success("Files uploaded successfully!");
      }
      
      setSelectedFiles([]);
      onClose(); // Close modal on success
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    },
    onError: (error) => {
      // Provide user-friendly error messages
      let userMessage = "Something went wrong while uploading your files.";
      
      // 502 errors often mean the transaction succeeded but the server couldn't send confirmation
      if (error.message.includes("502") || error.message.includes("Bad Gateway")) {
        userMessage = "Upload may have completed successfully, but we couldn't confirm it. Please refresh the page to check if your files appear in the list below.";
        toast.info("Upload Status Uncertain", {
          description: userMessage,
          duration: 5000,
        });
        
        // For 502 errors, refresh after a delay to check if files actually uploaded
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else if (error.message.includes("403") || error.message.includes("Forbidden")) {
        userMessage = "Access denied. Please check your API key configuration.";
        toast.error("Upload Failed", { description: userMessage });
      } else if (error.message.includes("413") || error.message.includes("too large")) {
        userMessage = "Your files are too large. Please try uploading smaller files.";
        toast.error("Upload Failed", { description: userMessage });
      } else if (error.message.includes("network") || error.message.includes("Network")) {
        userMessage = "Network error. Please check your internet connection and try again.";
        toast.error("Upload Failed", { description: userMessage });
      } else if (error.message.includes("timeout")) {
        userMessage = "Upload timed out. Please try again with a better connection.";
        toast.error("Upload Failed", { description: userMessage });
      } else {
        toast.error("Upload Failed", { description: userMessage });
      }
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  const handleUpload = useCallback(async () => {
    if (!connected || !account || !signAndSubmitTransaction) {
      toast.error("Wallet Not Connected", {
        description: "Please connect your wallet first",
      });
      return;
    }

    if (selectedFiles.length === 0) {
      toast.error("No Files Selected", {
        description: "Please select at least one file",
      });
      return;
    }

    // Convert files to Uint8Array
    const blobs = await Promise.all(
      selectedFiles.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        return {
          blobName: file.name,
          blobData: new Uint8Array(arrayBuffer),
        };
      }),
    );

    // Convert selected expiration date to microseconds
    const expirationMicros = Math.floor(expirationDate.getTime() * 1000);

    if (isNaN(expirationMicros)) {
      toast.error("Invalid Date", {
        description: "Please select a valid expiration date",
      });
      return;
    }

    // Upload the blobs to the Shelby network
    uploadBlobs.mutate({
      signer: { account: account.address.toStringLongWithoutPrefix(), signAndSubmitTransaction },
      blobs,
      expirationMicros,
    });
  }, [connected, account, signAndSubmitTransaction, selectedFiles, uploadBlobs, expirationDate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-chocodark w-full max-w-2xl rounded-xl border border-shelbypink shadow-2xl overflow-hidden animate-scaleIn flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-shelbypink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload Files
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          
          {!connected && (
             <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-4 text-center">
               <p className="text-red-200">Please connect your wallet to upload files.</p>
             </div>
          )}

          {/* Drag and Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-xl p-8 mb-6 transition-all duration-300 text-center
              ${isDragging 
                ? "border-shelbypink bg-shelbypink/10 scale-[1.02]" 
                : "border-gray-600 hover:border-shelbypink/50 hover:bg-shelbypink/5"
              }
            `}
          >
            <input
              type="file"
              multiple
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileSelect}
              disabled={!connected}
            />
            <div className="flex flex-col items-center pointer-events-none">
              <div className={`
                w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4 transition-colors
                ${isDragging ? "bg-shelbypink text-white" : "text-shelbypink"}
              `}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-lg font-medium text-white mb-1">
                Drag & Drop files here
              </p>
              <p className="text-sm text-gray-400">
                or click to browse
              </p>
            </div>
          </div>

          {/* File List */}
          {selectedFiles.length > 0 && (
            <div className="mb-6 space-y-2">
              <p className="text-sm font-medium text-gray-400 mb-2">Selected Files ({selectedFiles.length})</p>
              <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3 border border-gray-700 group hover:border-shelbypink/30 transition-all">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFile(index)}
                      className="text-gray-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Expiration Date
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 3, 7, 14, 30].map((days) => (
                <button
                  key={days}
                  onClick={() => handleDurationChange(days)}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border
                    ${selectedDuration === days
                      ? "bg-shelbypink text-white border-shelbypink shadow-lg shadow-shelbypink/20"
                      : "bg-gray-800 text-gray-400 border-gray-700 hover:border-shelbypink/50 hover:text-white hover:bg-gray-700"
                    }
                  `}
                >
                  {days === 30 ? "1 Month" : `${days}d`}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Files will expire on <span className="text-shelbypink">{expirationDate.toLocaleString()}</span>
            </p>
          </div>

          {/* Error Message */}
          {uploadBlobs.isError && (
             <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                <p className="text-sm text-red-200 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {uploadBlobs.error?.message}
                </p>
             </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-800 bg-gray-900/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploadBlobs.isPending || selectedFiles.length === 0 || !connected}
            className={`
              px-6 py-2 rounded-lg font-bold text-white transition-all shadow-lg flex items-center gap-2 cursor-pointer
              ${uploadBlobs.isPending || selectedFiles.length === 0 || !connected
                ? "bg-gray-700 cursor-not-allowed opacity-50" 
                : "bg-linear-to-r from-shelbypink to-pink-600 hover:from-pink-500 hover:to-shelbypink hover:shadow-pink-500/20"
              }
            `}
          >
            {uploadBlobs.isPending ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <span>Upload Files</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}