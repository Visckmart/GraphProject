# GraphProject
Exploração de algoritmos em grafos de forma didática.

## Estrutura
```Dictionary<Node : Dictionary<Node : Edge>>```

Dicionário cujas chaves são objetos da classe Node que por sua vez tem como valores dicionários cujas chaves são outros objetos da classe Node e os valores são objetos da classe Edge como na definição.
Isso funciona bem em JavaScript porque temos o conceito de Map e as chaves podem ser objetos.
A complexidade da estrutura de acordo com as operações mais frequentes é:
| Operação | Descrição | Complexidade
|---------|-|:-:|
Criar um nó       | coloca o objeto como chave e um dicionário vazio como valor |  O(1)  |
Criar uma aresta  | coloca no dicionário associado ao objeto que representa<br/>um dos nós uma chave com o objeto que representa o outro nó<br/>e o valor sendo o objeto que representa a aresta em questão | O(1)
Apagar um nó      | apaga a chave do nó e passa por todas as chaves apagando<br/>a chave do nó nos dicionários internos | O(\|V\|)
Apagar uma aresta | apaga a chave de um dos nós de dentro do dicionário interno<br/>do outro nó | O(1)
  
## Categorias
- Direção
    - [X] **Não-direcionado**
    - [ ] Direcionado
- Valor Associado
    - [X] **Nada**
    - [ ] Um em cada aresta (peso/custo)
    - [ ] Um em cada nó (peso/custo)
    - [ ] Dois em cada aresta (fluxo e capacidade máxima)
    - [ ] Dois em acada nó (fluxo e capacidade máxima)
- Cor
    - [X] **Em cada nó**
    - [ ] Em cada aresta
- Grupo
    - [X] **Nada**
    - [ ] Nós iniciais
    - [ ] Nós finais
    - [ ] Arestas iniciais
    - [ ] Arestas finais
    - [ ] *Bipartido (n-partido)?*
    - [ ] *Componentes conexas?*
    - [ ] *Floresta (árvores)?*



## Ferramentas e recursos
- [X] Criar nó
- [X] Criar aresta
- [X] Apagar nó
- [ ] Apagar aresta
- [X] Mover nó
- [X] Alterar informações de um nó
- [ ] Alterar informações de uma aresta
- [X] Completar o grafo (conectar todos os nós em todos os outros nós)
- [X] Apagar todas as arestas
- [ ] Limpar o grafo
- Selecionar nós
    - [X] Mover múltiplos nós simultaneamente
    - [ ] Alterar informações de várias arestas simultaneamente
    - [X] Completar sub-grafo (conjunto de nós) selecionado
    - [X] Apagar todas as arestas dos nós selecionados
    - [X] Apagar todos os nós selecionados
- [ ] Desfazer última ação
- [ ] Refazer última ação
- [ ] Incluir como parte de grupo (nó inicial, nó final, etc.)
- [ ] Executar algoritmo
- [ ] Executar passo do algoritmo
- [ ] Compartilhar

## Algoritmos
- Busca
    - Em largura: 1 nó inicial
    - Em profundidade: 1 nó inicial
- Menor caminho
    - Em número de nós: 1 nó inicial e 1 nó final
    - Em número de arestas: 1 nó inicial e 1 nó final
    - Em custo de nós: um valor em cada nó, 1 nó inicial e 1 nó final
    - Em custo de arestas: um valor em cada aresta, 1 nó inicial e 1 nó final
- Árvore geradora mínima
    - 1 valor em cada aresta
    - grafo conexo ou escolha de uma componente conexa?
- Fluxo máximo
    - Com fluxo e capacidade nas arestas: direcionado, 2 valores nas arestas, 1 nó inicial e 1 nó final
    - Com fluxo e capacidade nos nós: direcionado, 2 valores nos nós, 1 nó inicial e 1 nó final?
- Emparelhamento máximo
- Coloração
    - Menor número de cores em nós
    - Menor número de cores em arestas
- Caminho Euleriano
    - Aberto: 1 nó inicial e 1 nó final
    - Fechado: 1 nó inicial que é o final
- Ordenação Topológica
    - Direcionado, 1 valor em cada nó
- *Detecção de ciclo?*
- *Detecção de conexidade?*
