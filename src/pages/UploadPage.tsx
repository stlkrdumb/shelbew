"use client";


import { FileUpload } from "../components/FileUpload";


export default function UploadPage() {
  return (
    <div>
      <header>
        <div>
          <h1 className="hidden">Shelby File Upload</h1>
        </div>
      </header>
      <main>
        <FileUpload/>
      </main>
    </div>
  );
}