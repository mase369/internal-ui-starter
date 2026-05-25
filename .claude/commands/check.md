現在の official/ プロジェクトに対して以下のチェックを手動で実行してください。

対象プロジェクト: $ARGUMENTS（省略した場合は変更ファイルから自動検出）

実行するチェック:
1. CLAUDE.md 準拠チェック（裸の button タグ / style={{}} / any 型 / console.log）
2. TypeScript 型チェック（npm run type-check）
3. ESLint チェック（npm run lint:strict）

チェック結果を一覧で報告し、問題があれば修正してください。
すべて通過した場合は「全チェック通過」と報告してください。
