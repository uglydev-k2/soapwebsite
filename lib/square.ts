import { SquareClient, SquareEnvironment } from "square";

let squareClient: SquareClient | null = null;

export function isSquareConfigured(): boolean {
  return Boolean(
    process.env.SQUARE_ACCESS_TOKEN?.trim() &&
      process.env.SQUARE_LOCATION_ID?.trim()
  );
}

export function getSquareEnvironment(): typeof SquareEnvironment.Production | typeof SquareEnvironment.Sandbox {
  return process.env.SQUARE_ENVIRONMENT === "production"
    ? SquareEnvironment.Production
    : SquareEnvironment.Sandbox;
}

export function getSquareClient(): SquareClient {
  if (!process.env.SQUARE_ACCESS_TOKEN) {
    throw new Error("SQUARE_ACCESS_TOKEN is not configured");
  }
  if (!squareClient) {
    squareClient = new SquareClient({
      token: process.env.SQUARE_ACCESS_TOKEN,
      environment: getSquareEnvironment(),
    });
  }
  return squareClient;
}

export function getSquareLocationId(): string {
  const locationId = process.env.SQUARE_LOCATION_ID?.trim();
  if (!locationId) {
    throw new Error("SQUARE_LOCATION_ID is not configured");
  }
  return locationId;
}

export function getSquareScriptUrl(): string {
  return getSquareEnvironment() === SquareEnvironment.Production
    ? "https://web.squarecdn.com/v1/square.js"
    : "https://sandbox.web.squarecdn.com/v1/square.js";
}
