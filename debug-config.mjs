import { ShelbyNodeClient } from "@shelby-protocol/sdk/node";
import { Network } from "@aptos-labs/ts-sdk";

const config = {
  network: Network.SHELBYNET,
  apiKey: "test-api-key",
};

try {
  const client = new ShelbyNodeClient(config);
  console.log("Client created successfully");
  console.log("Config:", JSON.stringify(client, null, 2));
} catch (error) {
  console.error("Error creating client:", error);
}
