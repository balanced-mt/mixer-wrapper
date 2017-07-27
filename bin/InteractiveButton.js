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
        this.onMouseDownEvent = new Event_1.Event();
        this.onMouseUpEvent = new Event_1.Event();
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
        this.onMouseDownEvent.execute(event, participant, beamControl);
    }
    onMouseUp(event, participant, beamControl) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW50ZXJhY3RpdmVCdXR0b24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zb3VyY2UvSW50ZXJhY3RpdmVCdXR0b24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFVQSw2REFBZ0Y7QUFHaEYsZ0RBQTZDO0FBRzdDLHVCQUErQixTQUFRLHVDQUF3QztJQVE5RSxZQUFZLE9BQXVDLEVBQUUsRUFBVSxFQUFFLElBQVk7UUFDNUUsS0FBSyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztRQU5aLGVBQVUsR0FBdUIsU0FBUyxDQUFDO1FBQ3pDLGNBQVMsR0FBdUIsU0FBUyxDQUFDO1FBQzFDLGNBQVMsR0FBdUIsU0FBUyxDQUFDO1FBQzVDLGNBQVMsR0FBWSxLQUFLLENBQUM7UUFxRW5DLHFCQUFnQixHQUEwRyxJQUFJLGFBQUssRUFBTyxDQUFDO1FBQzNJLG1CQUFjLEdBQTBHLElBQUksYUFBSyxFQUFPLENBQUM7UUFsRXhJLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ2xCLENBQUM7SUFFRCxJQUFJLElBQUk7UUFDUCxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztJQUNuQixDQUFDO0lBRUQsSUFBSSxJQUFJLENBQUMsSUFBWTtRQUNwQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDekIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7WUFDbEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyx5Q0FBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzQyxDQUFDO0lBQ0YsQ0FBQztJQUVELElBQUksUUFBUTtRQUNYLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxJQUFJLFFBQVEsQ0FBQyxLQUFjO1FBQzFCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQztZQUM5QixJ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