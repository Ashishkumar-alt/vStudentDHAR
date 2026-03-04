import { updateDoc } from "firebase/firestore";
import { serverTimestamp } from "@/lib/firebase/db";
import { doc } from "firebase/firestore";
import { getDb } from "@/lib/firebase/db";
import type { ReportStatus } from "@/lib/firebase/models";

export async function setReportStatus(
  reportId: string,
  input: { status: ReportStatus; resolvedBy: string },
) {
  const ref = doc(getDb(), "reports", reportId);
  await updateDoc(ref, {
    status: input.status,
    resolvedBy: input.resolvedBy,
    resolvedAt: serverTimestamp(),
  });
}

