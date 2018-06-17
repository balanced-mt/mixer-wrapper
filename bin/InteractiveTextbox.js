"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const InteractiveControl_1 = require("./InteractiveControl");
const Event_1 = require("./common/utils/Event");
/*
    TODO
    submitText?: string;
    hasSubmit?: boolean;
    multiline?: boolean;
*/
class InteractiveTextbox extends InteractiveControl_1.InteractiveControl {
    constructor(wrapper, id, submit = false) {
        super(wrapper, id);
        this._sparkCost = undefined;
        this._cooldown = undefined;
        this._disabled = false;
        this._forceCooldown = true;
        this.onChangeEvent = new Event_1.Event();
        this.onSubmitEvent = new Event_1.Event();
        this._lastClick = -1;
        this._submit = submit;
    }
    /**
     * [Property] Placeholder text
     *
     * This variable automatically propagates to the server.
     */
    get placeholder() {
        return this._placeholder;
    }
    set placeholder(placeholder) {
        if (this._placeholder !== placeholder) {
            this._placeholder = placeholder;
            this.markDirty(InteractiveControl_1.ControlVariableFlags.Placeholder);
        }
    }
    /**
     * [Property] Disabled state - Textboxes which are disabled cannot be interacted with
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
    onChange(event, participant, beamControl) {
        if (this._disabled) {
            return;
        }
        this._lastClick = participant.userID;
        this.onChangeEvent.execute(event, participant, beamControl);
    }
    onSubmit(event, participant, beamControl) {
        if (this._disabled) {
            return;
        }
        this._lastClick = -1;
        this.onSubmitEvent.execute(event, participant, beamControl);
    }
    /**********************************************************************/
    getSceneID(scene) {
        return `${scene.id}_${this.id}`;
    }
    getData(scene, position) {
        let id = this.getSceneID(scene);
        return {
            controlID: this.getSceneID(scene),
            kind: 'textbox',
            placeholder: this._placeholder,
            position: position,
            cost: this._sparkCost,
            cooldown: this._cooldown,
            disabled: this._disabled,
            hasSubmit: this._submit,
        };
    }
    onAdded(scene, beamControl) {
        super.onAdded(scene, beamControl);
        beamControl.on("change", (inputEvent, participant) => {
            let user = this.wrapper.getUser(participant);
            if (user !== undefined) {
                this.onChange(inputEvent, user, beamControl);
            }
        });
        beamControl.on("submit", (inputEvent, participant) => {
            let user = this.wrapper.getUser(participant);
            if (user !== undefined) {
                this.onSubmit(inputEvent, user, beamControl);
            }
        });
    }
    onRemoved(scene) {
        super.onRemoved(scene);
    }
    gatherUpdates(dirtyBits, updates) {
        super.gatherUpdates(dirtyBits, updates);
        if ((dirtyBits & InteractiveControl_1.ControlVariableFlags.Placeholder) === InteractiveControl_1.ControlVariableFlags.Placeholder) {
            updates.push({ attribute: "placeholder", value: this._placeholder });
        }
        if ((dirtyBits & InteractiveControl_1.ControlVariableFlags.SparkCost) === InteractiveControl_1.ControlVariableFlags.SparkCost) {
            updates.push({ attribute: "cost", value: this._sparkCost });
        }
        if ((dirtyBits & InteractiveControl_1.ControlVariableFlags.Cooldown) === InteractiveControl_1.ControlVariableFlags.Cooldown) {
            updates.push({ attribute: "cooldown", value: this._cooldown });
        }
        if ((dirtyBits & InteractiveControl_1.ControlVariableFlags.Disabled) === InteractiveControl_1.ControlVariableFlags.Disabled) {
            updates.push({ attribute: "disabled", value: this._disabled });
        }
    }
}
exports.InteractiveTextbox = InteractiveTextbox;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW50ZXJhY3RpdmVUZXh0Ym94LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc291cmNlL0ludGVyYWN0aXZlVGV4dGJveC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQVVBLDZEQUFnRjtBQUdoRixnREFBNkM7QUFHN0M7Ozs7O0VBS0U7QUFDRix3QkFBZ0MsU0FBUSx1Q0FBMEM7SUFTakYsWUFBWSxPQUEyQixFQUFFLEVBQVUsRUFBRSxTQUFrQixLQUFLO1FBQzNFLEtBQUssQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFQWixlQUFVLEdBQXVCLFNBQVMsQ0FBQztRQUN6QyxjQUFTLEdBQXVCLFNBQVMsQ0FBQztRQUM1QyxjQUFTLEdBQVksS0FBSyxDQUFDO1FBQzNCLG1CQUFjLEdBQVksSUFBSSxDQUFDO1FBbUd2QyxrQkFBYSxHQUE0RyxJQUFJLGFBQUssRUFBTyxDQUFDO1FBRzFJLGtCQUFhLEdBQTRHLElBQUksYUFBSyxFQUFPLENBQUM7UUFFbEksZUFBVSxHQUFXLENBQUMsQ0FBQyxDQUFDO1FBbkcvQixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztJQUN2QixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILElBQUksV0FBVztRQUNkLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztJQUMxQixDQUFDO0lBRUQsSUFBSSxXQUFXLENBQUMsV0FBbUI7UUFDbEMsSUFBSSxJQUFJLENBQUMsWUFBWSxLQUFLLFdBQVcsRUFBRTtZQUN0QyxJQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQztZQUNoQyxJQUFJLENBQUMsU0FBUyxDQUFDLHlDQUFvQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBQ2pEO0lBQ0YsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxJQUFJLFFBQVE7UUFDWCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDdkIsQ0FBQztJQUVELElBQUksUUFBUSxDQUFDLEtBQWM7UUFDMUIsSUFBSSxJQUFJLENBQUMsU0FB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