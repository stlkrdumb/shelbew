"use client";

import React, { useState } from "react";
import { FileUpload } from "../components/FileUpload";
import { FloatingActionButton } from "../components/FloatingActionButton";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export default function UploadPage() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { connected } = useWallet();

  return (
    <>
      {connected && (
        <FloatingActionButton onClick={() => setIsUploadModalOpen(true)} />
      )}

      <FileUpload
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </>
  );
}