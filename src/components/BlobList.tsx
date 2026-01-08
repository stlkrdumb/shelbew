import { ShelbyClient } from "@shelby-protocol/sdk/browser";
import { Network } from "@aptos-labs/ts-sdk";
import { useAccountBlobs } from "@shelby-protocol/react";

const shelbyClient = new ShelbyClient({ network: Network.SHELBYNET });

export function BlobList({ account }: { account: string }) {
  const { data: blobs, isLoading, error } = useAccountBlobs({
    client: shelbyClient,
    account,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {blobs?.map((blob) => (
        <li key={blob.name}>{blob.name}</li>
      ))}
    </ul>
  );
}