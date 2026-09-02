import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

interface AuditEvent {
  action: string;
  entityType: string;
  entityId?: string;
  actorRole?: string;
  details?: Record<string, unknown>;
}

export async function writeAuditLog(event: AuditEvent): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: event.action,
        entityType: event.entityType,
        entityId: event.entityId,
        actorRole: event.actorRole,
        details: event.details as Prisma.InputJsonValue | undefined,
      },
    });
  } catch {
    // Avoid blocking clinical workflows if audit persistence fails in MVP mode.
  }
}
