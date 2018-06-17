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
        // style
        this._backgroundColor = "#222222";
        this._textColor = "#FFFFFF";
        this._focusColor = "#444444";
        this._accentColor = "#AAAAAA";
        this._borderColor = "#666666";
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
     * [Property] Tooltip text
     *
     * This variable automatically propagates to the server.
     */
    get tooltip() {
        return this._tooltip;
    }
    set tooltip(tooltip) {
        if (this._tooltip !== tooltip) {
            // this._tooltip = tooltip;
            // this.markDirty(ControlVariableFlags.Tooltip);
        }
    }
    /**
     * [Property] Background color
     *
     * This variable automatically propagates to the server.
     */
    get backgroundColor() {
        return this._backgroundColor;
    }
    set backgroundColor(color) {
        if (this._backgroundColor !== color) {
            this._backgroundColor = color;
            this.markDirty(InteractiveControl_1.ControlVariableFlags.BackgroundColor);
        }
    }
    /**
     * [Property] Text color
     *
     * This variable automatically propagates to the server.
     */
    get textColor() {
        return this._textColor;
    }
    set textColor(color) {
        if (this._textColor !== color) {
            this._textColor = color;
            this.markDirty(InteractiveControl_1.ControlVariableFlags.TextColor);
        }
    }
    /**
     * [Property] Focus/hover color
     *
     * This variable automatically propagates to the server.
     */
    get focusColor() {
        return this._focusColor;
    }
    set focusColor(color) {
        if (this._focusColor !== color) {
            this._focusColor = color;
            this.markDirty(InteractiveControl_1.ControlVariableFlags.FocusColor);
        }
    }
    /**
     * [Property] Accent color (progressbar)
     *
     * This variable automatically propagates to the server.
     */
    get accentColor() {
        return this._accentColor;
    }
    set accentColor(color) {
        if (this._accentColor !== color) {
            this._accentColor = color;
            this.markDirty(InteractiveControl_1.ControlVariableFlags.AccentColor);
        }
    }
    /**
     * [Property] Border color
     *
     * This variable automatically propagates to the server.
     */
    get borderColor() {
        return this._borderColor;
    }
    set borderColor(color) {
        if (this._borderColor !== color) {
            this._borderColor = color;
            this.markDirty(InteractiveControl_1.ControlVariableFlags.BorderColor);
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
        if (this._disabled || (this._forceCooldown && (this._cooldown - this.wrapper.now) > 1)) {
            return;
        }
        this._lastClick = participant.userID;
        this.onMouseDownEvent.execute(event, participant, beamControl);
    }
    onMouseUp(event, participant, beamControl) {
        if (this._disabled || (this._forceCooldown && (this._cooldown - this.wrapper.now) > 1 && this._lastClick !== participant.userID)) {
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
            text: this._text,
            tooltip: this._tooltip,
            position: position,
            cost: this._sparkCost,
            cooldown: this._cooldown,
            progress: this._progress,
            disabled: this._disabled,
            backgroundColor: this._backgroundColor,
            textColor: this._textColor,
            focusColor: this._focusColor,
            accentColor: this._accentColor,
            borderColor: this._borderColor,
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
        if ((dirtyBits & InteractiveControl_1.ControlVariableFlags.Tooltip) === InteractiveControl_1.ControlVariableFlags.Tooltip) {
            updates.push({ attribute: "tooltip", value: this._tooltip });
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
        if ((dirtyBits & InteractiveControl_1.ControlVariableFlags.BackgroundColor) === InteractiveControl_1.ControlVariableFlags.BackgroundColor) {
            updates.push({ attribute: "backgroundColor", value: this._backgroundColor });
        }
        if ((dirtyBits & InteractiveControl_1.ControlVariableFlags.TextColor) === InteractiveControl_1.ControlVariableFlags.TextColor) {
            updates.push({ attribute: "textColor", value: this._textColor });
        }
        if ((dirtyBits & InteractiveControl_1.ControlVariableFlags.FocusColor) === InteractiveControl_1.ControlVariableFlags.FocusColor) {
            updates.push({ attribute: "focusColor", value: this._focusColor });
        }
        if ((dirtyBits & InteractiveControl_1.ControlVariableFlags.AccentColor) === InteractiveControl_1.ControlVariableFlags.AccentColor) {
            updates.push({ attribute: "accentColor", value: this._accentColor });
        }
        if ((dirtyBits & InteractiveControl_1.ControlVariableFlags.BorderColor) === InteractiveControl_1.ControlVariableFlags.BorderColor) {
            updates.push({ attribute: "borderColor", value: this._borderColor });
        }
    }
}
exports.InteractiveButton = InteractiveButton;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW50ZXJhY3RpdmVCdXR0b24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zb3VyY2UvSW50ZXJhY3RpdmVCdXR0b24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFVQSw2REFBZ0Y7QUFHaEYsZ0RBQTZDO0FBRzdDLHVCQUErQixTQUFRLHVDQUF3QztJQWlCOUUsWUFBWSxPQUF1QyxFQUFFLEVBQVUsRUFBRSxJQUFZO1FBQzVFLEtBQUssQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFkWixlQUFVLEdBQXVCLFNBQVMsQ0FBQztRQUN6QyxjQUFTLEdBQXVCLFNBQVMsQ0FBQztRQUMxQyxjQUFTLEdBQXVCLFNBQVMsQ0FBQztRQUM1QyxjQUFTLEdBQVksS0FBSyxDQUFDO1FBQzNCLG1CQUFjLEdBQVksSUFBSSxDQUFDO1FBRXZDLFFBQVE7UUFDQSxxQkFBZ0IsR0FBVyxTQUFTLENBQUM7UUFDckMsZUFBVSxHQUFXLFNBQVMsQ0FBQztRQUMvQixnQkFBVyxHQUFXLFNBQVMsQ0FBQztRQUNoQyxpQkFBWSxHQUFXLFNBQVMsQ0FBQztRQUNqQyxpQkFBWSxHQUFXLFNBQVMsQ0FBQztRQWlQekM7O1dBRUc7UUFDSCxxQkFBZ0IsR0FBMEcsSUFBSSxhQUFLLEVBQU8sQ0FBQztRQUUzSTs7V0FFRztRQUNILG1CQUFjLEdBQTBHLElBQUksYUFBSyxFQUFPLENBQUM7UUFFakksZUFBVSxHQUFXLENBQUMsQ0FBQyxDQUFDO1FBdlAvQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNsQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILElBQUksSUFBSTtRQUNQLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztJQUNuQixDQUFDO0lBRUQsSUFBSSxJQUFJLENBQUMsSUFBWTtRQUNwQixJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssSUFBSSxFQUFFO1lBQ3hCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBQ2xCLElBQUksQ0FB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LEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1NBQ3ZEO1FBRUQsSUFBSSxDQUFDLFNBQVMsR0FBRyx5Q0FBb0IsQ0FBQyxPQUFPLENBQUMsS0FBSyx5Q0FBb0IsQ0FBQyxPQUFPLEVBQUU7WUFDaEYsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1NBQzdEO1FBRUQsSUFBSSxDQUFDLFNBQVMsR0FBRyx5Q0FBb0IsQ0FBQyxTQUFTLENBQUMsS0FBSyx5Q0FBb0IsQ0FBQyxTQUFTLEVBQUU7WUFDcEYsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO1NBQzVEO1FBRUQsSUFBSSxDQUFDLFNBQVMsR0FBRyx5Q0FBb0IsQ0FBQyxRQUFRLENBQUMsS0FBSyx5Q0FBb0IsQ0FBQyxRQUFRLEVBQUU7WUFDbEYsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1NBQy9EO1FBRUQsSUFBSSxDQUFDLFNBQVMsR0FBRyx5Q0FBb0IsQ0FBQyxRQUFRLENBQUMsS0FBSyx5Q0FBb0IsQ0FBQyxRQUFRLEVBQUU7WUFDbEYsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1NBQy9EO1FBRUQsSUFBSSxDQUFDLFNBQVMsR0FBRyx5Q0FBb0IsQ0FBQyxRQUFRLENBQUMsS0FBSyx5Q0FBb0IsQ0FBQyxRQUFRLEVBQUU7WUFDbEYsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1NBQy9EO1FBRUQsSUFBSSxDQUFDLFNBQVMsR0FBRyx5Q0FBb0IsQ0FBQyxlQUFlLENBQUMsS0FBSyx5Q0FBb0IsQ0FBQyxlQUFlLEVBQUU7WUFDaEcsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLFNBQVMsRUFBRSxpQkFBaUIsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQztTQUM3RTtRQUVELElBQUksQ0FBQyxTQUFTLEdBQUcseUNBQW9CLENBQUMsU0FBUyxDQUFDLEtBQUsseUNBQW9CLENBQUMsU0FBUyxFQUFFO1lBQ3BGLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztTQUNqRTtRQUVELElBQUksQ0FBQyxTQUFTLEdBQUcseUNBQW9CLENBQUMsVUFBVSxDQUFDLEtBQUsseUNBQW9CLENBQUMsVUFBVSxFQUFFO1lBQ3RGLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztTQUNuRTtRQUVELElBQUksQ0FBQyxTQUFTLEdBQUcseUNBQW9CLENBQUMsV0FBVyxDQUFDLEtBQUsseUNBQW9CLENBQUMsV0FBVyxFQUFFO1lBQ3hGLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxTQUFTLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztTQUNyRTtRQUVELElBQUksQ0FBQyxTQUFTLEdBQUcseUNBQW9CLENBQUMsV0FBVyxDQUFDLEtBQUsseUNBQW9CLENBQUMsV0FBVyxFQUFFO1lBQ3hGLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxTQUFTLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztTQUNyRTtJQUNGLENBQUM7Q0FDRDtBQXhYRCw4Q0F3WEMifQ==