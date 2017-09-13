import {
	InteractiveWrapper,
	InteractiveScene,
	InteractiveButton,
	InteractiveUser,
	InteractiveGroup,
	ChatWrapper,
	IButton,
	IInputEvent,
	IButtonInput,
	CarinaWrapper
} from "../index";

const config = require("../../config/config.json");

class TestButton extends InteractiveButton {
	counter: number = 0;
	onMouseDown(event: IInputEvent<IButtonInput>, participant: InteractiveUser, beamControl: IButton) {
		this.counter++;
		this.text = "-> " + this.counter;
	}
}

class ChangeSceneButton extends InteractiveButton {
	group: InteractiveGroup;

	constructor(wrapper: InteractiveWrapper | undefined, id: string, text: string, group: InteractiveGroup) {
		super(wrapper, id, text);
		this.group = group;
	}

	onMouseDown(event: IInputEvent<IButtonInput>, participant: InteractiveUser, beamControl: IButton) {
		participant.move(this.group);
	}
}

const wrapper = new InteractiveWrapper(config.interactiveOauth.access, config.interactiveId);

let testButton = new InteractiveButton(wrapper, "testButton", "Test buttons!");
testButton.sparkCost = 1;
wrapper.defaultScene.addControl(testButton,
	[
		{ size: "large", width: 80, height: 4, x: 0, y: 0 },
		{ size: "medium", width: 11, height: 4, x: 0, y: 0 },
		{ size: "small", width: 7, height: 4, x: 0, y: 0 }
	]
);

testButton.onMouseUpEvent.addCallback((event, participant)=>{
	chatWrapper.sendChatMessage(participant.username + " clicked a button");
	testButton.setCooldown(10 * 1000); // 10 secounds
	testButton.sparkCost++;

	/*
	Charging sparks

	Example:
	wrapper.client.captureTransaction(event.transactionID).then(()=>{
		// do something
	});
	
	*/
})

wrapper.onReady.addCallback(() => {
});

let chatWrapper = new ChatWrapper(config.channelId, config.botOauth.client_id, config.botOauth.access, config.botOauth.expires);

chatWrapper.onChatMessage.addCallback((msg) => {
	if (msg.text.toLowerCase() === "test") {
		chatWrapper.sendChatMessage("Yes we are testing");
	}
});


(async () => {
	await wrapper.start();
	await chatWrapper.start();
})();

const carina = new CarinaWrapper();

carina.onFollowEvent.addCallback((data)=>{
	console.log("onFollowEvent", data.user.username);
});
carina.onUnfollowEvent.addCallback((data)=>{
	console.log("onUnfollowEvent", data.user.username);
});

carina.onResubscribeEvent.addCallback((data)=>{
	console.log("onResubscribeEvent", data.user.username);
});

carina.onSubscribeEvent.addCallback((data)=>{
	console.log("onSubscribeEvent", data.user.username);
});

carina.onSubscribeShareEvent.addCallback((data)=>{
	console.log("onSubscribeShareEvent", data.user.username);
});

carina.onHostEvent.addCallback((data)=>{
	console.log("onHostEvent", data.hoster.token);
});

(async () => {
	await carina.start(config.channelId);
})();