import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// Omit config — UploadThing v7 reads UPLOADTHING_TOKEN from env at request time.
export const { GET, POST } = createRouteHandler({ router: ourFileRouter });
