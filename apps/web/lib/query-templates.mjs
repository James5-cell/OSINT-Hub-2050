export function buildQueryTemplates(subject, context = "", domain = "", intent = "person") {
  const clean = value => String(value).replace(/["“”\n\r]/g, " ").trim().replace(/\s+/g, " ");
  const name = clean(subject), extra = clean(context);
  if (!name) return [];
  const phrase = `"${name}"`, base = `${phrase}${extra ? ` "${extra}"` : ""}`;
  const host = String(domain).trim().replace(/^https?:\/\//i, "").replace(/\/$/, "");
  const validHost = /^(?:[a-z0-9-]+\.)+[a-z]{2,}$/i.test(host);
  return [
    { id: "exact", query: base },
    ...(validHost ? [{ id: "site", query: `${base} site:${host.toLowerCase()}` }] : []),
    ...(["company", "document", "academic", "news", "person"].includes(intent) ? [{ id: "document", query: `${base} filetype:pdf` }] : []),
  ];
}
