import {
	InteractiveWrapper,
	InteractiveScene,
	InteractiveButton,
	InteractiveUser,
	InteractiveGroup,
	ChatWrapper,
	ClientWrapper,
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
// wrapper.enableLogging();

const newScene = new InteractiveScene(wrapper, "newScene", "newScene");
const newGroup = new InteractiveGroup(wrapper, newScene, "newScene");

let testButton = new InteractiveButton(wrapper, "testButton", "Test buttons!");
testButton.sparkCost = 1;
wrapper.defaultScene.addControl(testButton,
	[
		{ size: "large", width: 80, height: 4, x: 0, y: 0 },
		{ size: "medium", width: 11, height: 4, x: 0, y: 0 },
		{ size: "small", width: 7, height: 4, x: 0, y: 0 }
	]
);

testButton.onMouseUpEvent.addCallback((event, participant) => {
	chatWrapper.sendChatMessage(participant.username + " clicked a button");
	testButton.setCooldown(30 * 1000); // 30 secounds
	testButton.sparkCost++;

	/*
	Charging sparks

	Example:
	wrapper.client.captureTransaction(event.transactionID).then(()=>{
		// do something
	});
	
	*/
});

wrapper.defaultScene.addControl(new ChangeSceneButton(wrapper, "newSceneButton", "New Scene", newGroup),
	[
		{ size: "large", width: 80, height: 4, x: 0, y: 4 },
		{ size: "medium", width: 11, height: 4, x: 0, y: 4 },
		{ size: "small", width: 7, height: 4, x: 0, y: 4 }
	]);

wrapper.addScene(newScene);
wrapper.addGroup(newGroup);

let testButton2 = new InteractiveButton(wrapper, "testButton2", "Test buttons2!");
testButton2.sparkCost = 1;
testButton2.progress = 0.5;
testButton2.backgroundColor = "#220000";
testButton2.tooltip = "This is a tooltip!";
newScene.addControl(testButton2,
	[
		{ size: "large", width: 80, height: 4, x: 0, y: 4 },
		{ size: "medium", width: 11, height: 4, x: 0, y: 4 },
		{ size: "small", width: 7, height: 4, x: 0, y: 4 }
	]
);

testButton2.onMouseUpEvent.addCallback(/*async */(event, participant) => {
	chatWrapper.sendChatMessage(participant.username + " clicked a button");
	testButton2.setCooldown(10 * 1000); // 30 secounds
	testButton2.sparkCost++;
	/*await participant.move(wrapper.defaultGroup);
	await wrapper.removeGroup(newGroup);
	await wrapper.removeScene(newScene);
	await wrapper.addScene(newScene);
	await wrapper.addGroup(newGroup);*/
});

newScene.addControl(new ChangeSceneButton(wrapper, "backButton", "Back", wrapper.defaultGroup),
	[
		{ size: "large", width: 80, height: 4, x: 0, y: 8 },
		{ size: "medium", width: 11, height: 4, x: 0, y: 8 },
		{ size: "small", width: 7, height: 4, x: 0, y: 8 }
	]);

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

(async () => {
	await carina.start(config.channelId);
})();