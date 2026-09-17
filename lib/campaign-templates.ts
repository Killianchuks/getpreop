/**
 * Predefined BD outreach campaign messages targeted at different contact segments.
 * Placeholders {{contactName}} and {{organizationName}} are rendered per-recipient when sent.
 */

export type ContactSegment = "NEW" | "AWAITING_REPLY" | "OPENED_NO_ACTION" | "ENGAGED";

export interface CampaignTemplate {
  id: string;
  label: string;
  description: string;
  targetSegment: ContactSegment | "ALL";
  subject: string;
  body: string;
}

const DEMO_LINK = "https://www.getpreop.com/book-demo";

export const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
  {
    id: "cold_intro",
    label: "Cold introduction",
    description: "First-touch outreach to contacts who have never been emailed.",
    targetSegment: "NEW",
    subject: "Introduction to GetPreOp partnership",
    body: "Hello {{contactName}},\n\nMy name is Dr. Jessica Onwudiwe, a licensed anesthesiologist trained at the University of Chicago and the founder of GetPreOp.\n\nI help surgical centers improve pre-operative readiness and coordination, reducing same-day surgery cancellations, avoidable delays, and incomplete workups. I came across {{organizationName}} and thought this might be relevant to your team.\n\nWould you be open to a brief 10-15-minute conversation to see if there is an opportunity to support your pre-op workflow?\n\nYou can view my availability and book a 15-minute demo directly here:\n" + DEMO_LINK + "\n\nBest,\nDr Jessica Onwudiwe, MD\nFounder, GetPreOp",
  },
  {
    id: "opened_no_action",
    label: "Opened, no action yet",
    description: "For contacts who opened a previous message but haven't booked a demo or replied.",
    targetSegment: "OPENED_NO_ACTION",
    subject: "Still interested in reducing day-of-surgery cancellations?",
    body: "Hello {{contactName}},\n\nI noticed you had a chance to look over my last note about GetPreOp and wanted to follow up directly.\n\nA lot of teams tell us the easiest next step is just seeing the platform live, so I set aside time on my calendar for a quick, no-pressure walkthrough. It only takes 15 minutes and you can pick whatever time works best for {{organizationName}}:\n\n" + DEMO_LINK + "\n\nIf now isn't the right time, no worries at all \u2014 just let me know and I'll follow up later.\n\nBest,\nDr Jessica Onwudiwe, MD\nFounder, GetPreOp",
  },
  {
    id: "awaiting_reply",
    label: "Sent, not yet opened",
    description: "A bumped subject line for contacts who haven't opened the original outreach.",
    targetSegment: "AWAITING_REPLY",
    subject: "Following up: pre-operative readiness for {{organizationName}}",
    body: "Hello {{contactName}},\n\nJust making sure my earlier note made it to your inbox. I'm Dr. Jessica Onwudiwe, an anesthesiologist and founder of GetPreOp \u2014 we help surgical teams cut same-day cancellations with virtual pre-op optimization.\n\nIf you're open to it, here's a link to book a quick 15-minute demo at a time that works for you:\n" + DEMO_LINK + "\n\nBest,\nDr Jessica Onwudiwe, MD\nFounder, GetPreOp",
  },
  {
    id: "re_engagement",
    label: "Re-engagement / check-in",
    description: "For qualified or previously engaged contacts to check back in and offer a demo refresher.",
    targetSegment: "ENGAGED",
    subject: "Checking back in, {{contactName}}",
    body: "Hello {{contactName}},\n\nIt's been a little while since we last connected about GetPreOp and {{organizationName}}. I wanted to check in and see how things are going on your end.\n\nIf it would help, I'm happy to hop on a quick call or walk through what's new on the platform. You can grab time directly here:\n" + DEMO_LINK + "\n\nBest,\nDr Jessica Onwudiwe, MD\nFounder, GetPreOp",
  },
];

export function getCampaignTemplate(id: string): CampaignTemplate | undefined {
  return CAMPAIGN_TEMPLATES.find((campaign) => campaign.id === id);
}
