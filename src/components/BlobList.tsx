import { useAccountBlobs } from "@shelby-protocol/react";
import { shelbyClient } from "../lib/shelby";

export function BlobList({ account }) {
  const { data: blobs, isLoading, error } = useAccountBlobs({
    client: shelbyClient,
    account,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  console.log(blobs)

  return (
    <div className="px-0 py-0 w-full lg:w-1/2 border-1 border-shelbypink rounded-md">
      {blobs?.map((blob) => (
        <div key={blob.name} className="p-2 block flex justify-between items-center border-b-1 border-gray-500">
          <p>
            <span className="text-gray-300">{blob.blobNameSuffix.length>20? blob.blobNameSuffix.substring(0,20) + '...' : blob.blobNameSuffix}</span>
            <span className="ml-2 text-xs text-gray-500">{(blob.size / 1024).toFixed(2)} KB</span>
          </p>
  
          <a href={`https://api.shelbynet.shelby.xyz/shelby/v1/blobs/${account}/${blob.blobNameSuffix}`} 
          className="bg-shelbypink px-2 py-1 hover:bg-pink-500 rounded-sm text-white">
          Download
          </a>
        </div>
      ))}
    </div>
  );
}