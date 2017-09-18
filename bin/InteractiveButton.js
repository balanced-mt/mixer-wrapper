"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const InteractiveControl_1 = require("./InteractiveControl");
const Event_1 = require("./common/utils/Event");
class InteractiveButton extends InteractiveControl_1.InteractiveControl {
    constructor(wrapper, id, text) {
        super(wrapper, id);
        this._sparkCost = undefined;
        this._cooldown = undefined;
        this._progress = undefined;
        this._disabled = false;
        this._forceCooldown = true;
        this.onMouseDownEvent = new Event_1.Event();
        this.onMouseUpEvent = new Event_1.Event();
        this._lastClick = -1;
        this.text = text;
    }
    get text() {
        return this._text;
    }
    set text(text) {
        if (this._text !== text) {
            this._text = text;
            this.markDirty(InteractiveControl_1.ControlVariableFlags.Text);
        }
    }
    get disabled() {
        return this._disabled;
    }
    set disabled(value) {
        if (this._disabled !== value) {
            this._disabled = value;
            this.markDirty(InteractiveControl_1.ControlVariableFlags.Disabled);
        }
    }
    get sparkCost() {
        return this._sparkCost;
    }
    set sparkCost(sparkCost) {
        if (this._sparkCost !== sparkCost) {
            this._sparkCost = sparkCost;
            this.markDirty(InteractiveControl_1.ControlVariableFlags.SparkCost);
        }
    }
    setCooldown(cooldown, force) {
        let time = this.wrapper.now + cooldown;
        if (force || this._cooldown === undefined || time > this._cooldown) {
            this._cooldown = time;
            this.markDirty(InteractiveControl_1.ControlVariableFlags.Cooldown);
        }
    }
    getCooldown() {
        return this._cooldown - this.wrapper.now;
    }
    get forceCooldownCheck() {
        return this._forceCooldown;
    }
    set forceCooldownCheck(forceCooldown) {
        this._forceCooldown = (forceCooldown == true);
    }
    setProgress(progress) {
        if (progress < 0.0) {
            progress = 0.0;
        }
        if (progress > 1.0) {
            progress = 1.0;
        }
        if (this._progress !== progress) {
            this._progress = progress;
            this.markDirty(InteractiveControl_1.ControlVariableFlags.Progress);
        }
    }
    getProgress() {
        return this._progress;
    }
    onMouseDown(event, participant, beamControl) {
        if (this._forceCooldown && (this._cooldown - this.wrapper.now) > 1) {
            return;
        }
        this._lastClick = participant.userID;
        this.onMouseDownEvent.execute(event, participant, beamControl);
    }
    onMouseUp(event, participant, beamControl) {
        if (this._forceCooldown && (this._cooldown - this.wrapper.now) > 1 && this._lastClick !== participant.userID) {
            return;
        }
        this._lastClick = -1;
        this.onMouseUpEvent.execute(event, participant, beamControl);
    }
    /**********************************************************************/
    getSceneID(scene) {
        return `${scene.id}_${this.id}`;
    }
    getData(scene, position) {
        return {
            controlID: this.getSceneID(scene),
            kind: 'button',
            text: this.text,
            position: position,
            cost: this._sparkCost,
            cooldown: this._cooldown,
            disabled: this._disabled
        };
    }
    // TODO merge into dirty flag
    // TODO async
    /*private async internalChangeText(text: string) {
        for (var [key, beamControl] of this.activeControls) {
            await InteractiveControl.UpdateAttribute(beamControl, "text", text).then((result: any) => {
                console.log("result:");
                console.log(result);
            }).catch((error: any) => {
                console.log("error:");
                console.log(error);
            });
        };
        return true;
    }*/
    // TODO merge into dirty flag
    // TODO async
    /*private async internalChangeCooldown(time: number) {
        for (var [key, beamControl] of this.activeControls) {
            await InteractiveControl.UpdateAttribute(beamControl, "cooldown", time);
        }
        return true;
    }*/
    /*private async internalChangeCost(cost: number) {
        for (var [key, beamControl] of this.activeControls) {
            await InteractiveControl.UpdateAttribute(beamControl, "cost", cost);
        }
        return true;
    }*/
    onAdded(scene, beamControl) {
        super.onAdded(scene, beamControl);
        beamControl.on("mousedown", (inputEvent, participant) => {
            let user = this.wrapper.getUser(participant);
            if (user !== undefined) {
                this.onMouseDown(inputEvent, user, beamControl);
            }
        });
        beamControl.on("mouseup", (inputEvent, participant) => {
            let user = this.wrapper.getUser(participant);
            if (user !== undefined) {
                this.onMouseUp(inputEvent, user, beamControl);
            }
        });
    }
    onRemoved(scene) {
        super.onRemoved(scene);
    }
    gatherUpdates(dirtyBits, updates) {
        super.gatherUpdates(dirtyBits, updates);
        if ((dirtyBits & InteractiveControl_1.ControlVariableFlags.Text) === InteractiveControl_1.ControlVariableFlags.Text) {
            updates.push({ attribute: "text", value: this._text });
        }
        if ((dirtyBits & InteractiveControl_1.ControlVariableFlags.SparkCost) === InteractiveControl_1.ControlVariableFlags.SparkCost) {
            updates.push({ attribute: "cost", value: this._sparkCost });
        }
        if ((dirtyBits & InteractiveControl_1.ControlVariableFlags.Cooldown) === InteractiveControl_1.ControlVariableFlags.Cooldown) {
            updates.push({ attribute: "cooldown", value: this._cooldown });
        }
        if ((dirtyBits & InteractiveControl_1.ControlVariableFlags.Progress) === InteractiveControl_1.ControlVariableFlags.Progress) {
            updates.push({ attribute: "progress", value: this._progress });
        }
        if ((dirtyBits & InteractiveControl_1.ControlVariableFlags.Disabled) === InteractiveControl_1.ControlVariableFlags.Disabled) {
            updates.push({ attribute: "disabled", value: this._disabled });
        }
    }
}
exports.InteractiveButton = InteractiveButton;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW50ZXJhY3RpdmVCdXR0b24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zb3VyY2UvSW50ZXJhY3RpdmVCdXR0b24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFVQSw2REFBZ0Y7QUFHaEYsZ0RBQTZDO0FBRzdDLHVCQUErQixTQUFRLHVDQUF3QztJQVM5RSxZQUFZLE9BQXVDLEVBQUUsRUFBVSxFQUFFLElBQVk7UUFDNUUsS0FBSyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztRQVBaLGVBQVUsR0FBdUIsU0FBUyxDQUFDO1FBQ3pDLGNBQVMsR0FBdUIsU0FBUyxDQUFDO1FBQzFDLGNBQVMsR0FBdUIsU0FBUyxDQUFDO1FBQzVDLGNBQVMsR0FBWSxLQUFLLENBQUM7UUFDM0IsbUJBQWMsR0FBWSxJQUFJLENBQUM7UUE2RXZDLHFCQUFnQixHQUEwRyxJQUFJLGFBQUssRUFBTyxDQUFDO1FBQzNJLG1CQUFjLEdBQTBHLElBQUksYUFBSyxFQUFPLENBQUM7UUFFakksZUFBVSxHQUFXLENBQUMsQ0FBQyxDQUFDO1FBNUUvQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNsQixDQUFDO0lBRUQsSUFBSSxJQUFJO1FBQ1AsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDbkIsQ0FBQztJQUVELElBQUksSUFBSSxDQUFDLElBQVk7UUFDcEIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBQ2xCLElBQUksQ0FBQyxTQUFTLENBQUMseUNBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0MsQ0FBQztJQUNGLENBQUM7SUFFRCxJQUFJLFFBQVE7UUFDWCxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUN2QixDQUFDO0lBRUQsSUFBSSxRQUFRLENBQUMsS0FBYztRQUMxQixFQUFF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