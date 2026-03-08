import { getShelbyIndexerClient } from "@shelby-protocol/sdk/node";

const indexer = getShelbyIndexerClient({
  network: "testnet",
  apiKey: "aptoslabs_39rdobhq9hs_PaBNwKwQeikVuWqZWC7GP5twBhAcyxT1p"
});

async function main() {
  try {
    console.log("Querying indexer...");
    const blobs = await indexer.getBlobs({ limit: 5 });
    console.log("Recent blobs:");
    console.log(blobs);
  } catch (err) {
    console.error("Error from indexer:");
    console.error(err);
  }
}

main();
