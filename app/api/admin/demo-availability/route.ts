import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendDeliverableEmail } from "@/lib/email-service";
import { buildDeliverableEmailLayout } from "@/lib/email-templates";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const futureOnly = searchParams.get("futureOnly") !== "false";

    const where: { date?: string; isBooked?: boolean } = {};
    if (date) {
      where.date = date;
    }

    const slots = await prisma.demoAvailabilitySlot.findMany({
      where,
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("Failed to load demo availability slots:", error);
    return NextResponse.json({ error: "Unable to load demo availability" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body.action || "save_slots";

    // 1. Admin save / update slots
    if (action === "save_slots") {
      const slots = Array.isArray(body.slots) ? body.slots : [];
      // slots: Array<{ date: string, time: string, isBooked?: boolean }>

      const date = typeof body.date === "string" ? body.date : null;

      if (date) {
        // Replace unbooked slots for a specific date
        await prisma.demoAvailabilitySlot.deleteMany({
          where: { date, isBooked: false },
        });

        if (slots.length > 0) {
          for (const slot of slots) {
            await prisma.demoAvailabilitySlot.upsert({
              where: { date_time: { date: slot.date, time: slot.time } },
              update: {},
              create: {
                date: slot.date,
                time: slot.time,
                durationMin: slot.durationMin || 15,
                isBooked: false,
              },
            });
          }
        }
      } else {
        // Upsert all provided slots
        for (const slot of slots) {
          if (slot.date && slot.time) {
            await prisma.demoAvailabilitySlot.upsert({
              where: { date_time: { date: slot.date, time: slot.time } },
              update: {},
              create: {
                date: slot.date,
                time: slot.time,
                durationMin: slot.durationMin || 15,
                isBooked: false,
              },
            });
          }
        }
      }

      return NextResponse.json({ success: true, message: "Availability slots saved." });
    }

    // 2. Admin recurring slots generator
    if (action === "apply_recurring") {
      const { startDate, endDate, days, times, replaceExisting } = body;
      if (!startDate || !endDate || !Array.isArray(days) || !Array.isArray(times)) {
        return NextResponse.json({ error: "Missing recurring schedule parameters." }, { status: 400 });
      }

      const weekdayMap: Record<string, number> = {
        Sun: 0,
        Mon: 1,
        Tue: 2,
        Wed: 3,
        Thu: 4,
        Fri: 5,
        Sat: 6,
      };

      // Clear stale unbooked slots left over from a prior generation so the new
      // day/time selection fully replaces the old one instead of merging with it.
      let removed = 0;
      if (replaceExisting) {
        const deleted = await prisma.demoAvailabilitySlot.deleteMany({
          where: { date: { gte: startDate, lte: endDate }, isBooked: false },
        });
        removed = deleted.count;
      }

      const targetDayIndices = new Set(days.map((d: string) => weekdayMap[d]).filter((d) => d !== undefined));
      const start = new Date(`${startDate}T12:00:00`);
      const end = new Date(`${endDate}T12:00:00`);
      let created = 0;

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dayIdx = d.getDay();
        if (targetDayIndices.has(dayIdx)) {
          const dateKey = d.toISOString().slice(0, 10);
          for (const time of times) {
            await prisma.demoAvailabilitySlot.upsert({
              where: { date_time: { date: dateKey, time } },
              update: {},
              create: {
                date: dateKey,
                time,
                durationMin: 15,
                isBooked: false,
              },
            });
            created++;
          }
        }
      }

      return NextResponse.json({
        success: true,
        count: created,
        removed,
        message: replaceExisting
          ? `Replaced availability in range: removed ${removed} old open slot(s), created ${created} new slot(s).`
          : `Created ${created} recurring slot(s).`,
      });
    }

    // 3. User / Partner Book a Slot
    if (action === "book_slot") {
      const { slotId, name, email, organization, notes } = body;
      if (!slotId || !name || !email) {
        return NextResponse.json({ error: "Please provide your name and email to confirm the booking." }, { status: 400 });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
        return NextResponse.json({ error: "Please provide a valid email address (e.g. name@company.com)." }, { status: 400 });
      }

      const slot = await prisma.demoAvailabilitySlot.findUnique({ where: { id: slotId } });
      if (!slot || slot.isBooked) {
        return NextResponse.json({ error: "This time slot is no longer available. Please choose another time." }, { status: 409 });
      }

      const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://www.getpreop.com").replace(/\/$/, "");
      const meetingUrl = `${appUrl}/book-demo/room/${slot.id}`;

      const updatedSlot = await prisma.demoAvailabilitySlot.update({
        where: { id: slotId },
        data: {
          isBooked: true,
          bookedByName: name.trim(),
          bookedByEmail: email.trim().toLowerCase(),
          bookedByOrg: organization ? organization.trim() : null,
          notes: notes ? notes.trim() : null,
          meetingUrl,
        },
      });

      const formattedDate = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date(`${slot.date}T12:00:00`));

      // Send confirmation email to the lead
      let confirmationEmailSent = true;
      try {
        const confirmationLayout = buildDeliverableEmailLayout({
          title: "Your GetPreOp Platform Demo is Confirmed",
          preheader: `Demo scheduled with Dr. Jessica Onwudiwe for ${formattedDate} at ${slot.time}.`,
          contentHtml: `
            <h2 style="font-size:18px;font-weight:700;color:#0f172a;margin-top:0;margin-bottom:12px;">Demo Confirmed</h2>
            <p style="margin:0 0 16px 0;">Hello <strong>${name}</strong>,</p>
            <p style="margin:0 0 16px 0;">Your 15-minute 1-on-1 walkthrough and demonstration of GetPreOp has been confirmed with <strong>Dr. Jessica Onwudiwe, MD</strong>.</p>
            
            <div style="background-color:#f0fdfa;border:1px solid #ccfbf1;border-radius:8px;padding:16px;margin:16px 0;">
              <table role="presentation" border="0" cellpadding="4" cellspacing="0" width="100%" style="font-size:14px;">
                <tr>
                  <td style="width:120px;color:#0f766e;font-weight:600;">Date:</td>
                  <td style="color:#0f172a;font-weight:700;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="color:#0f766e;font-weight:600;">Time:</td>
                  <td style="color:#0f172a;font-weight:700;">${slot.time} (US Central Time / CT)</td>
                </tr>
                <tr>
                  <td style="color:#0f766e;font-weight:600;">Host:</td>
                  <td style="color:#0f172a;">Dr. Jessica Onwudiwe, MD (Founder & CEO)</td>
                </tr>
                ${organization ? `<tr><td style="color:#0f766e;font-weight:600;">Organization:</td><td style="color:#0f172a;">${organization}</td></tr>` : ""}
              </table>
            </div>

            <p style="margin:20px 0 8px 0;">Join the video call at your scheduled time using the link below:</p>
            <p style="margin:0 0 16px 0;text-align:center;">
              <a href="${meetingUrl}" class="btn" style="display:inline-block;background-color:#0f766e;color:#ffffff !important;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600;font-size:14px;">Join Video Call</a>
            </p>
            <p style="margin:0 0 16px 0;font-size:12px;color:#64748b;word-break:break-all;">Or copy this link: ${meetingUrl}</p>

            <p style="margin:16px 0 0 0;">We look forward to connecting and discussing how GetPreOp reduces day-of-surgery cancellations and enhances pre-op readiness for your team.</p>
          `,
          contentText: `Hello ${name},\n\nYour 15-minute GetPreOp demo is confirmed for ${formattedDate} at ${slot.time} (CT) with Dr. Jessica Onwudiwe, MD.\n\nJoin the video call: ${meetingUrl}`,
          recipientEmail: email,
          showUnsubscribe: false,
          categoryNote: "This confirmation was generated from your GetPreOp demo request.",
        });

        const result = await sendDeliverableEmail({
          to: email,
          toName: name,
          subject: `Confirmed: GetPreOp Demo on ${formattedDate} at ${slot.time}`,
          html: confirmationLayout.html,
          text: confirmationLayout.text,
          category: "NOTIFICATION",
          metadata: { demoBookingId: slot.id, slotDate: slot.date, slotTime: slot.time },
        });
        confirmationEmailSent = result.success;
      } catch (emailErr) {
        confirmationEmailSent = false;
        console.error("Failed to dispatch demo confirmation email:", emailErr);
      }

      // Send new-booking alert email to the admin/host
      try {
        const adminEmail = (process.env.ADMIN_NOTIFICATION_EMAIL || process.env.MAILERSEND_REPLY_TO_EMAIL || "contact@getpreop.com").trim();
        const hostMeetingUrl = `${meetingUrl}?role=host`;

        const adminLayout = buildDeliverableEmailLayout({
          title: "New GetPreOp Demo Booked",
          preheader: `${name} booked a demo for ${formattedDate} at ${slot.time}.`,
          contentHtml: `
            <h2 style="font-size:18px;font-weight:700;color:#0f172a;margin-top:0;margin-bottom:12px;">New Demo Booking</h2>
            <p style="margin:0 0 16px 0;">A new demo walkthrough has been booked on the GetPreOp calendar.</p>

            <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:16px 0;">
              <table role="presentation" border="0" cellpadding="4" cellspacing="0" width="100%" style="font-size:14px;">
                <tr>
                  <td style="width:120px;color:#64748b;font-weight:600;">Name:</td>
                  <td style="color:#0f172a;font-weight:700;">${name}</td>
                </tr>
                <tr>
                  <td style="color:#64748b;font-weight:600;">Email:</td>
                  <td style="color:#0f172a;">${email}</td>
                </tr>
                ${organization ? `<tr><td style="color:#64748b;font-weight:600;">Organization:</td><td style="color:#0f172a;">${organization}</td></tr>` : ""}
                ${notes ? `<tr><td style="color:#64748b;font-weight:600;">Notes:</td><td style="color:#0f172a;">${notes}</td></tr>` : ""}
                <tr>
                  <td style="color:#64748b;font-weight:600;">Date:</td>
                  <td style="color:#0f172a;font-weight:700;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="color:#64748b;font-weight:600;">Time:</td>
                  <td style="color:#0f172a;font-weight:700;">${slot.time} (US Central Time / CT)</td>
                </tr>
              </table>
            </div>

            <p style="margin:20px 0 8px 0;">Join the video call as host using the link below:</p>
            <p style="margin:0 0 16px 0;text-align:center;">
              <a href="${hostMeetingUrl}" class="btn" style="display:inline-block;background-color:#0f766e;color:#ffffff !important;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600;font-size:14px;">Join as Host</a>
            </p>
            <p style="margin:0 0 0 0;font-size:12px;color:#64748b;word-break:break-all;">Or copy this link: ${hostMeetingUrl}</p>
          `,
          contentText: `New demo booking:\n\nName: ${name}\nEmail: ${email}\n${organization ? `Organization: ${organization}\n` : ""}${notes ? `Notes: ${notes}\n` : ""}Date: ${formattedDate}\nTime: ${slot.time} (CT)\n\nJoin as host: ${hostMeetingUrl}`,
          recipientEmail: adminEmail,
          showUnsubscribe: false,
          categoryNote: "This is an internal notification for a new GetPreOp demo booking.",
        });

        await sendDeliverableEmail({
          to: adminEmail,
          toName: "GetPreOp Team",
          subject: `New Demo Booked: ${name} on ${formattedDate} at ${slot.time}`,
          html: adminLayout.html,
          text: adminLayout.text,
          category: "NOTIFICATION",
          metadata: { demoBookingId: slot.id, slotDate: slot.date, slotTime: slot.time, leadEmail: email },
        });
      } catch (emailErr) {
        console.error("Failed to dispatch demo admin alert email:", emailErr);
      }

      return NextResponse.json({
        success: true,
        slot: updatedSlot,
        confirmationEmailSent,
        message: confirmationEmailSent
          ? "Demo scheduled successfully!"
          : "Demo scheduled, but we couldn't send the confirmation email to that address. Please double-check it and contact us if you don't hear back.",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error processing demo availability:", error);
    return NextResponse.json({ error: "Unable to process request" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : null;
    const date = typeof body.date === "string" ? body.date : null;

    if (id) {
      await prisma.demoAvailabilitySlot.delete({ where: { id } });
      return NextResponse.json({ success: true, message: "Slot deleted." });
    }

    if (date) {
      await prisma.demoAvailabilitySlot.deleteMany({ where: { date } });
      return NextResponse.json({ success: true, message: `All slots for ${date} deleted.` });
    }

    return NextResponse.json({ error: "Specify slot ID or date" }, { status: 400 });
  } catch (error) {
    console.error("Failed to delete demo slot:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
