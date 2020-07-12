# Faveslist

Spotify faveslist helper, for Mac.

[https://fs.thisadrian.vercel.app](https://fs.thisadrian.vercel.app)

## Setup

You'll need a Spotify developer account and a new project. 

https://developer.spotify.com/


**Redirect URI**

Faveslist uses OAuth to connect to Spotify. In the final stage of the OAuth procedure, Spotify will need to redirect back to the app using the Redirect URI. It's basically a link from the web to the native app.

In the project settings in Spotify, set a Redirect URI to match this app's default protocol client. 

For example, in the project I created for this app, I set the redirect URI to `faveslist://`. And then in the client itself I registered the protocol [like this](https://github.com/thisadrian/faveslist-spotify/blob/960605e073c0783fe68c0c109ad9aa827913218d/src/background.js#L37)

Read about Spotify app [redirect URI's](https://developer.spotify.com/documentation/general/guides/app-settings/)

Read about Electron's [setAsDefaultProtocolClient](https://www.electronjs.org/docs/api/app#appsetasdefaultprotocolclientprotocol-path-args)


**API key**

Create two json files in a config directory, one for each environment. 

`confg/env_development.json` 

`confg/env_production.json` 

Add your id and secret using the following format:


```

{
  "name": "lowercase env name",
  "CLIENT_ID": "YOU ID HERE",
  "CLIENT_SECRET": "YOUR SECRET HERE"
}

```

The two files are reduntant, because Spotify only issues one key, but this respects the original setup of the electron boilerplate. Probably I should change this though...


## Development

`npm start`

## Build

`npm run release`
