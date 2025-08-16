- 応答、アプリ内テキスト、コード内コメントなどは全て英語で
- パッケージをインストールする際には、バージョンを固定する
  - `^` や `~` などの範囲指定は使用しない
  - package.json では厳密なバージョン指定（例：`"react": "19.1.1"`）を使用
  - 新規プロジェクト作成時や依存関係追加時は必ずバージョンを固定化
  - npm install 後は package.json を確認し、範囲指定があれば除去する
- ターミナルは PowerShell を使用
- 修正後は必ず `npm run test`, `npm run build` を実行し、エラーが出ていたら修正する
- テストを書く際は、テキストの細かい文言・座標・色などの変化しやすいものに依存しない
  - 「設定が空でないか？」「文字列が入っているか？」のように変わりにくい部分だけテストする
- Git の改行コード警告は無視する
  - `LF will be replaced by CRLF the next time Git touches it`

## ショートカットコマンド

- `--bg` → `in the background`
- `--par` → `in parallel`
