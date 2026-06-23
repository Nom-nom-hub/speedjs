type Token = { text: string; type: string }

const KEYWORDS = new Set([
  'import', 'export', 'default', 'from', 'as',
  'function', 'const', 'let', 'var',
  'return', 'if', 'else', 'for', 'while', 'do',
  'switch', 'case', 'break', 'continue',
  'class', 'extends', 'new', 'this', 'super',
  'typeof', 'instanceof', 'void',
  'try', 'catch', 'finally', 'throw',
  'async', 'await', 'yield',
  'true', 'false', 'null', 'undefined',
  'in', 'of',
  'type', 'interface', 'implements',
  'keyof', 'readonly', 'enum',
  'declare', 'namespace', 'module',
  'is',
])

const JSX_BUILTINS = new Set([
  'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'a', 'button', 'input', 'textarea', 'select', 'option',
  'ul', 'ol', 'li', 'table', 'tr', 'td', 'th',
  'form', 'label', 'img', 'svg', 'path',
  'section', 'article', 'nav', 'header', 'footer', 'main',
  'aside', 'pre', 'code', 'br', 'hr',
  'style', 'link', 'script', 'meta',
])

const patterns: [RegExp, string][] = [
  [/\/\/.*$/, 'comment'],
  [/\/\*[\s\S]*?\*\//, 'comment'],
  [/`(?:[^`\\]|\\.)*`/, 'string'],
  [/'(?:[^'\\]|\\.)*'/, 'string'],
  [/"(?:[^"\\]|\\.)*"/, 'string'],
  [/<\/?[A-Z][a-zA-Z0-9]*(?:\s|>)/, 'jsx-component'],
  [/<\/?[a-z][a-zA-Z0-9]*(?:\s|>)/, 'jsx-tag'],
  [/<\/?[A-Z][a-zA-Z0-9]*>/, 'jsx-component'],
  [/<\/?[a-z][a-zA-Z0-9]*>/, 'jsx-tag'],
  [/\/>/, 'jsx-tag'],
  [/<\/[A-Z][a-zA-Z0-9]*>/, 'jsx-component'],
  [/<\/[a-z][a-zA-Z0-9]*>/, 'jsx-tag'],
  [/[a-zA-Z_$][a-zA-Z0-9_$]*(?=\s*:)/, 'ts-type'],
  [/(\bimport\b|\bexport\b|\bfrom\b|\bdefault\b|\bas\b)/, 'keyword'],
  [/\b(function|const|let|var|return|if|else|for|while|do|switch|case|break|continue)\b/, 'keyword'],
  [/\b(class|extends|new|this|super|typeof|instanceof|void|async|await|yield)\b/, 'keyword'],
  [/\b(true|false|null|undefined)\b/, 'keyword'],
  [/\b(type|interface|implements|keyof|readonly|enum|declare|namespace|module)\b/, 'keyword'],
  [/\b(in|of|is)\b/, 'keyword'],
  [/\b(try|catch|finally|throw)\b/, 'keyword'],
  [/\b\d+(?:\.\d+)?\b/, 'number'],
  [/=>/, 'arrow'],
  [/\{[0-9}]/, 'punctuation'],
  [/[{}()\[\],.;:]/, 'punctuation'],
  [/[a-zA-Z_$][a-zA-Z0-9_$]*/, 'identifier'],
]

export function highlightCode(code: string): { text: string; type: string }[] {
  const tokens: { text: string; type: string }[] = []
  let pos = 0

  while (pos < code.length) {
    const rest = code.slice(pos)
    let matched = false

    for (const [re, type] of patterns) {
      const m = re.exec(rest)
      if (m && m.index === 0) {
        tokens.push({ text: m[0], type })
        pos += m[0].length
        matched = true
        break
      }
    }

    if (!matched) {
      tokens.push({ text: code[pos], type: 'plain' })
      pos++
    }
  }

  return tokens
}

export function highlightHtml(code: string): string {
  const tokens = highlightCode(code)
  let html = ''
  for (const t of tokens) {
    if (t.type === 'plain') {
      html += escapeHtml(t.text)
    } else {
      html += `<span class="hl-${t.type}">${escapeHtml(t.text)}</span>`
    }
  }
  return html
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
