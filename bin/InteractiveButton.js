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
        /**
         * Event called when viewer presses a button.
         */
        this.onMouseDownEvent = new Event_1.Event();
        /**
         * Event called when viewer releases a button.
         */
        this.onMouseUpEvent = new Event_1.Event();
        this._lastClick = -1;
        this.text = text;
    }
    /**
     * [Property] Text displayed on the button
     *
     * This variable automatically propagates to the server.
     */
    get text() {
        return this._text;
    }
    set text(text) {
        if (this._text !== text) {
            this._text = text;
            this.markDirty(InteractiveControl_1.ControlVariableFlags.Text);
        }
    }
    /**
     * [Property] Disabled state - Buttons which are disabled cannot be interacted with
     *
     * This variable automatically propagates to the server.
     */
    get disabled() {
        return this._disabled;
    }
    set disabled(value) {
        if (this._disabled !== value) {
            this._disabled = value;
            this.markDirty(InteractiveControl_1.ControlVariableFlags.Disabled);
        }
    }
    /**
     * [Property] Spark cost
     *
     * This variable automatically propagates to the server.
     */
    get sparkCost() {
        return this._sparkCost;
    }
    set sparkCost(sparkCost) {
        if (this._sparkCost !== sparkCost) {
            this._sparkCost = sparkCost;
            this.markDirty(InteractiveControl_1.ControlVariableFlags.SparkCost);
        }
    }
    /**
     * [Property] Progress of the progress bar which is displayed at the bottom of a button
     *
     * This variable automatically propagates to the server.
     */
    get progress() {
        return this._sparkCost;
    }
    set progress(progress) {
        progress = progress || 0;
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
    // TODO remove
    /**
     * @Deprecated Look at InteractiveButton.progress
     */
    getProgress() {
        return this._progress;
    }
    /**
     * @Deprecated Look at InteractiveButton.progress
     */
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
    /**
     * Returns the current cooldown.
     *
     * Cooldown prevents interaction until it expires
     */
    getCooldown() {
        return this._cooldown - this.wrapper.now;
    }
    /**
     * Sets the cooldown, if there is another cooldown already active it will pick the highest one.
     *
     * Optional force parameter will force the cooldown.
     *
     * Marks Cooldown as dirty when needed.
     */
    setCooldown(cooldown, force) {
        let time = this.wrapper.now + cooldown;
        if (force || this._cooldown === undefined || time > this._cooldown) {
            this._cooldown = time;
            this.markDirty(InteractiveControl_1.ControlVariableFlags.Cooldown);
        }
    }
    /**
     * [Property] Force cooldown check
     *
     * Force cooldown check will enforce the cooldowns on this end.
     */
    get forceCooldownCheck() {
        return this._forceCooldown;
    }
    /**
     * [Property] Force cooldown check.
     *
     * Force cooldown check will enforce the cooldowns on this end.
     */
    set forceCooldownCheck(forceCooldown) {
        this._forceCooldown = (forceCooldown == true);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW50ZXJhY3RpdmVCdXR0b24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zb3VyY2UvSW50ZXJhY3RpdmVCdXR0b24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFVQSw2REFBZ0Y7QUFHaEYsZ0RBQTZDO0FBRzdDLHVCQUErQixTQUFRLHVDQUF3QztJQVM5RSxZQUFZLE9BQXVDLEVBQUUsRUFBVSxFQUFFLElBQVk7UUFDNUUsS0FBSyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztRQVBaLGVBQVUsR0FBdUIsU0FBUyxDQUFDO1FBQ3pDLGNBQVMsR0FBdUIsU0FBUyxDQUFDO1FBQzFDLGNBQVMsR0FBdUIsU0FBUyxDQUFDO1FBQzVDLGNBQVMsR0FBWSxLQUFLLENBQUM7UUFDM0IsbUJBQWMsR0FBWSxJQUFJLENBQUM7UUFnSnZDOztXQUVHO1FBQ0gscUJBQWdCLEdBQTBHLElBQUksYUFBSyxFQUFPLENBQUM7UUFFM0k7O1dBRUc7UUFDSCxtQkFBYyxHQUEwRyxJQUFJLGFBQUssRUFBTyxDQUFDO1FBRWpJLGVBQVUsR0FBVyxDQUFDLENBQUMsQ0FBQztRQXRKL0IsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDbEIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxJQUFJLElBQUk7UUFDUCxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztJQUNuQixDQUFDO0lBRUQsSUFBSSxJQUFJLENBQUMsSUFBWTtRQUNwQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDekIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7WUFDbEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyx5Q0FBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzQyxDQUFDO0lBQ0YsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxJQUFJLFFBQVE7UUFDWCxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUN2QixDQUFDO0lBRUQsSUFBSSxRQUFRLENBQUMsS0FBYztRQUMxQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDOUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7WUFDdkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyx5Q0FBb0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMvQyxDQUFDO0lBQ0YsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxJQUFJLFNBQVM7UUFDWixNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUN4QixDQUFDO0lBRUQsSUFBSSxTQUFTLENBQUMsU0FBNkI7UUFDMUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ25DLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO1lBQzVCLElBQUksQ0FBQyxTQUFTLENBQUMseUNBQW9CLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDaEQsQ0FBQztJQUNGLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsSUFBSSxRQUFRO1FBQ1gsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7SUFDeEIsQ0FBQztJQUVELElBQUksUUFBUSxDQUFDLFFBQTRCO1FBQ3hDLFFBQVEsR0FBRyxRQUFRLElBQUksQ0FBQyxDQUFDO1FBQ3pCLEVBQUUsQ0FBQyxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLFFBQVEsR0FBRyxHQUFHLENBQUM7UUFDaEIsQ0FBQztRQUNELEVBQUUsQ0FBQyxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLFFBQVEsR0FBRyxHQUFHLENBQUM7UUFDaEIsQ0FBQztRQUNELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNqQyxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztZQUMxQixJQUFJLENBQUMsU0FBUyxDQUFDLHlDQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQy9DLENBQUM7SUFDRixDQUFDO0lBRUQsY0FBYztJQUNkOztPQUVHO0lBQ0gsV0FBVztRQUNWLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQ3ZCLENBQUM7SUFFRDs7T0FFRztJQUNILFdBQVcsQ0FBQyxRQUFnQjtRQUMzQixFQUFFLENBQUMsQ0FBQyxRQUFRLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNwQixRQUFRLEdBQUcsR0FBRyxDQUFDO1FBQ2hCLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxRQUFRLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNwQixRQUFRLEdBQUcsR0FBRyxDQUFDO1FBQ2hCLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDakMsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7WUFDMUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyx5Q0FBb0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMvQyxDQUFDO0lBQ0YsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxXQUFXO1FBQ1YsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUM7SUFDMUMsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNILFdBQVcsQ0FBQyxRQUFnQixFQUFFLEtBQWU7UUFDNUMsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDO1FBQ3ZDLEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLFNBQVMsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDcEUsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7WUFDdEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyx5Q0FBb0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMvQyxDQUFDO0lBQ0YsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxJQUFJLGtCQUFrQjtRQUNyQixNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQztJQUM1QixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILElBQUksa0JBQWtCLENBQUMsYUFBc0I7UUFDNUMsSUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLGFBQWEsSUFBSSxJQUFJLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBYVMsV0FBVyxDQUFDLEtBQWdDLEVBQUUsV0FBNEIsRUFBRSxXQUFvQjtRQUN6RyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEUsTUFBTSxDQUFDO1FBQ1IsQ0FBQztRQUNELElBQUksQ0FBQyxVQUFVLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQztRQUNyQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDaEUsQ0FBQztJQUVTLFNBQVMsQ0FBQyxLQUFnQyxFQUFFLFdBQTRCLEVBQUUsV0FBb0I7UUFDdkcsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLFVBQVUsS0FBSyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUM5RyxNQUFNLENBQUM7UUFDUixDQUFDO1FBQ0QsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNyQixJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQzlELENBQUM7SUFFRCx3RUFBd0U7SUFFeEUsVUFBVSxDQUFDLEtBQXVCO1FBQ2pDLE1BQU0sQ0FBQyxHQUFHLEtBQUssQ0FBQyxFQUFFLElBQUksSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO0lBQ2pDLENBQUM7SUFFRCxPQUFPLENBQUMsS0FBdUIsRUFBRSxRQUEwQjtRQUMxRCxNQUFNLENBQWM7WUFDbkIsU0FBUyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDO1lBQ2pDLElBQUksRUFBRSxRQUFRO1lBQ2QsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO1lBQ2YsUUFBUSxFQUFFLFFBQVE7WUFDbEIsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVO1lBQ3JCLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUztZQUN4QixRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVM7U0FDeEIsQ0FBQztJQUNILENBQUM7SUFFRCxPQUFPLENBQUMsS0FBdUIsRUFBRSxXQUFvQjtRQUNwRCxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxXQUFXLENBQUMsQ0FBQztRQUNsQyxXQUFXLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDLFVBQVUsRUFBRSxXQUFXO1lBQ25ELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzdDLEVBQUUsQ0FBQyxDQUFDLElBQUksS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUN4QixJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDakQsQ0FBQztRQUNGLENBQUMsQ0FBQyxDQUFDO1FBQ0gsV0FBVyxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxVQUFVLEVBQUUsV0FBVztZQUNqRCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUM3QyxFQUFFLENBQUMsQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDeEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQy9DLENBQUM7UUFDRixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFFRCxTQUFTLENBQUMsS0FBdUI7UUFDaEMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN4QixDQUFDO0lBRVMsYUFBYSxDQUFDLFNBQWlCLEVBQUUsT0FBNEM7UUFDdEYsS0FBSyxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFeEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLEdBQUcseUNBQW9CLENBQUMsSUFBSSxDQUFDLEtBQUsseUNBQW9CLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUMzRSxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDeEQsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxHQUFHLHlDQUFvQixDQUFDLFNBQVMsQ0FBQyxLQUFLLHlDQUFvQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDckYsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO1FBQzdELENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBRyx5Q0FBb0IsQ0FBQyxRQUFRLENBQUMsS0FBSyx5Q0FBb0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ25GLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztRQUNoRSxDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLEdBQUcseUNBQW9CLENBQUMsUUFBUSxDQUFDLEtBQUsseUNBQW9CLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNuRixPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFDaEUsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxHQUFHLHlDQUFvQixDQUFDLFFBQVEsQ0FBQyxLQUFLLHlDQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDbkYsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1FBQ2hFLENBQUM7SUFDRixDQUFDO0NBQ0Q7QUEvT0QsOENBK09DIn0=