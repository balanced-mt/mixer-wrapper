# mixer-wrapper
Wrapper for mixer's interactive, carina, REST api and chat bot.

WIP

# Examples

#### Carina (JavaScript)


```js
const MixerWrapper = require("mixer-wrapper");

const channelID = /*<channelID>*/;

const carina = new MixerWrapper.CarinaWrapper();
carina.onFollowEvent.addCallback((data) => {
	console.log("onFollowEvent", data.user.username);
});
carina.onUnfollowEvent.addCallback((data) => {
	console.log("onUnfollowEvent", data.user.username);
});

carina.onResubscribeEvent.addCallback((data) => {
	console.log("onResubscribeEvent", data.user.username);
});

carina.onSubscribeEvent.addCallback((data) => {
	console.log("onSubscribeEvent", data.user.username);
});

carina.onSubscribeShareEvent.addCallback((data) => {
	console.log("onSubscribeShareEvent", data.user.username);
});

carina.onHostEvent.addCallback((data) => {
	console.log("onHostEvent", data.hoster.token);
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
