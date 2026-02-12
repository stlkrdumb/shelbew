"use client";

import React, { useState } from "react";
import { FileUpload } from "../components/FileUpload";
import { FloatingActionButton } from "../components/FloatingActionButton";

export default function UploadPage() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <>
      <FloatingActionButton onClick={() => setIsUploadModalOpen(true)} />
      
      <FileUpload 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
      />
    </>
  );
}