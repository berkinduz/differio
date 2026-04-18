export const SAMPLE_ORIGINAL = `function formatPrice(amount, currency) {
  const symbol = currency === "USD" ? "$" : "€";
  return symbol + amount.toFixed(2);
}

function applyDiscount(price, percent) {
  return price * (1 - percent / 100);
}

export { formatPrice, applyDiscount };`;

export const SAMPLE_MODIFIED = `function formatPrice(amount, currency = "USD") {
  const symbols = { USD: "$", EUR: "€", GBP: "£" };
  const symbol = symbols[currency] ?? currency;
  return \`\${symbol}\${amount.toFixed(2)}\`;
}

function applyDiscount(price, percent) {
  if (percent < 0 || percent > 100) throw new RangeError("percent out of range");
  return price * (1 - percent / 100);
}

export { formatPrice, applyDiscount };`;

export type DiffOp =
  | { type: "keep"; a: string; b: string; ai: number; bi: number }
  | { type: "del"; a: string; ai: number }
  | { type: "add"; b: string; bi: number };

export function diffLines(a: string, b: string): DiffOp[] {
  const A = a.split("\n");
  const B = b.split("\n");
  const n = A.length;
  const m = B.length;
  const dp: Int32Array[] = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      if (A[i] === B[j]) dp[i][j] = dp[i + 1][j + 1] + 1;
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const ops: DiffOp[] = [];
  let i = 0,
    j = 0;
  while (i < n && j < m) {
    if (A[i] === B[j]) {
      ops.push({ type: "keep", a: A[i], b: B[j], ai: i, bi: j });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ type: "del", a: A[i], ai: i });
      i++;
    } else {
      ops.push({ type: "add", b: B[j], bi: j });
      j++;
    }
  }
  while (i < n) {
    ops.push({ type: "del", a: A[i], ai: i });
    i++;
  }
  while (j < m) {
    ops.push({ type: "add", b: B[j], bi: j });
    j++;
  }
  return ops;
}

const KEYWORDS = new Set([
  "function", "const", "let", "var", "return", "if", "else", "for", "while",
  "import", "export", "from", "new", "throw", "class", "extends", "this",
  "true", "false", "null", "undefined", "typeof", "instanceof", "await", "async",
]);

export type Token = { t: "comment" | "string" | "num" | "kw" | "id" | "ws" | "punct"; v: string };

export function tokenize(line: string | null | undefined): Token[] {
  if (line == null) return [];
  const tokens: Token[] = [];
  const re = /(\/\/.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][A-Za-z0-9_$]*)|(\s+)|([^\w\s])/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) {
    if (m[1]) tokens.push({ t: "comment", v: m[1] });
    else if (m[2]) tokens.push({ t: "string", v: m[2] });
    else if (m[3]) tokens.push({ t: "num", v: m[3] });
    else if (m[4]) tokens.push({ t: KEYWORDS.has(m[4]) ? "kw" : "id", v: m[4] });
    else if (m[5]) tokens.push({ t: "ws", v: m[5] });
    else if (m[6]) tokens.push({ t: "punct", v: m[6] });
  }
  return tokens;
}

export function detectLanguage(text: string): string {
  if (!text || text.trim().length < 8) return "auto";
  if (/^\s*{[\s\S]*}\s*$/.test(text) && /"\s*:\s*/.test(text)) return "json";
  if (/\b(function|const|let|=>|import|export)\b/.test(text) && /[;{}]/.test(text)) {
    if (/:\s*(string|number|boolean|void|any)\b/.test(text) || /interface\s+\w/.test(text)) return "typescript";
    return "javascript";
  }
  if (/^\s*#\s*\w/.test(text) || /^\s*-\s*\w/.test(text)) return "markdown";
  if (/\b(SELECT|FROM|WHERE|JOIN|INSERT)\b/i.test(text)) return "sql";
  if (/^\s*(def|import|class)\s+\w/m.test(text)) return "python";
  if (/^[\w-]+:\s/m.test(text)) return "yaml";
  return "text";
}
