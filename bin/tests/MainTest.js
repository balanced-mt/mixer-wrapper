"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const config = require("../../config/config.json");
class TestButton extends index_1.InteractiveButton {
    constructor() {
        super(...arguments);
        this.counter = 0;
    }
    onMouseDown(event, participant, beamControl) {
        this.counter++;
        this.text = "-> " + this.counter;
    }
}
class ChangeSceneButton extends index_1.InteractiveButton {
    constructor(wrapper, id, text, group) {
        super(wrapper, id, text);
        this.group = group;
    }
    onMouseDown(event, participant, beamControl) {
        participant.move(this.group);
    }
}
const wrapper = new index_1.InteractiveWrapper(config.interactiveOauth.access, config.interactiveId);
let testButton = new index_1.InteractiveButton(wrapper, "testButton", "Test buttons!");
testButton.sparkCost = 1;
wrapper.defaultScene.addControl(testButton, [
    { size: "large", width: 80, height: 4, x: 0, y: 0 },
    { size: "medium", width: 11, height: 4, x: 0, y: 0 },
    { size: "small", width: 7, height: 4, x: 0, y: 0 }
]);
testButton.onMouseUpEvent.addCallback((event, participant) => {
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
});
wrapper.onReady.addCallback(() => {
});
let chatWrapper = new index_1.ChatWrapper(config.channelId, config.botOauth.client_id, config.botOauth.access, config.botOauth.expires);
chatWrapper.onChatMessage.addCallback((msg) => {
    if (msg.text.toLowerCase() === "test") {
        chatWrapper.sendChatMessage("Yes we are testing");
    }
});
(() => __awaiter(this, void 0, void 0, function* () {
    yield wrapper.start();
    yield chatWrapper.start();
}))();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFpblRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zb3VyY2UvdGVzdHMvTWFpblRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLG9DQVVrQjtBQUVsQixNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsMEJBQTBCLENBQUMsQ0FBQztBQUVuRCxnQkFBaUIsU0FBUSx5QkFBaUI7SUFBMUM7O1FBQ0MsWUFBTyxHQUFXLENBQUMsQ0FBQztJQUtyQixDQUFDO0lBSkEsV0FBVyxDQUFDLEtBQWdDLEVBQUUsV0FBNEIsRUFBRSxXQUFvQjtRQUMvRixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDZixJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQ2xDLENBQUM7Q0FDRDtBQUVELHVCQUF3QixTQUFRLHlCQUFpQjtJQUdoRCxZQUFZLE9BQXVDLEVBQUUsRUFBVSxFQUFFLElBQVksRUFBRSxLQUF1QjtRQUNyRyxLQUFLLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN6QixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUNwQixDQUFDO0lBRUQsV0FBVyxDQUFDLEtBQWdDLEVBQUUsV0FBNEIsRUFBRSxXQUFvQjtRQUMvRixXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM5QixDQUFDO0NBQ0Q7QUFFRCxNQUFNLE9BQU8sR0FBRyxJQUFJLDBCQUFrQixDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBRTdGLElBQUksVUFBVSxHQUFHLElBQUkseUJBQWlCLENBQUMsT0FBTyxFQUFFLFlBQVksRUFBRSxlQUFlLENBQUMsQ0FBQztBQUMvRSxVQUFVLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztBQUN6QixPQUFPLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQ3pDO0lBQ0MsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7SUFDbkQsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7SUFDcEQsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7Q0FDbEQsQ0FDRCxDQUFDO0FBRUYsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxLQUFLLEVBQUUsV0FBVztJQUN4RCxXQUFXLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEdBQUcsbUJBQW1CLENBQUMsQ0FBQztJQUN4RSxVQUFVLENBQUMsV0FBVyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLGNBQWM7SUFDakQsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBRXZCOzs7Ozs7OztNQVFFO0FBQ0gsQ0FBQyxDQUFDLENBQUE7QUFFRixPQUFPLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQztBQUM1QixDQUFDLENBQUMsQ0FBQztBQUVILElBQUksV0FBVyxHQUFHLElBQUksbUJBQVcsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7QUFFaEksV0FBVyxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxHQUFHO0lBQ3pDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQztRQUN2QyxXQUFXLENBQUMsZUFBZSxDQUFDLG9CQUFvQixDQUFDLENBQUM7SUFDbkQsQ0FBQztBQUNGLENBQUMsQ0FBQyxDQUFDO0FBR0gsQ0FBQztJQUNBLE1BQU0sT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ3RCLE1BQU0sV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQzNCLENBQUMsQ0FBQSxDQUFDLEVBQUUsQ0FBQyJ9