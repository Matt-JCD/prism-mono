import { ORG_IMPORT_CONFIG } from "./config";

interface AttioRecord {
  id: { record_id: string };
  values: Record<string, Array<{ value?: string; first_name?: string; last_name?: string; original?: string }>>;
}

interface AttioQueryResponse {
  data: AttioRecord[];
  next_cursor?: string;
}

export interface ImportedPerson {
  attioId: string;
  name: string;
  role?: string;
  company?: string;
  email?: string;
  linkedinUrl?: string;
}

function getAttioHeaders(): HeadersInit {
  const apiKey = process.env.ATTIO_API_KEY;
  if (!apiKey) throw new Error("ATTIO_API_KEY is not set");
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

export async function fetchAttioAttributeDefinitions(): Promise<unknown[]> {
  const res = await fetch(`${ORG_IMPORT_CONFIG.attioApiBase}/objects/people/attributes`, {
    headers: getAttioHeaders(),
  });
  if (!res.ok) throw new Error(`Attio attributes fetch failed: ${res.status}`);
  const data = await res.json();
  return data.data || [];
}

export async function fetchAttioPeople(limit = 100): Promise<ImportedPerson[]> {
  const res = await fetch(`${ORG_IMPORT_CONFIG.attioApiBase}/objects/people/records/query`, {
    method: "POST",
    headers: getAttioHeaders(),
    body: JSON.stringify({ limit }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Attio query failed: ${res.status} ${text}`);
  }

  const json: AttioQueryResponse = await res.json();

  return json.data.map((record) => {
    const vals = record.values;
    const firstName = vals.first_name?.[0]?.first_name || "";
    const lastName = vals.last_name?.[0]?.last_name || "";
    const name = `${firstName} ${lastName}`.trim() || "Unknown";

    return {
      attioId: record.id.record_id,
      name,
      role: vals.job_title?.[0]?.value || undefined,
      company: vals.company?.[0]?.value || undefined,
      email: vals.email_addresses?.[0]?.original || undefined,
      linkedinUrl: vals.linkedin?.[0]?.value || undefined,
    };
  });
}
