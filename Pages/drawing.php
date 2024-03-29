<!--
  ~ MIT License
  ~
  ~ Copyright (c) 2021 Thiago Lamenza e Victor Martins
  ~
  ~ Permission is hereby granted, free of charge, to any person obtaining a copy of
  ~ this software and associated documentation files (the "Software"), to deal in
  ~ the Software without restriction, including without limitation the rights to
  ~ use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
  ~ the Software, and to permit persons to whom the Software is furnished to do so,
  ~ subject to the following conditions:
  ~
  ~ The above copyright notice and this permission notice shall be included in all
  ~ copies or substantial portions of the Software.
  ~
  ~ THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  ~ IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
  ~ FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
  ~ COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
  ~ IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  ~ CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
  -->
<?php
if (!isset($_COOKIE['doreturn']))
{
    header('Location: index-return.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<!--	<meta content="text/html;charset=ISO-8859-1" http-equiv="Content-Type">-->
<!--	<meta content="ISO-8859-1" http-equiv="encoding">-->
    <meta charset="UTF-8">
    <title>GraphProject</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="tool_tray.css">
    <meta name="viewport" content="height=device-height, initial-scale=1">
    <!--  Stylesheets de algoritmos não precisam ser carregadas sincronamente  -->
    <link rel="preload" href="../Drawing/AlgorithmVisualizations/algorithm_controls.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="../Drawing/AlgorithmVisualizations/algorithm_controls.css"></noscript>

    <link rel="preload" href="../Drawing/AlgorithmVisualizations/algorithm_menu.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="../Drawing/AlgorithmVisualizations/algorithm_menu.css"></noscript>

    <link rel="preload" href="../Drawing/AlgorithmVisualizations/Pseudocode/algorithm_pseudocode.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="../Drawing/AlgorithmVisualizations/Pseudocode/algorithm_pseudocode.css"></noscript>

    <link rel="preload" href="../Drawing/AlgorithmVisualizations/Showcase/algorithm_showcase.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="../Drawing/AlgorithmVisualizations/Showcase/algorithm_showcase.css"></noscript>

    <script type="module" src="../Drawing/General.js" crossorigin="anonymous"></script>
    <script type="module" src="../Drawing/Interaction.js" crossorigin="anonymous"></script>
    <script type="module" src="../Drawing/GraphView.js" crossorigin="anonymous"></script>
    <script type="module" src="../Drawing/Initialization.js" crossorigin="anonymous"></script>
</head>
<body>
<div id="interfaceContainer">
    <div id="canvasArea">
        <canvas id="mainCanvas"></canvas>
        <canvas id="slowCanvas"></canvas>
        <canvas id="fastCanvas"></canvas>
        <div id="shareModal" class="modalDiv">
            <h1>Importar grafo</h1>
            <br>
            <button style="margin-left: 0pt; margin-right: 2pt;" class="importFile">Arquivo...</button>
            <br>
            <button style="margin-right: 2pt;" class="importText">Texto...</button>
            <br>
            <button style="margin-right: 2pt;" class="importCancel">Cancelar</button>
        </div>
        <noscript>
            <div id="errorMessage">
                <h1>JavaScript é necessário para executar a ferramenta</h1>
            </div>
        </noscript>


        <!--    Ferramentas    -->
        <div id="tray" class="toolTray">
            <div class="toolTrayTab">
                <a class="toolTrayCaretUp" href="#" tabindex="1">
                    <img width="16" height="16" src="../assets/img/caret_up.svg" alt="caret_up">
                </a>
                <a class="toolTrayCaretDown" href="#tray">
                    <img width="16" height="16" src="../assets/img/caret_down.svg" alt="caret_down">
                </a>
            </div>
            <div class="toolTrayBody" id="tool_tray">
                <div id="leftItems">
                    <div class="trayItem">
                        <input tabindex="2" type="radio" name="tool" value="move" id="move_input" checked/>
                        <div class="tool-icon icon">
                            <span style="font-size: 25pt">•</span>
                        </div>
                        <p class="name">
                            <label for="move_input">Nós</label>
                        </p>
                    </div>

                    <div class="trayItem">
                        <input tabindex="3" type="radio" name="tool" value="connect" id="connect_input"/>
                        <div class="tool-icon icon">
                            <span style="font-size: 25pt; margin-top: -1pt;">⧟</span>
                        </div>
                        <p class="name">
                            <label for="connect_input">Arestas</label>
                        </p>
                    </div>
                </div>

                <div id="rightItems">
                    <div class="trayItem">
                        <input type="radio" name="feature" value="snap_to_grid" id="align_input"/>
                        <div class="feature-icon icon">
                            <img width="25" height="25" src="../assets/img/grid-fill.svg" alt="conectar"/>
                        </div>
                        <p class="name">
                            <label for="align_input">Alinhar</label>
                        </p>
                    </div>
                    <div class="trayItem">
                        <input type="radio" name="feature" value="connect_all" id="connect_all_input"/>
                        <div class="feature-icon icon">
                            <img width="25" height="25" src="../assets/img/connect.svg" alt="conectar"/>
                        </div>
                        <p class="name">
                            <label for="connect_all_input">Conectar</label>
                        </p>
                    </div>

                    <div class="trayItem">
                        <input type="radio" name="feature" value="disconnect_all" id="disconnect_all_input"/>
                        <div class="feature-icon icon">
                            <img width="25" height="25" src="../assets/img/disconnect.svg" alt="desconectar"/>
                        </div>
                        <p class="name">
                            <label for="disconnect_all_input">Desconectar</label>
                        </p>
                    </div>

                    <div class="trayItem">
                        <input type="radio" name="feature" value="delete_all" id="delete_all_input"/>
                        <div class="feature-icon icon">
                            <img width="25" height="25" src="../assets/img/remove.svg" alt="remover"/>
                        </div>
                        <p class="name">
                            <label for="delete_all_input">Remover</label>
                        </p>
                    </div>
                </div>

            </div>
        </div>

        <!--    Controle de Algoritmos  -->
        <div id="algorithmController" style="display: none">
            <a href="#" id="exit_button">
                <img src="../assets/img/exit.svg" width="20" height="20" alt="exit" loading=lazy />
            </a>
            <div id="tutorialContainer">
                <label><span>Selecione o nó inicial.</span></label>
                <a>>></a>
            </div>
            <hr class="separator"/>

            <div id="executionContainer">
                <div id="speedContainer">
                    <label for="speedInput" id="speedGauge">Velocidade do Algoritmo</label>
                    <input type="range" id="speedInput" min="-2" max="2" step="1" value="0">
                </div>

                <div id="timelineContainer">
                    <a class="timelineButton" id="back_button">
                        <img width="25" height="25" src="../assets/img/back.svg" alt="back" loading=lazy />
                    </a>
                    <a class="timelineButton" id="play_button">
                        <img width="25" height="25" src="../assets/img/play.svg" alt="play" loading=lazy />
                    </a>
                    <a class="timelineButton" style="display: none;" id="stop_button">
                        <img width="25" height="25" src="../assets/img/pause.svg" alt="pause" loading=lazy />
                    </a>
                    <a class="timelineButton" id="forward_button">
                        <img width="25" height="25" src="../assets/img/forward.svg" alt="forward" loading=lazy />
                    </a>
                    <label for="timelineInput" style="display: none">Timeline</label>
                    <input type="range" id="timelineInput">
                </div>
            </div>
        </div>

        <!--    Menu do algoritmo    -->
        <div id="algorithmMenu" style="display: none">
            <a id="algorithmMenuPin" href="#algorithmMenu">
                <img width="16" height="16" src="../assets/img/pin.svg" alt="pin" loading=lazy>
            </a>
            <a id="algorithmMenuUnpin" href="#">
                <img width="16" height="16" src="../assets/img/pin.svg" alt="pin" loading=lazy>
            </a>

            <div>

                <div id="algorithmMenuTabs">
                    <div id="showcaseTab" value="algorithmShowcase" style="display: none">Estruturas de dados</div>
                    <div id="pseudocodeTab" value="pseudocode" style="display: none">
                        Pseudocódigo
                        <a href="#" id="pseudoPopup">
                            <img width="16" height="16" src="../assets/img/popup.svg" alt="popup" loading=lazy />
                        </a>
                    </div>
                </div>
                <div id="algorithmMenuBody">
                    <!--    Showcase de Algoritmos  -->
                    <div id="algorithmShowcase">
                        <div id="showcaseContainer">

                            <h1 id="showcaseTitle"></h1>
                            <span id="showcaseMessage"></span>
                            <div id="showcaseBody">
                                <canvas id="showcase"></canvas>
                            </div>
                        </div>
                    </div>

                    <!--    Pseudocódigo    -->
                    <div id="pseudocode" style="display: none">
                        <div id="pseudoWrapper">
                            <div id="pseudoContainer">

                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="algorithmMenuTab"></div>
        </div>
    </div>
    <div id="menuArea">
        <div class="menuContent" id="GraphSettings">
            <h2 class="menuTitle">Grafo</h2>
            <div class="menuBody">
                <div class="settingsSection">
                    <h4 class="sectionTitle">
                        <label for="algorithm">Algoritmo</label>
                    </h4>
                    <select id="algorithm">
                        <option value="none" selected>Nenhum</option>
                        <optgroup label="- - - - - - - - - - - - - - -">
                            <option value="BFS" disabled>Busca em Largura</option>
                            <option value="DFS" disabled>Busca em Profundidade</option>
                        </optgroup>
                        <optgroup label="- - - - - - - - - - - - - - -">
                            <option value="Dijkstra" >Dijkstra (Menor Caminho)</option>
                        </optgroup>
                        <optgroup label="- - - - - - - - - - - - - - -">
                            <option value="PrimMST">Prim (Árvore Geradora Mínima)</option>
                            <option value="KruskalMST">Kruskal (Árvore Geradora Mínima)</option>
                        </optgroup>
                        <optgroup label="- - - - - - - - - - - - - - -">
                            <option value="DFSCycleDetection">DFS (Detecção de ciclo)</option>
                        </optgroup>
                        <optgroup label="- - - - - - - - - - - - - - -">
                            <option value="EulerianPath">Hierholzer's Algorithm (Trajeto Euleriano)</option>
                        </optgroup>
                        <optgroup label="- - - - - - - - - - - - - - -">
                            <option disabled value="EdmondsMSA">Algoritmo de Edmond (Arborescência Mínima)</option>
                        </optgroup>
                        <optgroup label="- - - - - - - - - - - - - - -">
                            <option value="FordFulkerson">Algoritmo de Ford Fukerson (Fluxo Máximo)</option>
                        </optgroup>
                        <optgroup label="- - - - - - - - - - - - - - -">
                            <option value="GreedyNodeColoring">Greedy Node Coloring</option>
                        </optgroup>
                    </select>
                    <button id="run_algorithm">Run</button>
                    <br>
                </div>
                <div class="settingsSection">
                    <h4 class="sectionTitle">Características</h4>
                    <h5 class="sectionSubtitle">Nós</h5>
                    <input type="checkbox" id="coloredNodes" /><label for="coloredNodes">Coloridos</label>
                    <h5 class="sectionSubtitle">Arestas</h5>
                    <input type="checkbox" id="directedEdges"/><label for="directedEdges">Direcionadas</label>
                    <br>
                    <input type="checkbox" id="weightedEdges"/><label for="weightedEdges">Pesado</label>
<!--                    <br>-->
<!--                    <input type="checkbox" id="coloredEdges" /><label for="coloredEdges">Coloridas</label>-->

                    <h4 class="sectionSubtitle">
                        <label for="nodeLabeling">Nomenclatura dos nós</label>
                    </h4>
                    <select id="nodeLabeling" tabindex="0" >
                        <option value="numbers">Números (Em Ordem Crescente)</option>
                        <option value="letters_ordered">Letras (Em Ordem Alfabética)</option>
                        <option value="letters_randomized" selected>Letras (Aleatórias)</option>
                    </select>
                </div>
                <div class="settingsSection">
                    <h4 class="sectionTitle">Compartilhar</h4>
                    <h4 class="sectionSubtitle">Exportar como...</h4>
                    <button style="margin-left: 0pt; margin-right: 2pt;" id="exportFile">Arquivo</button>
                    <button style="margin-right: 2pt;" id="exportText">Texto</button>
                    <button style="margin-right: 2pt;" id="exportLink">Link</button>
                    <button style="margin-right: 2pt;" id="exportImage">Imagem</button>
                    <h4 class="sectionSubtitle">Importar como...</h4>
                    <input type="file" id="inputFile" accept=".gp, .txt" style="display: none;">
                    <button style="margin-left: 0pt; margin-right: 2pt;" class="importFile">Arquivo</button>
                    <button style="margin-right: 2pt;" class="importText">Texto</button>
                </div>
                <div class="settingsSection">
                    <h4 class="sectionTitle">Favoritos</h4>
                    <div id="favoritesList">
                        <template id="favoriteRow">
                            <div class="favorite">
                                <label><input type="text" id="inputLabel" value="Favorito 1"></label>
                                <div>
                                    <button id="loadFavorite" name="1"><strong>Abrir</strong></button>
                                    <button id="removeFavorite" name="1">Apagar…</button>
                                </div>
                            </div>
                        </template>

                        <template id="favoriteDeleteConfirmationRow">
                            <div class="favorite">
                                <label style="font-family:sans-serif;font-size: 10.5pt;font-weight: bold;">Apagar?</label>
                                <div>
                                    <button id="cancelDeletion">Não</button>
                                    <button id="confirmDeletion">Sim</button>
                                </div>
                            </div>
                        </template>

                        <template id="favoriteNewRow">
                            <button style="width: 100%;font-size:10pt;margin-bottom:8pt;" id="newFavorite">Novo favorito <strong>+</strong></button>
                        </template>

                        <button style="margin-left: 0pt; margin-right: 2pt;" id="clearFavorites">Limpar</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="menuContent" id="NodeSettings" style="display: none;">
            <h2 class="menuTitle">Nó</h2>
            <div class="menuBody">
                <property-list id="NodeProperties" artifact="node"></property-list>
            </div>
        </div>
        <div class="menuContent" id="EdgeSettings" style="display: none;">
            <h2 class="menuTitle">Aresta</h2>
            <div class="menuBody">
                <property-list id="EdgeProperties" artifact="edge"></property-list>
            </div>
        </div>
        <div class="menuContent" id="NodeEdgeSettings" style="display: none;">
            <h2 class="menuTitle">Aresta e Nós</h2>
            <div class="menuBody">
                <property-list id="NodeEdgeProperties" artifact="all"></property-list>
            </div>
        </div>
    </div>
</div>

<footer style="display:flex;">
        <p><a href="about.html">Desenvolvido por <span id="authors"><strong>Thiago Lamenza</strong> e <strong>Victor Martins</strong></span></a></p>
</footer>
<script>
    updateTopBorder = function (event) {
        let body = event.target
        if (body.scrollTop > 0) {
            body.classList.add("menuBodyScrolled")
        } else {
            body.classList.remove("menuBodyScrolled")
        }
    }
    for (let menuBody of document.getElementsByClassName("menuBody")) {
        menuBody.addEventListener("scroll", updateTopBorder)
    }
</script>
</body>
</html>