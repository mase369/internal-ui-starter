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
    pattern: /\bvar\s+[a-zA-Z_$][\w$]*/g,
    message: "var による変数宣言（const または let を使用してください）",
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
  }
];

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

  return violations;
}

module.exports = { checkFile };
