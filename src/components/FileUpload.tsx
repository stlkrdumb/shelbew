"use client";

import { useState, useCallback } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useUploadBlobs } from "@shelby-protocol/react";
import { shelbyClient } from "../lib/shelby";

export function FileUpload() {
  const { account, signAndSubmitTransaction, connected } = useWallet();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const uploadBlobs = useUploadBlobs({
    client: shelbyClient,
    onSuccess: () => {
      alert("Files uploaded successfully!");
      setSelectedFiles([]);
    },
    onError: (error) => {
      alert(`Upload failed: ${error.message}`);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const handleUpload = useCallback(async () => {
    if (!connected || !account || !signAndSubmitTransaction) {
      alert("Please connect your wallet first");
      return;
    }

    if (selectedFiles.length === 0) {
      alert("Please select at least one file");
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

    // Set expiration time to 7 days from now (in microseconds)
    const expirationMicros =
      (Date.now() * 1000) + (7 * 24 * 60 * 60 * 1000 * 1000);

    // Upload the blobs to the Shelby network
    uploadBlobs.mutate({
      signer: { account: account.address.toStringLongWithoutPrefix(), signAndSubmitTransaction },
      blobs,
      expirationMicros,
    });
  }, [connected, account, signAndSubmitTransaction, selectedFiles, uploadBlobs]);

  return (
    <div className="min-h-100 flex justify-center items-center">

      {!connected && (
        <div>
          <p>Please connect your wallet to upload files.</p>
        </div>
      )}

      {connected && (
        <div>
          <div className="border-2 b-pink-800 p-3 rounded-md w-100 h-50 flex items-center justify-center">
            <label htmlFor="file-upload">
              <span className="text-blue-500 font-bold">Upload a file</span>
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

            <button
            className="p-3 bg-pink-800 text-white font-medim rounded-r-sm"
            onClick={handleUpload}
            disabled={uploadBlobs.isPending || selectedFiles.length === 0}
          >
            {uploadBlobs.isPending ? "Uploading..." : "Upload Files"}
          </button>
          </div>
          {selectedFiles.length > 0 && (
            <div>
              <ul className="bg-pink-100 p-2 font-medium rounded-sm border-1">
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