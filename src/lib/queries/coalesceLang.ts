export function coalesceLang(type: string, extraFilter?: string): string {
  const filter = extraFilter ? ` && ${extraFilter}` : "";
  return `coalesce(
    *[_type == "${type}"${filter} && language == $lang][0],
    *[_type == "${type}"${filter} && (language == "en" || !defined(language))][0]
  )`;
}
