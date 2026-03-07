export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function roomSlug(parts: { title: string; area?: string; genderAllowed?: string; rent?: number }) {
  const tokens = [
    parts.title,
    parts.area ? `in ${parts.area}` : "",
    parts.genderAllowed ? parts.genderAllowed : "",
    typeof parts.rent === "number" ? `₹${parts.rent}` : "",
    "Dharamshala",
  ]
    .filter(Boolean)
    .join(" ");
  return slugify(tokens);
}

export function itemSlug(parts: { title: string; category?: string; area?: string; price?: number }) {
  const tokens = [
    parts.title,
    parts.category ? parts.category : "",
    parts.area ? `in ${parts.area}` : "",
    typeof parts.price === "number" ? `₹${parts.price}` : "",
    "Dharamshala",
  ]
    .filter(Boolean)
    .join(" ");
  return slugify(tokens);
}

