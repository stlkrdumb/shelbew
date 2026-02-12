"use client";

import React, { useState, useCallback } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useUploadBlobs } from "@shelby-protocol/react";
import { shelbyClient } from "../lib/shelby";
import { DatePicker } from "./DatePicker";
import { toast } from "sonner";

export function FileUpload() {
  const { account, signAndSubmitTransaction, connected } = useWallet();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Set default expiration to 7 days from now
  const defaultExpiration = new Date();
  defaultExpiration.setDate(defaultExpiration.getDate() + 7);
  const [expirationDate, setExpirationDate] = useState<Date>(defaultExpiration);

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
    setSelectedFiles(files);
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
      expirationMicros: expirationMicros.toString() as unknown as number,
    });
  }, [connected, account, signAndSubmitTransaction, selectedFiles, uploadBlobs, expirationDate]);

  return (
    <div className="min-h-100 flex justify-center items-center">

      {!connected && (
        <div>
          <p>Please connect your wallet to upload files.</p>
        </div>
      )}

      {connected && (
        <div>

          <div className="border-2 b-chocodark p-3 rounded-md h-30 flex items-center justify-center relative">
            <label className="cursor-pointer inset-0 opacity-0 absolute" htmlFor="file-upload">
              <img className="fill-white mr-2 h-auto w-10" src="/add-media-image.svg" />
              <span className="text-blue-500 font-bold cursor-pointer">Choose a file</span>
              <input
                type="file"
                multiple
                className="sr-only"
                name="file-upload"
                id="file-upload"
                onChange={handleFileSelect}
              />
              <p className="text-xs/5 text-gray-400">PNG, JPG, GIF up to 10MB</p>
            </label>

            <div className="text-center">
              <img className="mx-auto h-auto w-10" src="/add-media-image.svg" />
              <p className="font-bold text-pink-200">Choose a file</p>
              <p className="text-xs/5 text-gray-400">PNG, JPG, GIF up to 10MB</p>
            </div>

          </div>

          {/* Expiration Date Selector */}
          <div className="mt-3">
            <label htmlFor="expiration-date" className="block text-sm font-medium text-gray-300 mb-1">
              Expiration Date
            </label>
            <DatePicker
              value={expirationDate}
              onChange={setExpirationDate}
              minDate={new Date()}
            />
            <p className="text-xs text-gray-400 mt-1">
              Files will expire on {expirationDate.toLocaleString()}
            </p>
          </div>


          <button
            className="px-3 py-2 cursor-pointer mt-2 w-full lg:w-100 bg-shelbypink text-white font-medim rounded-md hover:bg-pink-900 flex items-center justify-center gap-2"
            onClick={handleUpload}
            disabled={uploadBlobs.isPending || selectedFiles.length === 0}
          >
            {uploadBlobs.isPending ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload
              </>
            )}
          </button>
          {selectedFiles.length > 0 && (
            <div>
              <ul className="bg-chocodark px-2 py-1 mt-1 text-sm text-gray-500 font-medium rounded-sm border border-shelbypink">
                {selectedFiles.map((file, index) => (
                  <li key={index}>
                    {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </li>
                ))}
              </ul>
            </div>
          )}
          {uploadBlobs.isError && (
            <div>
              <p>
                Error: {uploadBlobs.error?.message}
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}