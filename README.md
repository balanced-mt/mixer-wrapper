# mixer-wrapper
Wrapper for mixer's interactive, carina, REST api and chat bot.

WIP

## Mixer
Mixer is an interactive streaming platform. https://mixer.com/

## Examples

#### Carina (JavaScript)

```js
const MixerWrapper = require("mixer-wrapper");

const channelID = /*<channelID>*/;

const carina = new MixerWrapper.CarinaWrapper();
carina.onFollowEvent.addCallback((data) => {

carina.onSubscribeEvent.addCallback((data) => {
	console.log("onSubscribeEvent", data.user.username);
});

carina.onSubscribeShareEvent.addCallback((data) => {
	console.log("onSubscribeShareEvent", data.user.username);
});

carina.start(channelID);
```

#### Carina (TypeScript)

```ts
import {
	CarinaWrapper
} from "mixer-wrapper";

const channelID = /*<channelID>*/;

const carina = new CarinaWrapper();
carina.onFollowEvent.addCallback((data) => {
	console.log("onFollowEvent", data.user.username);
});
// ...
carina.start(channelID);
```
