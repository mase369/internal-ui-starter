mockup プロジェクトのコンポーネントを official の components/patterns/ に昇格させてください。

対象: $ARGUMENTS（例: mockup/20260601_xxx/public/index.html の売上グラフ部分）

昇格手順:
1. 対象のロジック・UIを特定して読み込む
2. CLAUDE.md のルールに従い TypeScript + shadcn/ui で書き直す
3. Props に型定義を付け、再利用可能な形に整える
4. components/patterns/{コンポーネント名}.tsx として保存する
5. 既存の components/patterns/ と重複・類似がないか確認する
6. 昇格したコンポーネントの使用例を簡潔に示す
