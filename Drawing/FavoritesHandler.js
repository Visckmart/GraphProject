import {g} from "./GraphView.js";

let favoritesList = document.getElementById("favoritesList")

let favoriteTemplate = document.querySelector("#favoriteRow")
let newFavoriteTemplate = document.querySelector("#favoriteNewRow")
let favoriteDeleteTemplate = document.querySelector("#favoriteDeleteConfirmationRow")

let deletingFavorite = null;

export function updateFavorites() {
    favoritesList.innerHTML = "";
    let favoriteKeys = getAllFavoriteKeys();
    for (let key of favoriteKeys) {
        if (deletingFavorite != key) {
            let favoriteRow = makeFavoriteRow(key);
            favoritesList.appendChild(favoriteRow);
        } else {
            let deletionRow = makeFavoriteDeletionRow(key);
            favoritesList.appendChild(deletionRow);
        }
    }
    let newFavoriteRow = makeNewFavoriteRow();
    favoritesList.appendChild(newFavoriteRow);
}

function getAllFavoriteKeys() {
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

function makeFavoriteRow(key) {
    let newFavoriteRow = favoriteTemplate.content.cloneNode(true);
    newFavoriteRow.getElementById("inputLabel").value = key.substr(3);
    let labelInput = newFavoriteRow.getElementById("inputLabel");
    labelInput.onchange = function(event) {
        let newName = event.target.value;
        if (!newName
            || window.localStorage.getItem("fav"+newName) != null) {
            return;
        }
        let current = window.localStorage.getItem(key);
        window.localStorage.removeItem(key);
        window.localStorage.setItem("fav"+newName, current);
        updateFavorites();
    }
    labelInput.onblur = () => {
        labelInput.value = key.substr(3);
    }
    let loadBtn = newFavoriteRow.getElementById("loadFavorite");
    loadBtn.name = key;
    loadBtn.onclick = () => {
        g.loadSerializedGraph(window.localStorage.getItem(key));
        updateFavorites();
    }
    let removeBtn = newFavoriteRow.getElementById("removeFavorite");
    removeBtn.name = key;
    removeBtn.onclick = () => {
        deletingFavorite = key;
        updateFavorites();
    }
    return newFavoriteRow;
}

function makeFavoriteDeletionRow(key) {
    let newDeleteRow = favoriteDeleteTemplate.content.cloneNode(true);
    let cancelBtn = newDeleteRow.getElementById("cancelDeletion");
    cancelBtn.onclick = () => {
        deletingFavorite = null;
        updateFavorites();
    }
    let confirmBtn = newDeleteRow.getElementById("confirmDeletion");
    confirmBtn.onclick = () => {
        deletingFavorite = null;
        window.localStorage.removeItem(key);
        updateFavorites();
    }
    return newDeleteRow;
}

function makeNewFavoriteRow() {
    let newFavorite = newFavoriteTemplate.content.cloneNode(true);
    let newFavoriteBtn = newFavorite.getElementById("newFavorite");
    newFavoriteBtn.onclick = () => {
        let newName = "Favorito";
        let offset = 1;
        do {
            newName = `Favorito ${window.localStorage.length + offset}`;
            offset += 1;
        } while (window.localStorage.getItem("fav" + newName) != null);
        window.localStorage.setItem("fav" + newName, g.structure.serialize());
        updateFavorites();

        let mBody = document.getElementsByClassName("menuBody")[0];
        mBody.scrollTop = mBody.scrollHeight;
    }
    return newFavorite;
}
