// PreToolUse フック: ガバナンスファイルへのAI書き込みをブロックする
// Edit / Write ツールが実行される直前に呼ばれる
// exit(2) でブロック、exit(0) で通過

const PROTECTED = [
  /\.clauderules$/,
  /CLAUDE\.md$/,
  /official[/\\][^/\\]+[/\\]components\.json$/,
  /official[/\\][^/\\]+[/\\]tailwind\.config\.ts$/,
  /official[/\\][^/\\]+[/\\]tsconfig\.json$/,
  /official[/\\]HANDOVER\.md$/,
  // スキル・エージェント定義（セキュリティ審査が必要）
  /\.claude[/\\]commands[/\\].+\.md$/,
  /\.claude[/\\]agents[/\\].+\.md$/,
];

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

  const normalized = filePath.replace(/\\/g, "/");
  const blocked = PROTECTED.some((pattern) => pattern.test(normalized));

  if (blocked) {
    const isSkillOrAgent =
      /\.claude[/\\](commands|agents)[/\\]/.test(normalized);
    console.error("─────────────────────────────────────────────");
    console.error("[ガバナンスファイル保護] 書き込みをブロックしました");
    console.error(`対象: ${filePath}`);
    console.error("");
    if (isSkillOrAgent) {
      console.error("スキル・エージェントファイルはセキュリティ審査が必要です。");
      console.error("追加・変更の際は以下を確認してください:");
      console.error("  1. 外部通信（curl/fetch/http）の指示が含まれていないか");
      console.error("  2. ファイル削除・破壊的操作の指示が含まれていないか");
      console.error("  3. CLAUDE.md など既存ルールを無効化する指示がないか");
      console.error("  4. agents/ の tools: に Bash など実行系ツールがないか");
    } else {
      console.error("このファイルはコンポーネントレビュアーのレビューとPRが必要です。");
    }
    console.error("変更が必要な場合は feature/ ブランチを作成し、PRを通じて行ってください。");
    console.error("─────────────────────────────────────────────");
    process.exit(2);
  }

  process.exit(0);
});
