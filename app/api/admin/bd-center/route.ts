import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/db";

const normalizeValue = (value: unknown): string | null => {
  if (value === undefined || value === null) return null;
  if (typeof value === "string") return value.trim();
  return String(value).trim();
};

const normalizeHeader = (value: string) => value.replace(/^\uFEFF/, "").toLowerCase().replace(/[^a-z0-9]/g, "");

const getField = (row: Record<string, unknown>, keys: string[]) => {
  const normalizedRow = new Map(
    Object.entries(row).map(([key, value]) => [normalizeHeader(key), value]),
  );

  for (const key of keys) {
    const value = normalizedRow.get(normalizeHeader(key));
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return normalizeValue(value);
    }
  }
  return null;
};

const getFieldMatching = (row: Record<string, unknown>, keys: string[], pattern: RegExp) => {
  const directValue = getField(row, keys);
  if (directValue) return directValue;

  for (const [header, value] of Object.entries(row)) {
    const normalizedValue = normalizeValue(value);
    if (pattern.test(normalizeHeader(header)) && normalizedValue) return normalizedValue;
  }

  return null;
};

const combineFields = (row: Record<string, unknown>, keys: string[]) => {
  const values = keys.map((key) => getField(row, [key])).filter((value): value is string => Boolean(value));
  return values.length ? values.join(" ") : null;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const state = searchParams.get("state");
    const status = searchParams.get("status");
    const source = searchParams.get("source");
    const organization = searchParams.get("organization");
    const email = searchParams.get("email");
    const phone = searchParams.get("phone");

    const where: Record<string, unknown> = {};
    const andConditions: Record<string, unknown>[] = [];
    if (search) {
      andConditions.push({ OR: [
        { organizationName: { contains: search, mode: "insensitive" } },
        { contactName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { practiceAddress: { contains: search, mode: "insensitive" } },
      ] });
    }
    if (state && state !== "all") where.state = state;
    if (status && status !== "all") where.status = status;
    if (source && source !== "all") where.source = source;
    if (organization && organization !== "all") where.organizationName = organization;
    if (email === "present") where.email = { not: null };
    if (email === "missing") where.email = null;
    if (phone === "present") andConditions.push({ OR: [{ corporatePhone: { not: null } }, { companyPhone: { not: null } }, { phone: { not: null } }] });
    if (phone === "missing") andConditions.push({ corporatePhone: null, companyPhone: null, phone: null });
    if (andConditions.length) where.AND = andConditions;

    const contacts = await prisma.businessDevelopmentContact.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { messages: true },
    });

    return NextResponse.json({
      contacts: contacts.map((contact) => ({
        id: contact.id,
        source: contact.source,
        organizationName: contact.organizationName,
        contactName: contact.contactName,
        jobTitle: contact.jobTitle,
        email: contact.email,
        phone: contact.phone,
        corporatePhone: contact.corporatePhone,
        companyPhone: contact.companyPhone,
        practiceAddress: contact.practiceAddress,
        city: contact.city,
        state: contact.state,
        zipCode: contact.zipCode,
        country: contact.country,
        specialty: contact.specialty,
        organizationType: contact.organizationType,
        salutation: contact.salutation,
        tags: contact.tags,
        status: contact.status,
        notes: contact.notes,
        createdAt: contact.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("BD contact fetch failed:", error);
    return NextResponse.json({ error: "Unable to load BD contacts." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (request.headers.get("content-type")?.includes("application/json")) {
      const body = await request.json();
      const contactName = typeof body.contactName === "string" ? body.contactName.trim() : "";
      const organizationName = typeof body.organizationName === "string" ? body.organizationName.trim() : "";
      const email = typeof body.email === "string" ? body.email.trim() : "";

      if (!contactName && !organizationName && !email) {
        return NextResponse.json({ error: "Add a contact name, organization, or email." }, { status: 400 });
      }

      const contact = await prisma.businessDevelopmentContact.create({
        data: {
          source: typeof body.source === "string" && body.source.trim() ? body.source.trim() : "Manual entry",
          contactName: contactName || null,
          organizationName: organizationName || null,
          organizationType: typeof body.organizationType === "string" ? body.organizationType.trim() || null : null,
          jobTitle: typeof body.jobTitle === "string" ? body.jobTitle.trim() || null : null,
          email: email || null,
          phone: typeof body.phone === "string" ? body.phone.trim() || null : null,
          corporatePhone: typeof body.corporatePhone === "string" ? body.corporatePhone.trim() || null : null,
          companyPhone: typeof body.companyPhone === "string" ? body.companyPhone.trim() || null : null,
          practiceAddress: typeof body.practiceAddress === "string" ? body.practiceAddress.trim() || null : null,
          city: typeof body.city === "string" ? body.city.trim() || null : null,
          state: typeof body.state === "string" ? body.state.trim() || null : null,
          zipCode: typeof body.zipCode === "string" ? body.zipCode.trim() || null : null,
          country: typeof body.country === "string" ? body.country.trim() || null : null,
          specialty: typeof body.specialty === "string" ? body.specialty.trim() || null : null,
          salutation: body.salutation === "DOCTOR" || body.salutation === "NAME" ? body.salutation : null,
          notes: typeof body.notes === "string" ? body.notes.trim() || null : null,
          status: "NEW",
        },
      });

      return NextResponse.json({ contact, message: "Contact added." }, { status: 201 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "A CSV or Excel file is required." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { raw: false, defval: "" });
    const replaceExisting = formData.get("replaceExisting") === "true";
    const uploadNameValue = formData.get("uploadName");
    const uploadName = typeof uploadNameValue === "string" && uploadNameValue.trim() ? uploadNameValue.trim() : file.name;

    if (replaceExisting) {
      await prisma.businessDevelopmentContact.deleteMany();
    }

    let imported = 0;

    for (const row of rows) {
      const organizationName = getField(row, ["organizationName", "organization", "organizationName", "hospital", "hospitalName", "facility", "facilityName", "practice", "practiceName", "company", "companyName", "businessName", "name"]);
      const firstName = combineFields(row, ["firstName", "givenName", "contactFirstName"]);
      const lastName = combineFields(row, ["lastName", "surname", "familyName", "contactLastName"]);
      const contactName = getField(row, ["contactName", "contact", "person", "owner", "primaryContact", "fullName", "name"])
        ?? ([firstName, lastName].filter(Boolean).join(" ") || null);
      const jobTitle = getField(row, ["jobTitle", "title", "role", "position", "contactTitle"]);
      const email = getField(row, ["email", "emailAddress", "contactEmail", "primaryEmail", "workEmail"]);
      const corporatePhone = getFieldMatching(row, ["corporatePhone", "corporatePhoneNumber"], /^corporate(phone|telephonenumber|tel)/);
      const companyPhone = getFieldMatching(row, ["companyPhone", "companyPhoneNumber"], /^company(phone|telephonenumber|tel)/);
      const phone = corporatePhone ?? getFieldMatching(row, ["phone", "phoneNumber", "mobile", "mobilePhone", "contactPhone", "mainPhone", "officePhone", "directPhone", "telephone", "telephoneNumber", "businessPhone"], /(phone|telephone|tel|mobile|cell)/);
      const practiceAddress = getField(row, ["practiceAddress", "address", "fullAddress", "companyAddress", "companyLocation", "streetAddress", "street", "location", "addressLine1", "address1"])
        ?? combineFields(row, ["addressLine1", "address1", "streetAddress", "street"]);
      const addressLine2 = getField(row, ["addressLine2", "address2", "suite", "unit"]);
      const fullPracticeAddress = [practiceAddress, addressLine2].filter(Boolean).join(", ") || null;
      const city = getField(row, ["city", "practiceCity", "addressCity"]);
      const state = getField(row, ["state", "province", "region", "addressState"]);
      const zipCode = getField(row, ["zipCode", "postalCode", "zip", "postcode", "addressZip"]);
      const country = getField(row, ["country"]);
      const specialty = getField(row, ["specialty", "specialtyFocus", "serviceLine"]);
      const organizationType = getField(row, ["organizationType", "organizationCategory", "practiceType", "facilityType", "facilityCategory", "businessType", "type", "category", "industry", "subDepartments", "subDepartment"]);
      const notes = getField(row, ["notes", "remarks", "description"]);
      const salutationRaw = getField(row, ["salutation", "addressAs", "greeting", "titlePreference"])?.toLowerCase();
      const salutation = salutationRaw ? (/^dr/.test(salutationRaw) ? "DOCTOR" : /^name|first/.test(salutationRaw) ? "NAME" : null) : null;

      if (!organizationName && !contactName && !email) continue;

      const existingContact = email
        ? await prisma.businessDevelopmentContact.findFirst({
            where: {
              OR: [
                { email: { equals: email, mode: "insensitive" } },
                { organizationName: { equals: organizationName ?? "", mode: "insensitive" }, contactName: { equals: contactName ?? "", mode: "insensitive" } },
              ],
            },
          })
        : await prisma.businessDevelopmentContact.findFirst({
            where: {
              organizationName: organizationName ?? undefined,
              contactName: contactName ?? undefined,
            },
          });

      if (existingContact) {
        await prisma.businessDevelopmentContact.update({
          where: { id: existingContact.id },
          data: {
            organizationName: organizationName ?? existingContact.organizationName,
            contactName: contactName ?? existingContact.contactName,
            jobTitle: jobTitle ?? existingContact.jobTitle,
            email: email ?? existingContact.email,
            phone: phone ?? existingContact.phone,
            corporatePhone: corporatePhone ?? existingContact.corporatePhone,
            companyPhone: companyPhone ?? existingContact.companyPhone,
            practiceAddress: fullPracticeAddress ?? existingContact.practiceAddress,
            city: city ?? existingContact.city,
            state: state ?? existingContact.state,
            zipCode: zipCode ?? existingContact.zipCode,
            country: country ?? existingContact.country,
            specialty: specialty ?? existingContact.specialty,
            organizationType: organizationType ?? existingContact.organizationType,
            salutation: salutation ?? existingContact.salutation,
            notes: notes ?? existingContact.notes,
            source: uploadName,
            status: existingContact.status || "NEW",
          },
        });
      } else {
        await prisma.businessDevelopmentContact.create({
          data: {
            source: uploadName,
            organizationName: organizationName ?? null,
            contactName: contactName ?? null,
            jobTitle: jobTitle ?? null,
            email: email ?? null,
            phone: phone ?? null,
            corporatePhone: corporatePhone ?? null,
            companyPhone: companyPhone ?? null,
            practiceAddress: fullPracticeAddress,
            city: city ?? null,
            state: state ?? null,
            zipCode: zipCode ?? null,
            country: country ?? null,
            specialty: specialty ?? null,
            organizationType: organizationType ?? null,
            salutation: salutation ?? null,
            notes: notes ?? null,
            status: "NEW",
          },
        });
      }

      imported += 1;
    }

    return NextResponse.json({ imported, message: imported ? `${imported} contacts imported.` : "No recognizable contact rows were found. Use columns such as organization, contact name, email, phone, address, city, or state." });
  } catch (error) {
    console.error("BD contact upload failed:", error);
    return NextResponse.json({ error: "Unable to parse uploaded contact file." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const contactId = typeof body.contactId === "string" ? body.contactId : "";
    const contactIds = Array.isArray(body.contactIds) ? body.contactIds.filter((value: unknown): value is string => typeof value === "string") : undefined;
    const status = typeof body.status === "string" ? body.status : undefined;
    const notes = typeof body.notes === "string" ? body.notes : undefined;
    const salutation = body.salutation === "DOCTOR" || body.salutation === "NAME" || body.salutation === null ? body.salutation : undefined;
    const tags: string[] | undefined = Array.isArray(body.tags)
      ? body.tags.filter((value: unknown): value is string => typeof value === "string").map((value: string) => value.trim()).filter(Boolean)
      : undefined;

    if (!contactId && !contactIds?.length) {
      return NextResponse.json({ error: "A contact id is required." }, { status: 400 });
    }

    const data = {
      status: status !== undefined ? status : undefined,
      notes: notes !== undefined ? notes : undefined,
      salutation: salutation !== undefined ? salutation : undefined,
      tags: tags !== undefined ? Array.from(new Set(tags)) : undefined,
    };

    if (contactIds?.length) {
      await prisma.businessDevelopmentContact.updateMany({ where: { id: { in: contactIds } }, data });
      return NextResponse.json({ updated: contactIds.length });
    }

    const contact = await prisma.businessDevelopmentContact.update({
      where: { id: contactId },
      data,
    });

    return NextResponse.json({ contact });
  } catch (error) {
    console.error("BD contact status update failed:", error);
    return NextResponse.json({ error: "Unable to update contact status." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const contactIds = Array.isArray(body.contactIds)
      ? body.contactIds.filter((value: unknown): value is string => typeof value === "string" && value.trim().length > 0)
      : [];

    if (!contactIds.length) {
      return NextResponse.json({ error: "Select at least one contact to delete." }, { status: 400 });
    }

    const result = await prisma.businessDevelopmentContact.deleteMany({
      where: { id: { in: Array.from(new Set(contactIds)) } },
    });

    return NextResponse.json({ deleted: result.count });
  } catch (error) {
    console.error("BD contact deletion failed:", error);
    return NextResponse.json({ error: "Unable to delete contacts." }, { status: 500 });
  }
}
