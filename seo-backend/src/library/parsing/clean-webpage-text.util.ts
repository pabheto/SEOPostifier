export default function cleanWebContent(rawContent: string): string {
  let content = rawContent;

  // 1. Eliminar imágenes en Markdown y HTML
  content = content
    // Markdown images: ![alt](url)
    .replace(/!\[[^\]]*?\]\([^)]*?\)/g, '')
    // HTML img tags
    .replace(/<img[^>]*>/gi, '');

  // 2. Eliminar scripts, estilos y SVGs embebidos
  content = content
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '');

  // 3. Eliminar navegación, menús y CTAs comunes
  const NAVIGATION_PATTERNS = [
    /\[Skip to content.*?\]/gi,
    /\b(Home|About Us|Services|Products|Solutions|Industries|Careers|Pricing|Contact|Login|Sign Up)\b/gi,
    /\b(Subscribe|Newsletter|Free Trial|Get Started|Join Now|Download)\b/gi,
    /\b(Follow us|Share this|Read more|Click here)\b/gi,
  ];

  for (const pattern of NAVIGATION_PATTERNS) {
    content = content.replace(pattern, '');
  }

  // 4. Eliminar listas de navegación (muchos links seguidos)
  // Líneas con demasiados enlaces Markdown
  content = content.replace(/^(\s*[\*\-]\s*\[.*?\]\(.*?\)\s*){3,}$/gm, '');

  // 5. Eliminar Table of Contents completos
  const tocMatch = content.search(/table of contents|contents:/i);
  if (tocMatch !== -1) {
    const afterToc = content.indexOf('\n\n', tocMatch);
    if (afterToc !== -1) {
      content = content.slice(0, tocMatch) + content.slice(afterToc);
    }
  }

  // 6. Eliminar URLs de tracking y javascript links
  content = content
    .replace(/\(javascript:[^)]+\)/gi, '')
    .replace(/\?utm_[^)\s]+/gi, '');

  // 7. Normalizar espacios, saltos y líneas vacías
  content = content
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();

  return content;
}
