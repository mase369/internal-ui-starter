// .clauderules 準拠チェッカー（共有モジュール）
// check-on-write.js / auto-commit.js から require して使う

const fs = require("fs");
const path = require("path");

const RULES = [
  {
    pattern: /style=\{\{/g,
    message: "インラインスタイル (style={{}}) の使用",
  },
  {
    pattern: /<button[\s>/]/g,
    message: "裸の <button> タグの使用 → <Button> コンポーネントに変えてください",
  },
  {
    pattern: /:\s*any\b/g,
    message: "any 型の使用",
  },
  {
    pattern: /as\s+any\b/g,
    message: "as any の使用",
  },
  {
    pattern: /console\.log\(/g,
    message: "console.log の残留",
  },
  {
    pattern: /\bdebugger\b/g,
    message: "debugger ステートメントの残留",
  },
  {
    pattern: /\bvar\s+[a-zA-Z_$][\w$]*/g,
    message: "var による変数宣言（const または let を使用してください）",
  },
  {
    pattern: /\bexport\s+let\b/g,
    message: "export let の使用（可変な export は禁止）",
  },
  {
    pattern: /\bconst\s+enum\b/g,
    message: "const enum の使用（isolatedModules ビルドと互換性がないため通常の enum を使用してください）",
  },
  {
    pattern: /\bnew\s+(String|Number|Boolean)\(/g,
    message: "プリミティブラッパーオブジェクト（new String, new Number, new Boolean）の使用",
  },
  {
    pattern: /\beval\(/g,
    message: "eval() の使用（セキュリティおよびCSP違反リスク）",
  },
  {
    pattern: /\bnew\s+Function\(/g,
    message: "new Function() の使用（セキュリティリスク）",
  },
  {
    pattern: /catch\s*\(\s*[a-zA-Z_$][\w$]*\s*:\s*any\s*\)/g,
    message: "catch (e: any) の使用 → catch (e: unknown) にしてください",
  },
];

function pushLineViolations(violations, content, regex, message) {
  const lines = content.split(/\r?\n/);
  const lineNumbers = [];

  lines.forEach((line, index) => {
    if (regex.test(line)) {
      lineNumbers.push(index + 1);
    }
    regex.lastIndex = 0;
  });

  if (lineNumbers.length > 0) {
    violations.push(`${message}（${lineNumbers.length}箇所: ${lineNumbers.join(", ")}行目）`);
  }
}

function checkFile(filePath) {
  if (!fs.existsSync(filePath)) return [];
  if (!/\.(tsx?|jsx?)$/.test(filePath)) return [];

  const content = fs.readFileSync(filePath, "utf8");
  const violations = [];

  // 1. 正規表現ルールのチェック
  for (const rule of RULES) {
    const matches = [...content.matchAll(new RegExp(rule.pattern.source, "g"))];
    if (matches.length > 0) {
      violations.push(`${rule.message}（${matches.length}箇所）`);
    }
  }

  // 2. Next.js 慣習ファイル以外の export default チェック
  const basename = path.basename(filePath);
  const isConventionFile = /^(page|layout|error|loading|not-found)\.(tsx?|jsx?)$/.test(basename);
  if (!isConventionFile && /export\s+default\b/.test(content)) {
    violations.push("named export のみ使用してください。export default は Next.js 慣習ファイル以外では禁止されています。");
  }

  // 3. エイリアスパス (@/...) の推奨と相対インポートの禁止
  // 例: '../components/...', '../../lib/...'
  const relativeImportRegex = /from\s+['"]\.\.?\/.*(components|lib|app)\//g;
  const relativeMatches = [...content.matchAll(relativeImportRegex)];
  if (relativeMatches.length > 0) {
    violations.push(`エイリアスパス (@/...) を使用してください。相対パスによるインポートは禁止されています（${relativeMatches.length}箇所）`);
  }

  // 4. ルール文書にある追加規約の軽量チェック
  const equalityLines = [];
  content.split(/\r?\n/).forEach((line, index) => {
    const withoutAllowedNullChecks = line
      .replace(/[a-zA-Z_$][\w$.[\]?]*\s*==\s*null/g, "")
      .replace(/null\s*==\s*[a-zA-Z_$][\w$.[\]?]*/g, "")
      .replace(/[a-zA-Z_$][\w$.[\]?]*\s*!=\s*null/g, "")
      .replace(/null\s*!=\s*[a-zA-Z_$][\w$.[\]?]*/g, "");
    if (/(?:^|[^=!])==(?:[^=]|$)|!=(?:[^=]|$)/.test(withoutAllowedNullChecks)) {
      equalityLines.push(index + 1);
    }
  });
  if (equalityLines.length > 0) {
    violations.push(`等価比較は === / !== を使用してください（${equalityLines.length}箇所: ${equalityLines.join(", ")}行目）`);
  }
  pushLineViolations(
    violations,
    content,
    /\bimport\s+\{[^}]*\b[A-Z][A-Za-z0-9_]*(?:Props|Type|Data|Config|Options|Params|Result|Response)\b[^}]*\}\s+from\s+['"]/g,
    "型のみ import は import type を使用してください"
  );
  pushLineViolations(
    violations,
    content,
    /\bconst\s+[a-zA-Z_$][\w$]*\s*=\s*\{[^;]*\}\s+as\s+[A-Z][A-Za-z0-9_]*/g,
    "オブジェクトリテラルは as Foo ではなく : Foo で型指定してください"
  );
  pushLineViolations(
    violations,
    content,
    /\bthrow\s+(?!new\s+Error\s*\()/g,
    "throw は new Error(...) を使用してください"
  );

  return violations;
}

module.exports = { checkFile };
