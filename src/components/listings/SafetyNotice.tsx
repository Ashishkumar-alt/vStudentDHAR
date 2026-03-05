export default function SafetyNotice({ context }: { context: "room" | "item" }) {
  const firstTip =
    context === "room"
      ? "Do not send money before visiting the room."
      : "Do not send money before inspecting the item.";

  const roleNoun = context === "room" ? "room owners" : "sellers";

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
      <div className="font-semibold">⚠ Safety Tips</div>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-amber-900/90">
        <li>{firstTip}</li>
        <li>Verify details before making any payment.</li>
        <li>vStudent only connects students and {roleNoun}.</li>
      </ul>
    </div>
  );
}

