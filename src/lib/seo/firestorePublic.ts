type FirestoreValue =
  | { stringValue: string }
  | { integerValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { timestampValue: string }
  | { mapValue: { fields?: Record<string, FirestoreValue> } }
  | { arrayValue: { values?: FirestoreValue[] } }
  | { nullValue: null };

type FirestoreDocument = {
  name: string;
  fields?: Record<string, FirestoreValue>;
  createTime?: string;
  updateTime?: string;
};

function decodeValue(v: FirestoreValue | undefined): unknown {
  if (!v) return undefined;
  if ("stringValue" in v) return v.stringValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue;
  if ("booleanValue" in v) return v.booleanValue;
  if ("timestampValue" in v) return v.timestampValue;
  if ("nullValue" in v) return null;
  if ("mapValue" in v) {
    const out: Record<string, unknown> = {};
    const f = v.mapValue.fields || {};
    for (const [k, vv] of Object.entries(f)) out[k] = decodeValue(vv);
    return out;
  }
  if ("arrayValue" in v) return (v.arrayValue.values || []).map(decodeValue);
  return undefined;
}

function docIdFromName(name: string) {
  const bits = name.split("/");
  return bits[bits.length - 1] || name;
}

function requireProjectId() {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) throw new Error("Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  return projectId;
}

export async function fetchFirestoreDoc<T extends Record<string, unknown>>(collection: string, id: string) {
  const projectId = requireProjectId();
  const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
    projectId,
  )}/databases/(default)/documents/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`;

  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return null;
  const doc = (await res.json()) as FirestoreDocument;
  const fields = doc.fields || {};
  const data: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) data[k] = decodeValue(v);
  return { id: docIdFromName(doc.name), data: data as T, updateTime: doc.updateTime || null };
}

export async function listFirestoreDocs<T extends Record<string, unknown>>(
  collection: string,
  opts?: { pageSize?: number; pageToken?: string },
): Promise<{ docs: Array<{ id: string; data: T; updateTime: string | null }>; nextPageToken: string | null }> {
  const projectId = requireProjectId();
  const u = new URL(
    `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/${encodeURIComponent(
      collection,
    )}`,
  );
  if (opts?.pageSize) u.searchParams.set("pageSize", String(opts.pageSize));
  if (opts?.pageToken) u.searchParams.set("pageToken", opts.pageToken);

  const res = await fetch(u.toString(), { next: { revalidate: 600 } });
  if (!res.ok) throw new Error(`Failed to list ${collection}: ${res.status}`);
  const json = (await res.json()) as { documents?: FirestoreDocument[]; nextPageToken?: string };
  const docs = (json.documents || []).map((doc) => {
    const fields = doc.fields || {};
    const data: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(fields)) data[k] = decodeValue(v);
    return { id: docIdFromName(doc.name), data: data as T, updateTime: doc.updateTime || null };
  });
  return { docs, nextPageToken: json.nextPageToken || null };
}

