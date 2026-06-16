import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireAdmin,
  jsonResponse,
  errorResponse,
  requireRateLimit,
} from "@/lib/api-helpers";
import { withApiHandler } from "@/lib/api-handler";
import { logAdminAction } from "@/lib/audit";
import { getClientIp } from "@/lib/rate-limit";

export const GET = withApiHandler("admin.notifications.list", async () => {
  const { error } = await requireAdmin("notifications:write");
  if (error) return error;

  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return jsonResponse(announcements);
});

export const POST = withApiHandler(
  "admin.notifications.send",
  async (request: NextRequest) => {
    const limited = requireRateLimit(request, "announcements", 5);
    if (limited) return limited;

    const { session, error } = await requireAdmin("notifications:write");
    if (error) return error;

    const body = await request.json();
    const { title, body: message, segment } = body as {
      title: string;
      body: string;
      segment?: string;
    };

    if (!title || !message) return errorResponse("Title and body required");

    let recipients: string[] = [];
    if (segment === "newsletter") {
      const subs = await prisma.newsletterSubscriber.findMany({
        where: { active: true },
        select: { email: true },
      });
      recipients = subs.map((s) => s.email);
    } else {
      const customers = await prisma.customer.findMany({
        where: { status: "ACTIVE" },
        select: { email: true },
      });
      recipients = customers.map((c) => c.email);
    }

    let sentCount = 0;
    const resendClient = process.env.RESEND_API_KEY
      ? (await import("resend")).Resend
      : null;
    if (resendClient && recipients.length > 0) {
      const client = new resendClient(process.env.RESEND_API_KEY!);
      for (const email of recipients.slice(0, 100)) {
        try {
          await client.emails.send({
            from: process.env.RESEND_FROM_EMAIL || "hello@mvlusciouslather.com",
            to: email,
            subject: title,
            html: `<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;"><h1 style="color:#2C4A3E;font-weight:300;">${title}</h1><p>${message}</p></div>`,
          });
          sentCount++;
        } catch {
          /* continue */
        }
      }
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        body: message,
        segment: segment ?? "all",
        sentCount,
        sentAt: sentCount > 0 ? new Date() : null,
        createdBy: session!.user!.email ?? "admin",
      },
    });

    await logAdminAction({
      adminId: session!.user!.id,
      adminEmail: session!.user!.email ?? "",
      adminRole: (session!.user as { role?: string }).role ?? "",
      action: "BROADCAST",
      entity: "Announcement",
      entityId: announcement.id,
      metadata: { segment, sentCount, recipientCount: recipients.length },
      ipAddress: getClientIp(request),
    });

    return jsonResponse(announcement, undefined, 201);
  }
);
