export function formatINR(value: number) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `₹${Math.round(value)}`;
  }
}

export function toWhatsAppLink(phoneE164: string, message: string) {
  const text = encodeURIComponent(message);
  const phone = phoneE164.replace(/[^\d+]/g, "");
  const phoneDigits = phone.startsWith("+") ? phone.slice(1) : phone;
  return `https://wa.me/${phoneDigits}?text=${text}`;
}

export function asNumber(value: unknown) {
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : null;
}
