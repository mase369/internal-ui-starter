# プロジェクト コーディングルール

このファイルは Claude Code によって自動的に読み込まれます。
このプロジェクトでは、社内 UI ワークスペースの official トラックとして以下のルールを守ってください。

## 技術スタック
- **フレームワーク**: Next.js (App Router)
- **スタイリング**: Tailwind CSS のみ。インラインスタイル（`style={{}}`）と独自 CSS ファイルは禁止
- **UIコンポーネント**: shadcn/ui。`<button>` タグ直書き禁止 → `<Button>` を使う
- **アイコン**: lucide-react
- **チャート**: recharts
- **データ取得**: BigQuery クエリは Server Component / server-side module で扱う

## 命名規則
| 対象 | 規則 | 例 |
|---|---|---|
| コンポーネントファイル | kebab-case | `metric-card.tsx` |
| コンポーネント関数 | PascalCase | `MetricCard` |
| 変数・関数 | camelCase | `fetchData` |
| 定数 | UPPER_SNAKE_CASE | `MAX_ITEMS` |

- private プロパティ・メソッドに `_` プレフィックス / サフィックスを付けない
- interface に `I` プレフィックスを付けない（`IFoo` → `Foo`）
- 省略語は広く知られているもの（`url`, `id`, `dns`）のみ許可。社内固有の略語は使わない

## エクスポート・インポート規約

- **named export のみ**使用する。`export default` は禁止
  - **例外**: Next.js の慣習ファイル（`page.tsx` / `layout.tsx` / `error.tsx` / `loading.tsx` / `not-found.tsx`）は `export default` 可
- `export let` 禁止（可変な export はデバッグを困難にする）
- 型のみ再エクスポートする場合は `export type { ... }` を使う
- 型のみ import する場合は `import type { ... }` を使う（値として使う場合は通常 import）

## カラーパレット（`tailwind.config.ts` に定義済み）
- プライマリ: `brand-blue`（#0f3460）
- アクセント: `brand-red`（#e94560）
- テキスト: `slate-900` / `slate-600`
- 背景: `slate-50`

## 余白
- Tailwind スペーシングスケールを使用（4の倍数が基本: `p-4`, `p-8` など）
- カード内: `p-4` または `p-6`
- セクション間: `gap-6` または `gap-8`

## コンポーネント使用ルール
既存の部品を優先して再利用すること。

| 用途 | 使用するもの |
|---|---|
| ボタン | `components/ui/button.tsx` |
| カード | `components/ui/card.tsx` |
| テーブル | `components/ui/table.tsx` |
| ページレイアウト | `components/templates/` 配下 |
| 業務固有パターン | `components/patterns/` 配下 |

新しいコンポーネントは `components/patterns/` に追加すること。
`components/ui/` 配下（shadcn/ui）はコンポーネントレビュアーの承認なしに編集しないこと。

## コード品質
- `any` 型は使用しない
- Props には必ず型定義を付ける
- 1ファイル1コンポーネントを基本とする
- `"use client"` は必要な箇所のみに付ける（デフォルトは Server Component）

## 型システム

- 型アサーション（`x as Foo`）と非 null アサーション（`y!`）は使用可だが、**理由コメント必須**
  ```ts
  // ○: ユーザー入力後なので null にならない
  inputRef.current!.focus();
  // ✗: コメントなし
  inputRef.current!.focus();
  ```
- オブジェクトリテラルの型指定は `as Foo` でなく `: Foo` アノテーションを使う
  ```ts
  // ○
  const opts: Options = { size: 10 };
  // ✗ リファクタ時にフィールド名の変更ミスを検出できない
  const opts = { size: 10 } as Options;
  ```
- ダブルアサーションが必要な場合は `as unknown as Foo`（`as any as Foo` は禁止）

## エラー処理

- 例外は必ず `new Error(...)` でインスタンス化して throw する
  ```ts
  // ○
  throw new Error('処理に失敗しました');
  // ✗ スタックトレースが残らない
  throw '処理に失敗しました';
  ```
- `catch` の型注釈は `catch (e: unknown)` とする（`catch (e: any)` 禁止）
- 空の `catch` ブロックには理由コメントを必ず記述する
- `try` ブロックは throw し得るコードのみに限定し、throw しないコードは外に出す

## 変数・制御構文

- 変数宣言は `const` を基本とし、再代入が必要な場合のみ `let` を使う。**`var` 禁止**
- 等価比較は `===` / `!==` を使う（`null` チェックのみ `==` / `!=` を例外として許可）
- `if` / `for` / `while` のブロックは必ず `{}` で囲む（本体が1行でも省略不可）
- `switch` 文には必ず `default` ケースを含める（空でも可）

## 禁止事項
- `style={{}}` のインラインスタイル
- `console.log` のコミット混入
- `debugger` ステートメントのコミット混入
- 環境変数を `.env` 以外にハードコード
- `components/ui/` の直接編集
- `CLAUDE.md` / `tailwind.config.ts` / `components.json` / `tsconfig.json` の直接変更
  （変更が必要な場合は feature/ ブランチで PR を提出すること）
- `eval` / `Function(...string)` の使用（CSP 違反・セキュリティリスク）
- `const enum`（`enum` を使う。`const enum` は isolated modules ビルドと非互換）
- `new String()` / `new Boolean()` / `new Number()` などのプリミティブラッパーオブジェクト
- `as any` による型キャスト（`as unknown as Foo` を使う）
- `var` による変数宣言（`const` / `let` を使う）
