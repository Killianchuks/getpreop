import { NextResponse } from "next/server";
import {
  assignCase,
  getCaseById,
  getDeliveryHours,
  getPayoutForCase,
  respondToCase,
  submitIntake,
  submitReport,
} from "@/lib/case-assignment-data";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = getCaseById(id);
  if (!record) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }
  return NextResponse.json({
    case: { ...record, payout: getPayoutForCase(record), deliveryHours: getDeliveryHours(record) },
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { action } = body;

  let record;
  switch (action) {
    case "assign":
      record = assignCase(id, body.doctorName);
      break;
    case "accept":
      record = respondToCase(id, true);
      break;
    case "decline":
      record = respondToCase(id, false);
      break;
    case "intake":
      record = submitIntake(id, body.intake);
      break;
    case "report":
      record = submitReport(id, body.report);
      break;
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  if (!record) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }
  return NextResponse.json({ case: record });
}
