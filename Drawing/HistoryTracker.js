export default class HistoryTracker {
    steps = [];
    cursor = -1;

    registerStep(newStep) {
        this.cursor += 1;
        this.steps.push(newStep)
    }

    goToStep(relativePosition) {
        this.cursor += relativePosition;
        this.cursor = Math.min(Math.max(this.cursor, 0), this.steps.length-1)
        return this.steps[this.cursor];
    }
}