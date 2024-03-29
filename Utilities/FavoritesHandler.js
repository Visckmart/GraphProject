/*
 * MIT License
 *
 * Copyright (c) 2021 Thiago Lamenza e Victor Martins
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */


import { g } from "../Drawing/GraphView.js";

export default class FavoritesHandler {

    deletingFavorite = null;

    constructor(callback) {
        this.callback = callback;
        this.favoritesList = document.getElementById("favoritesList");
        this.menuBody = document.getElementsByClassName("menuBody")[0];

        this.favoriteTemplate = document.querySelector("#favoriteRow");
        this.newFavoriteTemplate = document.querySelector("#favoriteNewRow");
        this.favoriteDeleteTemplate = document.querySelector("#favoriteDeleteConfirmationRow");
    }

    /**
     * Atualização da lista de favoritos no menu lateral.
     */
    updateFavorites() {
        /* Limpa a lista */
        this.favoritesList.innerHTML = "";
        /* Obtém todas as chaves que representam favoritos */
        let favoriteKeys = this.getAllFavoriteKeys();

        /*
         Cria linhas de acordo com os templates
         de favoritos e de remoção de favoritos.
         */
        for (let key of favoriteKeys) {
            let newRow;
            if (this.deletingFavorite == key) {
                newRow = this.makeFavoriteDeletionRow(key);
            } else {
                newRow = this.makeFavoriteRow(key);
            }
            this.favoritesList.appendChild(newRow);
        }

        /* Cria uma linha que possibilita a criação de um novo favorito */
        let newFavoriteRow = this.makeNewFavoriteRow();
        this.favoritesList.appendChild(newFavoriteRow);
    }

    /**
     * Obtém todas as chaves que representam favoritos no localStorage e as retorna
     * em ordem alfabética.
     */
    getAllFavoriteKeys() {
        let favoriteKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            let key = localStorage.key(i);
            if (key.includes("fav", 0)) { favoriteKeys.push(key); }
        }
        favoriteKeys.sort((favA, favB) => {
            return favA.toLowerCase() > favB.toLowerCase();
        })
        return favoriteKeys;
    }

    /**
     * Cria, a partir de um template, uma linha nova para um favorito e associa aos
     * elementos tratadores de eventos que atuam sobre o favorito em questão.
     */
    makeFavoriteRow(key) {
        /* Clona o template */
        let favoriteRow = this.favoriteTemplate.content.cloneNode(true);

        /* Configurando o text input */
        let labelInput = favoriteRow.getElementById("inputLabel");
        /* Remove o prefixo "fav" */
        labelInput.value = key.substr(3);
        /* Renomeia o favorito de acordo com o texto do text input */
        labelInput.onchange = function(event) {
            let newName = event.target.value;
            /* Checa se o nome não é vazio e se não existe um favorito com esse nome */
            if (!newName || window.localStorage.getItem("fav"+newName) != null) {
                return;
            }
            /* Copia o favorito do nome antigo, apaga e cria um com o nome novo */
            let current = window.localStorage.getItem(key);
            window.localStorage.removeItem(key);
            window.localStorage.setItem("fav"+newName, current);
            this.updateFavorites();
        }
        /* Ao tirar o foco (sem confirmar o nome novo), escreva o original */
        labelInput.onblur = () => {
            labelInput.value = key.substr(3);
        }
        labelInput.removeAttribute("id");

        /* Configurando o botão de carregar o favorito */
        let loadBtn = favoriteRow.getElementById("loadFavorite");
        /* Obtém e carrega o grafo serializado no localStorage */
        loadBtn.onclick = () => {
            let favoriteContent = window.localStorage.getItem(key);
            g.loadSerializedGraph(favoriteContent);
            this.callback()
            this.updateFavorites();
        }
        loadBtn.removeAttribute("id");
        /* Configurando o botão de apagar o favorito */
        let removeBtn = favoriteRow.getElementById("removeFavorite");
        /* Marcando o favorito atual como "sendo apagado" (para mostrar a confirmação) */
        removeBtn.onclick = () => {
            this.deletingFavorite = key;
            this.updateFavorites();
        }
        removeBtn.removeAttribute("id");
        return favoriteRow;
    }

    /**
     * Cria, a partir de um template, uma linha de apagamento de favoritos e
     * configura seus botões apropriadamente.
     */
    makeFavoriteDeletionRow(key) {
        /* Clona o template */
        let deleteRow = this.favoriteDeleteTemplate.content.cloneNode(true);

        /* Configura o botão de cancelar o apagamento */
        let cancelBtn = deleteRow.getElementById("cancelDeletion");
        cancelBtn.onclick = () => {
            this.deletingFavorite = null;
            this.updateFavorites();
        }
        cancelBtn.removeAttribute("id");

        /* Configura o botão de confirmar o apagamento */
        let confirmBtn = deleteRow.getElementById("confirmDeletion");
        confirmBtn.onclick = () => {
            this.deletingFavorite = null;
            window.localStorage.removeItem(key);
            this.updateFavorites();
        }
        confirmBtn.removeAttribute("id");
        return deleteRow;
    }

    /**
     * Cria, de acordo com um template, uma linha responsável por possibilitar
     * a adição de um novo favorito.
     */
    makeNewFavoriteRow() {
        /* Clona o template */
        let newFavorite = this.newFavoriteTemplate.content.cloneNode(true);
        /* Configura o botão de criar um novo favorito */
        let newFavoriteBtn = newFavorite.getElementById("newFavorite");
        newFavoriteBtn.onclick = () => {
            let newName = "Favorito";

            /*
             Busca por nomes no formato Favorito X, onde X é um inteiro que ainda
             não foi utilizado.
             */
            let offset = 1;
            do {
                newName = `Favorito ${offset}`;
                offset += 1;
            } while (window.localStorage.getItem("fav" + newName) != null);

            window.localStorage.setItem("fav" + newName, g.structure.serialize());
            this.updateFavorites();

            /* Desce o menu */
            this.menuBody.scrollTop = this.menuBody.scrollHeight;
        }
        newFavoriteBtn.removeAttribute("id");
        return newFavorite;
    }
}
