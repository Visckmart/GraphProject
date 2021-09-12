# GraphTeacher
**Ferramenta de manipulação de grafos e exploração de algoritmos de maneira didática. ([Visitar ferramenta](http://graphteacher.inf.puc-rio.br))**

A ferramenta permite a exploração e manipulação de grafos e facilita o aprendizado do funcionamento de diversos algoritmos que atuam sobre eles.

## Recursos
- [X] Criar nó
- [X] Criar aresta
- [X] Apagar nó
- [X] Apagar aresta
- [X] Mover nó
- [X] Alterar informações de um nó
- [X] Alterar informações de uma aresta
- [X] Completar o grafo (conectar todos os nós em todos os outros nós)
- [X] Apagar todas as arestas
- [X] Limpar o grafo
- Selecionar nós
    - [X] Mover múltiplos nós simultaneamente
    - [X] Alterar informações de várias arestas simultaneamente
    - [X] Completar sub-grafo (conjunto de nós) selecionado
    - [X] Apagar todas as arestas dos nós selecionados
    - [X] Apagar todos os nós selecionados
- [X] Desfazer última ação
- [X] Refazer última ação
- [X] Incluir como parte de grupo (nó inicial, nó final, etc.)
- Execução dos Algoritmos
  - [X] Executar e parar execução
  - [X] Avançar passo
  - [X] Retroceder passo
  - [X] Explicações de cada passo
  - [X] Alterar velocidade de execução
- Compartilhar
  - [X] Como arquivo codificado
  - [X] Como texto
  - [X] Como imagem
  - [X] Como link
- [X] Favoritos
  
## Categorias
- Direção
    - [X] **Não-direcionado**
    - [X] Direcionado
- Valor Associado
    - [X] **Nada**
    - [X] Um em cada aresta (peso/custo)
    - [X] Um em cada nó (peso/custo)
- Cor
    - [X] **Em cada nó**
    - [ ] Em cada aresta

## Algoritmos
- Busca
    - [X] Em largura: 1 nó inicial
    - [X] Em profundidade: 1 nó inicial
- Menor caminho
    - [X] Em número de nós: 1 nó inicial e 1 nó final
    - [X] Em número de arestas: 1 nó inicial e 1 nó final
    - [X] Em custo de nós: um valor em cada nó, 1 nó inicial e 1 nó final
    - [X] Em custo de arestas: um valor em cada aresta, 1 nó inicial e 1 nó final
- Árvore geradora mínima
    - [X] 1 valor em cada aresta
    - [ ] grafo conexo ou escolha de uma componente conexa?
- Fluxo máximo
    - [X] Com fluxo e capacidade nas arestas: direcionado, 2 valores nas arestas, 1 nó inicial e 1 nó final
    - [ ] Com fluxo e capacidade nos nós: direcionado, 2 valores nos nós, 1 nó inicial e 1 nó final?
- Emparelhamento máximo
- Coloração
    - [X] Menor número de cores em nós
    - [ ] Menor número de cores em arestas
- Caminho Euleriano
    - Aberto: 1 nó inicial e 1 nó final
    - Fechado: 1 nó inicial que é o final
- Ordenação Topológica
    - Direcionado, 1 valor em cada nó
- [X] Detecção de ciclo
- *Detecção de conexidade?*
