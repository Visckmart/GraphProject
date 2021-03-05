export default class ResponsibilityChain {
    constructor() {
        this._chain = []
    }

    addLink(procedure) {
        if(!this.isBlocked)
        {
            this._chain.push(procedure)
        }
    }

    clearChain() {
        this._chain = []
    }

    isBlocked = false
    addBlockingLink(procedure) {
        this._chain.push(procedure)
        this.isBlocked = true
    }

    call(...args) {
        let returnValues = []
        for(let procedure of this._chain) {
            returnValues.push(procedure(...args))
        }
        return returnValues
    }
    callBind(t, ...args) {
        let returnValues = []
        for(let procedure of this._chain) {
            returnValues.push(procedure.bind(t, ...args)())
        }
        return returnValues
    }
}