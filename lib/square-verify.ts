import { getSquareClient, getSquareLocationId, isSquareConfigured } from "@/lib/square";
import { formatSquareApiError } from "@/lib/square-subscription";
import { SquareError } from "square";

export type SquareAccessTokenCheck = {
  configured: boolean;
  environment: "production" | "sandbox";
  tokenAccepted: boolean;
  locationIdConfigured: string | null;
  locationIdValid: boolean;
  detail: string;
  squareErrorCode?: string;
};

export async function verifySquareAccessToken(): Promise<SquareAccessTokenCheck> {
  const environment =
    process.env.SQUARE_ENVIRONMENT?.trim() === "production" ? "production" : "sandbox";
  const locationIdConfigured = isSquareConfigured() ? getSquareLocationId() : null;

  if (!isSquareConfigured()) {
    return {
      configured: false,
      environment,
      tokenAccepted: false,
      locationIdConfigured,
      locationIdValid: false,
      detail: "SQUARE_ACCESS_TOKEN or SQUARE_LOCATION_ID is missing in server env",
    };
  }

  try {
    const response = await getSquareClient().locations.list();
    const locations = response.locations ?? [];
    const locationIdValid = locations.some((loc) => loc.id === locationIdConfigured);

    return {
      configured: true,
      environment,
      tokenAccepted: true,
      locationIdConfigured,
      locationIdValid,
      detail: locationIdValid
        ? "Access token is valid and location ID matches this Square account"
        : "Access token works but SQUARE_LOCATION_ID does not match any location on this account",
    };
  } catch (error) {
    const detail = formatSquareApiError(error);
    const squareErrorCode =
      error instanceof SquareError ? error.errors[0]?.code : undefined;

    return {
      configured: true,
      environment,
      tokenAccepted: false,
      locationIdConfigured,
      locationIdValid: false,
      detail,
      squareErrorCode,
    };
  }
}
