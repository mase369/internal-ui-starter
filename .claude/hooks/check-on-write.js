// PostToolUse フック: ファイル書き込み直後に .clauderules 準拠チェックを実行
// 違反があれば Claude のコンテキストに注入され、即時自己修正を促す

const path = require("path");
const { checkFile } = require("./check-clauderules");

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => (raw += chunk));
process.stdin.on("end", () => {
  let filePath = "";
  try {
    const input = JSON.parse(raw);
    filePath = input.tool_input?.file_path ?? "";
  } catch {
    process.exit(0);
  }

  // official/ 配下の .ts/.tsx のみ対象
  const normalized = filePath.replace(/\\/g, "/");
  if (!normalized.includes("official/") || !/\.(tsx?|jsx?)$/.test(filePath)) {
    process.exit(0);
  }

  const violations = checkFile(filePath);
  if (violations.length === 0) {
    process.exit(0);
  }

  const rel = path.relative(process.cwd(), filePath).replace(/\\/g, "/");
  console.log(`\n[.clauderules チェック] ${rel} に違反が見つかりました:`);
  violations.forEach((v) => console.log(`  • ${v}`));
  console.log("上記を修正してから次のステップに進んでください。");

  process.exit(0); // exit(0) = 警告のみ。Claudeのコンテキストに載せて修正を促す
});
