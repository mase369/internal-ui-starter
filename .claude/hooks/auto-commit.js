// Stop フック: タスク完了時に全チェックを実行し、通過したら feature/ へ自動コミット
// exit(0) → 正常終了  exit(1) → Claudeに続行させてエラーを修正させる

const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { checkFile } = require("./check-clauderules");

const ROOT = path.resolve(__dirname, "../.."); // ワークスペースルート（C:\UI）

function run(cmd, cwd = ROOT) {
  return spawnSync(cmd, { shell: true, cwd, encoding: "utf8" });
}

function getChangedOfficialFiles() {
  const r1 = run("git diff --name-only");
  const r2 = run("git diff --cached --name-only");
  if (r1.error) return null; // git 未初期化
  return [
    ...(r1.stdout || "").split("\n"),
    ...(r2.stdout || "").split("\n"),
  ]
    .map((f) => f.trim())
    .filter((f) => f.startsWith("official/") && /\.(tsx?|jsx?)$/.test(f))
    .filter((v, i, a) => a.indexOf(v) === i); // dedupe
}

function detectProject(files) {
  const m = files[0]?.match(/^official\/([^/]+)\//);
  return m ? m[1] : null;
}

function branchName(projectName) {
  const date = new Date().toISOString().slice(0, 10);
  return `feature/${projectName}-${date}`;
}

function autoCommit(projectName, changedFiles) {
  const branch = branchName(projectName);

  // ブランチが存在しなければ作成、あれば切り替え
  const exists = run(`git rev-parse --verify ${branch}`);
  if (exists.status !== 0) {
    run(`git checkout -b ${branch}`);
  } else {
    run(`git checkout ${branch}`);
  }

  run("git add official/");

  const ts = new Date().toLocaleString("ja-JP", { hour12: false });
  
  // 変更ファイル一覧を含めた詳細なコミットメッセージを作成
  const subject = `feat(${projectName}): AI生成コード 自動コミット [${ts}]`;
  const body = `Changed files:\n${changedFiles.map((f) => `- ${f}`).join("\n")}`;
  const commitMsg = `${subject}\n\n${body}`;

  // 一時ファイルにコミットメッセージを書き出してコミット (Windowsシェル対策)
  const tempMsgFile = path.join(ROOT, ".git-commit-msg-tmp.txt");
  fs.writeFileSync(tempMsgFile, commitMsg, "utf8");

  const commitResult = run(`git commit -F "${tempMsgFile}"`);
  
  // 一時ファイルのクリーンアップ
  if (fs.existsSync(tempMsgFile)) {
    try {
      fs.unlinkSync(tempMsgFile);
    } catch (e) {
      // ignore
    }
  }

  return commitResult;
}

// ── メイン ──────────────────────────────────────────────
let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  // git が使えるか確認
  const gitStatus = run("git status --porcelain");
  if (gitStatus.error || gitStatus.status !== 0) {
    process.exit(0); // git 未初期化なら何もしない
  }

  const changedFiles = getChangedOfficialFiles();
  if (!changedFiles || changedFiles.length === 0) {
    process.exit(0); // official/ に変更なし → 何もしない
  }

  const projectName = detectProject(changedFiles);
  if (!projectName) { process.exit(0); }

  const projectDir = path.join(ROOT, "official", projectName);
  if (!fs.existsSync(projectDir)) { process.exit(0); }

  const SEP = "─".repeat(52);
  console.log(`\n${SEP}`);
  console.log(`[自動チェック] ${projectName}（${changedFiles.length} ファイル）`);
  console.log(SEP);

  const errors = [];

  // 1. .clauderules 準拠チェック
  changedFiles.forEach((f) => {
    const violations = checkFile(path.join(ROOT, f));
    if (violations.length > 0) {
      errors.push(`\n[.clauderules] ${f}`);
      violations.forEach((v) => errors.push(`  • ${v}`));
    }
  });

  // 2. TypeScript チェック
  if (fs.existsSync(path.join(projectDir, "node_modules"))) {
    process.stdout.write("TypeScript チェック中... ");
    const tsc = run("npm run type-check", projectDir);
    if (tsc.status !== 0) {
      process.stdout.write("❌\n");
      errors.push("\n[TypeScript]");
      errors.push((tsc.stdout + tsc.stderr).trim().slice(0, 800));
    } else {
      process.stdout.write("✅\n");
    }
  }

  // 3. ESLint チェック
  const nextBin = path.join(projectDir, "node_modules", ".bin", "next");
  if (fs.existsSync(nextBin)) {
    process.stdout.write("ESLint チェック中... ");
    const lint = run("npm run lint -- --max-warnings=0", projectDir);
    if (lint.status !== 0) {
      process.stdout.write("❌\n");
      errors.push("\n[ESLint]");
      errors.push((lint.stdout + lint.stderr).trim().slice(0, 800));
    } else {
      process.stdout.write("✅\n");
    }
  }

  if (errors.length > 0) {
    console.log(`\n${SEP}`);
    console.log("❌ チェック失敗 — 以下を修正してください:");
    console.log(SEP);
    errors.forEach((e) => console.log(e));
    process.exit(1); // Claude に続行させて修正させる
  }

  // 全チェック通過 → 自動コミット
  console.log(`\n✅ 全チェック通過`);
  const result = autoCommit(projectName, changedFiles);

  if (result.status === 0) {
    console.log(`✅ feature/${projectName}-* ブランチへ自動コミットしました`);
    console.log("次のステップ: git diff で差分を確認し、PR を作成してください");
  } else if (/nothing to commit/.test(result.stdout + result.stderr)) {
    console.log("コミット対象の変更がありませんでした（既にステージ済みの可能性）");
  } else {
    console.log("コミット中にエラーが発生しました:");
    console.log(result.stderr);
  }

  process.exit(0);
});
