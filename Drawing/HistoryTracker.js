export default class HistoryTracker {
    // Lista de grafos com cada passo relevante
    steps = [];
    // Marcador do passo atual
    cursor = -1;

    // Avança o marcador e armazena um novo passo
    registerStep(newStep) {
        // Anda com o marcador
        this.cursor += 1;
        // Apaga todos os passos posteriores
        this.steps.splice(this.cursor);
        // Armazena o passo atual
        this.steps[this.cursor] = newStep.clone();
    }

    // Move o marcador como solicitado e retorna o conteúdo do passo
    goToStep(relativePosition) {
        // Anda com o marcador
        this.cursor += relativePosition;
        // Não permite o marcador sair dos limites
        let cursorEnd = this.steps.length-1;
        this.cursor = Math.min(Math.max(this.cursor, 0), cursorEnd)

        // Retorna o passo solicitado
        return this.steps[this.cursor].clone();
    }
}