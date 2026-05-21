const CYRILLIC_MAP: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh',
  з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
  п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts',
  ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu',
  я: 'ya',
  ә: 'a', ғ: 'g', қ: 'k', ң: 'n', ө: 'o', ұ: 'u', ү: 'u', һ: 'h', і: 'i',
}

export function slugifyHeading(input: string): string {
  let result = ''
  for (const char of input.toLowerCase()) {
    result += CYRILLIC_MAP[char] ?? char
  }
  return result
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function createHeadingIdAssigner(): (text: string) => string {
  let counter = 0
  const seen = new Map<string, number>()

  return (text: string): string => {
    counter++
    const base = slugifyHeading(text) || `section-${counter}`
    const prev = seen.get(base)
    if (prev === undefined) {
      seen.set(base, 1)
      return base
    }
    const next = prev + 1
    seen.set(base, next)
    return `${base}-${next}`
  }
}
