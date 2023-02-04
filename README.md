# Spotify API

## Overview

[Spotify Web API](https://developer.spotify.com/documentation/web-api/reference) を使った OAuth 認証およびプレイリスト取得の Node.js サンプルアプリ


## Prepare

[ここ](https://dev.classmethod.jp/articles/about-using-of-spotify-api/) を参照して以下の手順で **Spotify for Developers** のダッシュボードにログイン後、アプリを登録し、`client_id` と `client_secret` を取得する。

また登録したアプリの `Redirect URIs` に `http://localhost:8080/spotify/callback` を登録する（実際にサービスを公開する場合は、公開先のコールバック URL も追加する）。

- Spotify アカウント取得

- [Spotify for Developers](https://developer.spotify.com/) にログイン

- `CREATE AN APP` から適当な名前を付けてアプリを登録する

- 登録したアプリを開き、`Client_ID` と `Client_Secret` の値を確認する

- 登録したアプリの `Redirect URIs` に `https://localhost:8080/spotify/callback` を追加する

- サンプルアプリを動かす PC に `git` と `Node.js` をインストールする


## How to run

- サンプルアプリのソースコードをダウンロード

  - `$ git clone https://github.com/dotnsf/spotify_api`

  - `$ cd spotify_api`

- `.env` ファイルをテキストエディタで開き、`SPOTIFY_CLIENT_ID` と `SPOTIFY_CLIENT_SECRET` に上で取得した `Client_ID` と `Client_Secret` の値をそれぞれ書き込んで保存する

```
SPOTIFY_CLIENT_ID=(Client_ID の値)
SPOTIFY_CLIENT_SECRET=(Client_Secret の値)
SPOTIFY_REDIRECT_URI=http://localhost:8080/spotify/callback
```

- ライブラリインストール

  - `$ npm install`

- 実行

  - `$ node app`

- 終了

  - 実行中のコンソールで `Ctrl + C` を入力


## How to use

- 上述の方法でアプリケーションを実行後に、ウェブブラウザで `http://localhost:8080` にアクセスする

- 画面右上の **ログイン** ボタンをクリックし、 Spotify の ID とパスワードで（OAuth で）認証する

- 再び（自動で） `http://locahost:8080` に戻ると、認証した時のユーザーのプレイリスト一覧が表示される。一覧から１つ選択すると、そのプレイリストが別ウィンドウが表示され、再生することもできる。


## アプリを公開する場合

- この方法で作ったアプリケーション（改良したものも含む）を開発者以外が使えるように公開する場合は以下の手順を実施する

  - Spotify for Developers のアプリ設定にて `Redirect_URIs` に公開版のリダイレクト URI を追加する

    - 例えば公開するアプリの URL が `https://spotify.abc.jp` の場合であれば `https://spotify.abc.jp/spotify/callback` を追加する

    - `.env` ファイル内の `SPOTIFY_REDIRECT_URI` の値に同じリダイレクト URI を設定する

  - 自分以外に **25** 人までこのアプリが使えるよう招待可能です。招待するには Spotify for Developers のアプリ画面で `Users and Access` から `ADD NEW USER` でユーザーを追加します。


## References

https://github.com/spotify/web-api-examples

https://dev.classmethod.jp/articles/about-using-of-spotify-api/

https://developer.spotify.com/documentation/web-api/reference/


## Licensing

This code is licensed under MIT.


## Copyright

2023 K.Kimura @ Juge.Me all rights reserved.

