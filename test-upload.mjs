import { ShelbyRPCClient } from "@shelby-protocol/sdk/node";
import { AccountAddress } from "@aptos-labs/ts-sdk";

const client = new ShelbyRPCClient({
  network: "shelbynet",
  apiKey: "aptoslabs_39rdobhq9hs_PaBNwKwQeikVuWqZWC7GP5twBhAcyxT1p"
});

async function main() {
  const account = AccountAddress.fromString("0x123".padEnd(66, "0"));
  const blobName = "test-blob-" + Date.now() + ".txt";
  const blobData = new TextEncoder().encode("Hello world this is a test blob data");
  
  try {
    console.log("Attempting putBlob...");
    await client.putBlob({
      account,
      blobName,
      blobData
    });
    console.log("Success!");
  } catch (err) {
    console.error("Error from SDK:");
    console.error(err);
  }
}

main();
