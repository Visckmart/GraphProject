export default class HistoryTracker {
    steps = [];
    cursor = -1;

    registerStep(newStep) {
        this.cursor += 1;
        this.steps.splice(this.cursor)
        this.steps[this.cursor] = newStep.clone();
        // console.log("Registered step", this.cursor)
    }

    goToStep(relativePosition) {
        this.cursor += relativePosition;
        this.cursor = Math.min(Math.max(this.cursor, 0), this.steps.length-1)
        // console.log("Going to step", this.cursor)
        return this.steps[this.cursor].clone();
    }
}