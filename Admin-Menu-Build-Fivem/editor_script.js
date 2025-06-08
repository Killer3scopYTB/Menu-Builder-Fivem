// editor_script.js

// --- Déclarations de variables globales ---
let fullMenuData = {}; // Contient toute la structure des menus et des styles
let currentEditingMenuKey = "main"; // Clé du menu actuellement édité (ex: "main", "vehicules_menu")
let selectedMenuItemIndex = -1; // Index de l'élément de menu sélectionné dans la liste

// --- Références aux éléments du DOM ---
const previewIframe = document.getElementById('previewIframe');
const rawJsonEditor = document.getElementById('rawJsonEditor');
const jsonErrorDisplay = document.getElementById('jsonError');

// Éléments pour les options visuelles
const mainColorInput = document.getElementById('mainColor');
const bgColorInput = document.getElementById('bgColor');
const bgOpacityInput = document.getElementById('bgOpacity');
const bgOpacityValueSpan = document.getElementById('bgOpacityValue');
const textColorInput = document.getElementById('textColor');
const titleColorInput = document.getElementById('titleColor');
const versionColorInput = document.getElementById('versionColor');
const fontSizeInput = document.getElementById('fontSize');
const headerTitleSizeInput = document.getElementById('headerTitleSize');
const menuBorderRadiusInput = document.getElementById('menuBorderRadius');
const menuBorderSizeInput = document.getElementById('menuBorderSize');
const menuBorderColorInput = document.getElementById('menuBorderColor');
const menuShadowColorInput = document.getElementById('menuShadowColor');
const menuShadowSizeInput = document.getElementById('menuShadowSize');
const menuFontInput = document.getElementById('menuFont');
const textAlignSelect = document.getElementById('textAlign');
const menuPaddingInput = document.getElementById('menuPadding');
const menuItemPaddingInput = document.getElementById('menuItemPadding');

const hoverBgColorInput = document.getElementById('hoverBgColor');
const hoverBgOpacityInput = document.getElementById('hoverBgOpacity');
const hoverBgOpacityValueSpan = document.getElementById('hoverBgOpacityValue');
const hoverTextColorInput = document.getElementById('hoverTextColor');
const hoverIconColorInput = document.getElementById('hoverIconColor');
const hoverBorderSizeInput = document.getElementById('hoverBorderSize');
const hoverBorderColorInput = document.getElementById('hoverBorderColor');


// Éléments pour la gestion des menus
const currentMenuSelect = document.getElementById('currentMenuSelect');
const editingMenuTitleSpan = document.getElementById('editingMenuTitle');
const menuItemsList = document.getElementById('menuItemsList');

// Éléments pour la configuration de l'élément sélectionné
const itemConfigurationPanel = document.getElementById('itemConfigurationPanel');
const selectedItemNameDisplay = document.getElementById('selectedItemNameDisplay');
const itemNameInput = document.getElementById('itemName');
const itemIconInput = document.getElementById('itemIcon');
const itemIconColorInput = document.getElementById('itemIconColor');
const itemTextColorInput = document.getElementById('itemTextColor');
const itemBgColorInput = document.getElementById('itemBgColor');
const itemIsTitleCheckbox = document.getElementById('itemIsTitle');
const itemTypeSelect = document.getElementById('itemTypeSelect');
const subMenuSelectionDiv = document.getElementById('subMenuSelection');
const itemSubMenuSelect = document.getElementById('itemSubMenu');
const actionSelectionDiv = document.getElementById('actionSelection');
const itemActionSelect = document.getElementById('itemAction');
const actionArgsDiv = document.getElementById('actionArgs');
const actionArg1Input = document.getElementById('actionArg1');
const actionArg1HintSpan = document.getElementById('actionArg1Hint');
const customActionCodeDiv = document.getElementById('customActionCode');
const customActionLuaTextarea = document.getElementById('customActionLua');

// NOUVEL ELEMENT : Pour encapsuler la logique action/sous-menu
const itemActionOrSubMenu = document.getElementById('itemActionOrSubMenu'); // Assurez-vous que cet ID existe dans votre HTML !

// Nouvelles variables pour le prompt de l'IA
const aiPromptInput = document.getElementById('aiPrompt');
const previewOverlay = document.getElementById('previewOverlay');


// --- Fonctions utilitaires ---

function rgbToHex(rgb) {
    if (!rgb || rgb === "rgba(0, 0, 0, 0)") return "#000000"; // Gérer les cas transparents ou vides
    const parts = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d*\.?\d+))?\)$/);
    if (!parts) return "#000000"; // Fallback
    delete (parts[0]);
    for (let i = 1; i <= 3; i++) {
        parts[i] = parseInt(parts[i]).toString(16);
        if (parts[i].length === 1) parts[i] = '0' + parts[i];
    }
    return '#' + parts.slice(1, 4).join('').toUpperCase();
}


function hexToRgbA(hex, opacity) {
    if (!hex || hex.length < 7) return `rgba(0,0,0,${opacity || 1})`;
    let c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length === 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        return `rgba(${[(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',')},${opacity || 1})`;
    }
    return `rgba(0,0,0,${opacity || 1})`;
}

// Fonction pour déboguer et afficher les messages d'erreur
function displayError(message) {
    jsonErrorDisplay.textContent = message;
    jsonErrorDisplay.style.display = 'block';
    console.error("Erreur de l'éditeur:", message);
}

function clearError() {
    jsonErrorDisplay.textContent = '';
    jsonErrorDisplay.style.display = 'none';
}

function loadGoogleFont(fontFamily) {
    // Supprimer les guillemets s'il y en a
    const cleanFontFamily = fontFamily.replace(/['"]/g, '').split(',')[0].trim();
    if (!cleanFontFamily) return;

    // Vérifier si la police est déjà chargée
    const existingLink = document.querySelector(`link[href*="fonts.googleapis.com/css2?family=${cleanFontFamily.replace(/\s/g, '+')}:wght@"]`);
    if (existingLink) return;

    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = 'https://fonts.googleapis.com';
    document.head.appendChild(link);

    const link2 = document.createElement('link');
    link2.rel = 'preconnect';
    link2.href = 'https://fonts.gstatic.com';
    link2.crossOrigin = 'anonymous';
    document.head.appendChild(link2);

    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = `https://fonts.googleapis.com/css2?family=${cleanFontFamily.replace(/\s/g, '+')}:wght@300;400;700&display=swap`;
    document.head.appendChild(fontLink);
}

// --- Fonctions de gestion des styles ---

function applyVisualOptionsToInputs() {
    const styles = fullMenuData.styles;

    mainColorInput.value = styles.mainColor || "#3296FF";
    bgColorInput.value = styles.bgColor || "#0A0A0A";
    bgOpacityInput.value = (styles.bgOpacity * 100) || 90;
    bgOpacityValueSpan.textContent = bgOpacityInput.value + '%';
    textColorInput.value = styles.textColor || "#F0F0F0";
    titleColorInput.value = styles.titleColor || "#61DAFB";
    versionColorInput.value = styles.versionColor || "#C0C0C0";
    fontSizeInput.value = parseInt(styles.fontSize) || 16;
    headerTitleSizeInput.value = parseInt(styles.headerTitleSize) || 24;
    menuBorderRadiusInput.value = parseInt(styles.menuBorderRadius) || 4;
    menuBorderSizeInput.value = parseInt(styles.menuBorderSize) || 1;
    menuBorderColorInput.value = styles.menuBorderColor || "#ffffff";
    menuShadowColorInput.value = styles.menuShadowColor || "#000000";
    menuShadowSizeInput.value = parseInt(styles.menuShadowSize) || 20;
    menuFontInput.value = styles.menuFont || "Arial, sans-serif";
    textAlignSelect.value = styles.textAlign || "left";
    menuPaddingInput.value = parseInt(styles.menuPadding) || 10;
    menuItemPaddingInput.value = parseInt(styles.menuItemPadding) || 12;

    hoverBgColorInput.value = styles.hoverBgColor || "#3296FF";
    hoverBgOpacityInput.value = (styles.hoverBgOpacity * 100) || 30;
    hoverBgOpacityValueSpan.textContent = hoverBgOpacityInput.value + '%';
    hoverTextColorInput.value = styles.hoverTextColor || "#FFFFFF";
    hoverIconColorInput.value = styles.hoverIconColor || "#FFFFFF";
    hoverBorderSizeInput.value = parseInt(styles.hoverBorderSize) || 4;
    hoverBorderColorInput.value = styles.hoverBorderColor || "#3296FF";

    // Charger la police si elle n'est pas Arial/sans-serif par défaut
    if (styles.menuFont && styles.menuFont !== "Arial, sans-serif") {
        loadGoogleFont(styles.menuFont);
    }
}


function updateVisualOptions() {
    // Récupérer les valeurs des inputs
    fullMenuData.styles.mainColor = mainColorInput.value;
    fullMenuData.styles.bgColor = bgColorInput.value;
    fullMenuData.styles.bgOpacity = parseFloat(bgOpacityInput.value) / 100;
    fullMenuData.styles.textColor = textColorInput.value;
    fullMenuData.styles.titleColor = titleColorInput.value;
    fullMenuData.styles.versionColor = versionColorInput.value;
    fullMenuData.styles.fontSize = `${fontSizeInput.value}px`;
    fullMenuData.styles.headerTitleSize = `${headerTitleSizeInput.value}px`;
    fullMenuData.styles.menuBorderRadius = `${menuBorderRadiusInput.value}px`;
    fullMenuData.styles.menuBorderSize = `${menuBorderSizeInput.value}px`;
    fullMenuData.styles.menuBorderColor = menuBorderColorInput.value;
    fullMenuData.styles.menuShadowColor = menuShadowColorInput.value;
    fullMenuData.styles.menuShadowSize = `${menuShadowSizeInput.value}px`;
    fullMenuData.styles.menuFont = menuFontInput.value;
    fullMenuData.styles.textAlign = textAlignSelect.value;
    fullMenuData.styles.menuPadding = `${menuPaddingInput.value}px`;
    fullMenuData.styles.menuItemPadding = `${menuItemPaddingInput.value}px`;

    fullMenuData.styles.hoverBgColor = hoverBgColorInput.value;
    fullMenuData.styles.hoverBgOpacity = parseFloat(hoverBgOpacityInput.value) / 100;
    fullMenuData.styles.hoverTextColor = hoverTextColorInput.value;
    fullMenuData.styles.hoverIconColor = hoverIconColorInput.value;
    fullMenuData.styles.hoverBorderSize = `${hoverBorderSizeInput.value}px`;
    fullMenuData.styles.hoverBorderColor = hoverBorderColorInput.value;

    // Charger la police si l'utilisateur la change
    loadGoogleFont(menuFontInput.value);

    // Appliquer les styles à l'iframe (en envoyant un message NUI)
    if (previewIframe.contentWindow) {
        previewIframe.contentWindow.postMessage({
            type: 'applyStyles',
            styles: fullMenuData.styles
        }, '*');
    }
}


// --- Fonctions de gestion des menus et éléments ---

function populateMenuSelect() {
    currentMenuSelect.innerHTML = '';
    for (const key in fullMenuData) {
        if (fullMenuData.hasOwnProperty(key) && key !== 'styles') {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = fullMenuData[key].title || key;
            currentMenuSelect.appendChild(option);
        }
    }
    currentMenuSelect.value = currentEditingMenuKey;
}

function loadMenuForEditing() {
    currentEditingMenuKey = currentMenuSelect.value;
    const currentMenu = fullMenuData[currentEditingMenuKey];

    if (!currentMenu) {
        displayError(`Menu '${currentEditingMenuKey}' introuvable.`);
        menuItemsList.innerHTML = '';
        editingMenuTitleSpan.textContent = 'Menu Inconnu';
        itemConfigurationPanel.style.display = 'none';
        return;
    }

    editingMenuTitleSpan.textContent = currentMenu.title || currentEditingMenuKey;
    menuItemsList.innerHTML = '';
    itemConfigurationPanel.style.display = 'none'; // Cacher le panneau de config d'élément
    selectedMenuItemIndex = -1; // Réinitialiser l'index sélectionné

    currentMenu.items.forEach((item, index) => {
        const li = document.createElement('li');
        li.draggable = true;
        li.dataset.index = index;
        li.className = 'menu-item-draggable';

        let iconHtml = '';
        if (item.icon) {
            iconHtml = `<i class="fas fa-${item.icon}" style="color: ${item.iconColor || 'inherit'};"></i> `;
        }
        let itemNameText = item.name || `Élément ${index + 1}`;
        if (item.isTitle) {
            itemNameText = `[TITRE] ${itemNameText}`;
            li.classList.add('is-title-item');
        } else if (item.subMenu) {
            itemNameText += ` (Sous-menu: ${fullMenuData[item.subMenu]?.title || item.subMenu})`;
        } else if (item.action) {
            itemNameText += ` (Action: ${item.action})`;
        }

        li.innerHTML = `
            <span>${iconHtml}${itemNameText}</span>
            <div class="item-actions">
                <button class="edit-item-btn" onclick="selectMenuItem(${index})"><i class="fas fa-edit"></i></button>
                <button class="delete-item-btn" onclick="deleteMenuItem(${index})"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
        menuItemsList.appendChild(li);
    });

    makeListSortable(); // Rendre la liste des éléments triable
    updatePreview(); // Mettre à jour l'aperçu après le chargement du menu
}

function addNewMenu() {
    const menuName = prompt("Entrez une clé unique pour le nouveau menu (ex: 'vehicules_menu') :");
    if (menuName && menuName.trim() !== '') {
        const cleanMenuName = menuName.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''); // Nettoyer le nom
        if (fullMenuData[cleanMenuName]) {
            alert("Cette clé de menu existe déjà ! Choisissez-en une autre.");
            return;
        }
        const menuTitle = prompt("Entrez le titre d'affichage de ce nouveau menu (ex: 'Menu Véhicules') :", cleanMenuName);
        fullMenuData[cleanMenuName] = {
            title: menuTitle || cleanMenuName,
            items: []
        };
        currentEditingMenuKey = cleanMenuName;
        populateMenuSelect();
        loadMenuForEditing();
        updateRawJsonEditor();
    }
}

function deleteCurrentMenu() {
    if (currentEditingMenuKey === "main") {
        alert("Vous ne pouvez pas supprimer le menu principal.");
        return;
    }
    if (confirm(`Êtes-vous sûr de vouloir supprimer le menu "${fullMenuData[currentEditingMenuKey]?.title || currentEditingMenuKey}" et tous ses éléments ?`)) {
        delete fullMenuData[currentEditingMenuKey];

        // Supprimer toutes les références à ce menu dans les sous-menus
        for (const menuKey in fullMenuData) {
            if (fullMenuData.hasOwnProperty(menuKey) && menuKey !== 'styles') {
                fullMenuData[menuKey].items.forEach(item => {
                    if (item.subMenu === currentEditingMenuKey) {
                        delete item.subMenu; // Supprime la référence au sous-menu inexistant
                        item.type = 'none'; // Ou changer le type si besoin
                    }
                });
            }
        }

        currentEditingMenuKey = "main"; // Retour au menu principal
        populateMenuSelect();
        loadMenuForEditing();
        updateRawJsonEditor();
        alert("Menu supprimé.");
    }
}

function addNewMenuItem() {
    const currentMenu = fullMenuData[currentEditingMenuKey];
    if (currentMenu) {
        currentMenu.items.push({
            name: "Nouvel Élément",
            icon: "",
            isTitle: false,
            type: "none" // Défaut
        });
        loadMenuForEditing();
        updateRawJsonEditor();
    }
}

function deleteMenuItem(index) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) {
        const currentMenu = fullMenuData[currentEditingMenuKey];
        if (currentMenu && currentMenu.items[index]) {
            currentMenu.items.splice(index, 1);
            loadMenuForEditing();
            updateRawJsonEditor();
        }
    }
}

function selectMenuItem(index) {
    selectedMenuItemIndex = index;
    const currentMenu = fullMenuData[currentEditingMenuKey];
    const item = currentMenu.items[selectedMenuItemIndex];

    if (!item) {
        itemConfigurationPanel.style.display = 'none';
        return;
    }

    itemConfigurationPanel.style.display = 'block';
    selectedItemNameDisplay.textContent = item.name || 'Élément';

    itemNameInput.value = item.name || '';
    itemIconInput.value = item.icon || '';
    itemIconColorInput.value = item.iconColor || '';
    itemTextColorInput.value = item.textColor || '';
    itemBgColorInput.value = item.bgColor || '';
    itemIsTitleCheckbox.checked = item.isTitle || false;

    // Masquer/afficher les champs d'action/sous-menu en fonction de isTitle
    if (item.isTitle) {
        itemActionOrSubMenu.style.display = 'none';
        itemTypeSelect.value = 'none'; // Réinitialise le type si c'est un titre
    } else {
        itemActionOrSubMenu.style.display = 'block';
        itemTypeSelect.value = item.subMenu ? 'subMenu' : (item.action ? 'action' : 'none');
    }

    // Gérer la sélection du type (sous-menu, action, ou rien)
    toggleActionFields(); // Cache/affiche les champs en fonction de itemTypeSelect

    if (item.subMenu) {
        itemSubMenuSelect.value = item.subMenu;
    } else {
        itemSubMenuSelect.value = ''; // Réinitialiser
    }
    populateSubMenuSelect(); // Remplir la liste des sous-menus disponibles

    if (item.action) {
        itemActionSelect.value = item.action;
        if (item.action === 'customAction') {
            customActionLuaTextarea.value = item.customLua || '';
        } else {
            customActionLuaTextarea.value = '';
        }
        if (item.action !== 'customAction' && item.args && item.args.length > 0) {
            actionArg1Input.value = item.args[0] || '';
        } else {
            actionArg1Input.value = '';
        }
        toggleActionArgs(); // Met à jour les hints et visibilité
    } else {
        itemActionSelect.value = ''; // Réinitialiser
        actionArg1Input.value = '';
        customActionLuaTextarea.value = '';
        toggleActionArgs();
    }

    // Mettre en surbrillance l'élément sélectionné dans la liste
    const items = menuItemsList.querySelectorAll('li');
    items.forEach((li, idx) => {
        if (idx === index) {
            li.classList.add('selected');
        } else {
            li.classList.remove('selected');
        }
    });
}

function updateSelectedMenuItem() {
    const currentMenu = fullMenuData[currentEditingMenuKey];
    if (selectedMenuItemIndex === -1 || !currentMenu || !currentMenu.items[selectedMenuItemIndex]) {
        return;
    }

    const item = currentMenu.items[selectedMenuItemIndex];

    item.name = itemNameInput.value;
    item.icon = itemIconInput.value;
    item.iconColor = itemIconColorInput.value || undefined; // Supprimer si vide
    item.textColor = itemTextColorInput.value || undefined;
    item.bgColor = itemBgColorInput.value || undefined;
    item.isTitle = itemIsTitleCheckbox.checked;

    // Gérer les actions/sous-menus en fonction de isTitle
    if (item.isTitle) {
        delete item.subMenu;
        delete item.action;
        delete item.args;
        delete item.customLua;
        itemTypeSelect.value = 'none'; // Assurer que le select reflète
        itemActionOrSubMenu.style.display = 'none';
    } else {
        itemActionOrSubMenu.style.display = 'block';
        const selectedType = itemTypeSelect.value;
        if (selectedType === 'subMenu') {
            item.subMenu = itemSubMenuSelect.value;
            delete item.action;
            delete item.args;
            delete item.customLua;
        } else if (selectedType === 'action') {
            item.action = itemActionSelect.value;
            if (item.action === 'customAction') {
                item.customLua = customActionLuaTextarea.value;
                delete item.args;
            } else if (itemActionSelect.value !== '') { // Pour les actions prédéfinies avec arg
                item.args = [actionArg1Input.value];
                if (actionArg1Input.value === '') { // Supprimer les args si vide
                    delete item.args;
                }
                delete item.customLua;
            } else { // Si l'action est vide
                delete item.action;
                delete item.args;
                delete item.customLua;
            }
            delete item.subMenu;
        } else { // type 'none'
            delete item.subMenu;
            delete item.action;
            delete item.args;
            delete item.customLua;
        }
    }

    loadMenuForEditing(); // Rafraîchir la liste pour montrer les changements
    // Resélectionner l'élément pour garder le panneau de configuration ouvert
    const items = menuItemsList.querySelectorAll('li');
    if (items[selectedMenuItemIndex]) {
        items[selectedMenuItemIndex].classList.add('selected');
    }
    updatePreview();
    updateRawJsonEditor();
}

function toggleItemType() {
    if (itemIsTitleCheckbox.checked) {
        itemActionOrSubMenu.style.display = 'none';
        itemTypeSelect.value = 'none'; // Forcer à "none" pour les titres
    } else {
        itemActionOrSubMenu.style.display = 'block';
        // Conserver la dernière sélection ou revenir à "none"
        itemTypeSelect.value = itemTypeSelect.value || 'none';
    }
    toggleActionFields();
}

function toggleActionFields() {
    const selectedType = itemTypeSelect.value;

    subMenuSelectionDiv.style.display = (selectedType === 'subMenu') ? 'block' : 'none';
    actionSelectionDiv.style.display = (selectedType === 'action') ? 'block' : 'none';

    toggleActionArgs(); // Met à jour les arguments d'action
}

function toggleActionArgs() {
    const selectedAction = itemActionSelect.value;

    actionArgsDiv.style.display = 'none';
    actionArg1HintSpan.textContent = '';
    customActionCodeDiv.style.display = 'none';

    switch (selectedAction) {
        case 'printMessage':
            actionArgsDiv.style.display = 'block';
            actionArg1HintSpan.textContent = 'Message à afficher dans le chat.';
            break;
        case 'spawnVehicle':
            actionArgsDiv.style.display = 'block';
            actionArg1HintSpan.textContent = 'Nom du modèle du véhicule (ex: "t20", "police").';
            break;
        case 'customAction':
            customActionCodeDiv.style.display = 'block';
            break;
        // Pour les autres actions sans arguments (goBack, closeMenu, repairCurrentVehicle), les champs sont masqués
    }
}

function populateSubMenuSelect() {
    itemSubMenuSelect.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '-- Sélectionner un sous-menu --';
    itemSubMenuSelect.appendChild(defaultOption);

    for (const key in fullMenuData) {
        if (fullMenuData.hasOwnProperty(key) && key !== 'styles' && key !== currentEditingMenuKey) { // Ne pas proposer le menu actuel comme sous-menu
            const option = document.createElement('option');
            option.value = key;
            option.textContent = fullMenuData[key].title || key;
            itemSubMenuSelect.appendChild(option);
        }
    }
}


// --- Fonctions de Drag & Drop (tri de liste) ---

function makeListSortable() {
    let draggedItem = null;

    menuItemsList.addEventListener('dragstart', (e) => {
        draggedItem = e.target;
        e.dataTransfer.effectAllowed = 'move';
        // Ajouter un petit délai pour permettre à la classe d'être appliquée avant le drag
        setTimeout(() => {
            draggedItem.classList.add('dragging');
        }, 0);
    });

    menuItemsList.addEventListener('dragover', (e) => {
        e.preventDefault(); // Permettre le drop
        if (draggedItem && e.target.closest('li') !== draggedItem) {
            const targetItem = e.target.closest('li');
            if (targetItem && targetItem.classList.contains('menu-item-draggable')) {
                const boundingBox = targetItem.getBoundingClientRect();
                const offset = e.clientY - boundingBox.top;

                if (offset > boundingBox.height / 2) {
                    menuItemsList.insertBefore(draggedItem, targetItem.nextSibling);
                } else {
                    menuItemsList.insertBefore(draggedItem, targetItem);
                }
            }
        }
    });

    menuItemsList.addEventListener('dragend', () => {
        draggedItem.classList.remove('dragging');
        draggedItem = null;
        reorderMenuItems();
    });
}

function reorderMenuItems() {
    const currentMenu = fullMenuData[currentEditingMenuKey];
    if (!currentMenu) return;

    const newOrder = [];
    menuItemsList.querySelectorAll('li.menu-item-draggable').forEach(li => {
        const originalIndex = parseInt(li.dataset.index);
        newOrder.push(currentMenu.items[originalIndex]);
    });

    currentMenu.items = newOrder;
    loadMenuForEditing(); // Recharger pour mettre à jour les index dataset et l'aperçu
    updateRawJsonEditor();
}


// --- Fonctions de l'éditeur JSON brut ---

function updateRawJsonEditor() {
    try {
        rawJsonEditor.value = JSON.stringify(fullMenuData, null, 4);
        clearError();
    } catch (e) {
        displayError("Erreur lors de la sérialisation JSON: " + e.message);
    }
}

function loadJsonFromRawEditor() {
    try {
        const parsedData = JSON.parse(rawJsonEditor.value);
        if (typeof parsedData !== 'object' || parsedData === null || !parsedData.main || !parsedData.styles) {
            throw new Error("Le JSON doit contenir au moins les clés 'main' et 'styles'.");
        }
        fullMenuData = parsedData;
        applyVisualOptionsToInputs(); // Applique les styles lus du JSON aux inputs
        updateVisualOptions(); // Applique les styles aux variables CSS
        populateMenuSelect();
        currentEditingMenuKey = "main"; // Assure le chargement du menu principal par défaut
        loadMenuForEditing();
        clearError();
        alert("JSON chargé avec succès !");
    } catch (e) {
        displayError("Erreur de parsing JSON: " + e.message);
    }
}

function copyCurrentJson() {
    updateRawJsonEditor(); // Assure que le JSON est à jour
    rawJsonEditor.select();
    rawJsonEditor.setSelectionRange(0, 99999); // Pour les mobiles
    try {
        document.execCommand('copy');
        alert("JSON copié dans le presse-papiers !");
    } catch (err) {
        console.error('Impossible de copier le JSON:', err);
        alert("Impossible de copier le JSON. Veuillez le copier manuellement depuis la zone de texte.");
    }
}

// --- Fonction pour l'aperçu du menu ---

function updatePreview() {
    if (previewIframe.contentWindow) {
        previewIframe.contentWindow.postMessage({
            type: 'updateMenu',
            menuData: fullMenuData,
            currentMenu: currentEditingMenuKey
        }, '*');
    }
}

// Gérer les messages de l'iframe (pour la navigation)
window.addEventListener('message', function(event) {
    const data = event.data; // Le message envoyé depuis l'iframe
    if (data.type === 'navigateMenu') {
        const targetMenuKey = data.targetMenuKey;
        if (fullMenuData[targetMenuKey]) {
            currentEditingMenuKey = targetMenuKey;
            currentMenuSelect.value = targetMenuKey; // Met à jour le select de l'éditeur
            loadMenuForEditing(); // Recharge la liste des éléments du menu dans l'éditeur
            updatePreview(); // Re-envoie pour rafraîchir l'iframe (important si la navigation est initiée depuis l'éditeur)
        }
    }
}, false);


// --- Fonctions de génération de ressource FiveM ---

async function exportResource() {
    updateRawJsonEditor(); // S'assurer que fullMenuData est à jour

    const resourceName = prompt("Entrez le nom de votre ressource FiveM (ex: 'my_awesome_menu') :");
    if (!resourceName || resourceName.trim() === '') {
        alert("Nom de ressource invalide.");
        return;
    }
    const cleanResourceName = resourceName.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

    const zip = new JSZip();

    // 1. fxmanifest.lua
    const fxmanifestContent = `
fx_version 'cerulean'
games { 'gta5' }

ui_page 'ui/index.html'

files {
    'ui/index.html',
    'ui/style.css',
    'ui/script.js',
    'client.lua',
    'server.lua'
}

client_scripts {
    'client.lua'
}

server_scripts {
    'server.lua'
}

shared_scripts {
    '@es_extended/locale/fr.lua',
    '@es_extended/locale/en.lua'
}

-- Ajoutez 'es_extended' pour les actions si votre menu utilise ESX
-- et que vous avez des actions comme 'giveWeapon' ou des actions sur l'argent
-- dependancies {
--      'es_extended'
-- }
`;
    zip.file("fxmanifest.lua", fxmanifestContent.trim());

    // 2. ui/index.html
    const uiHtmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Menu Généré</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link rel="stylesheet" href="style.css">
    <style id="dynamic-styles"></style>
    </head>
<body>
    <div id="menuContainer" class="menu-hidden">
        <div class="menu-header">
            <h2 id="menuTitle"></h2>
            <span id="menuVersion"></span>
        </div>
        <ul id="menuItems">
        </ul>
    </div>
    <script src="script.js"></script>
</body>
</html>
`;
    zip.file("ui/index.html", uiHtmlContent.trim());

    // 3. ui/style.css
    const uiCssContent = `
@charset "UTF-8";
/* Importation des polices Google Fonts */
/* Géré dynamiquement par JS si nécessaire */

body {
    overflow: hidden; /* Empêche le défilement */
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: transparent; /* Fond transparent pour le jeu */
    font-family: Arial, sans-serif; /* Fallback */
    user-select: none; /* Empêche la sélection de texte */
}

.menu-container {
    opacity: 0;
    transform: scale(0.95);
    transition: opacity 0.2s ease-out, transform 0.2s ease-out;
    background-color: rgba(10, 10, 10, 0.9); /* Default fallback */
    border-radius: 4px; /* Default fallback */
    border: 1px solid #333; /* Default fallback */
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5); /* Default fallback */
    min-width: 300px;
    max-width: 450px;
    padding: 10px; /* Default fallback */
    color: #f0f0f0; /* Default fallback */
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
}

.menu-container.menu-visible {
    opacity: 1;
    transform: scale(1) translate(-50%, -50%);
}

.menu-container.menu-hidden {
    display: none; /* Cache le menu complètement quand il est fermé */
}

.menu-header {
    padding: 10px 15px; /* Default fallback */
    text-align: center;
    margin-bottom: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.menu-header h2 {
    margin: 0;
    font-size: 24px; /* Default fallback */
    color: #61DAFB; /* Default fallback */
    flex-grow: 1;
    text-align: center;
}

#menuVersion {
    font-size: 14px;
    color: #C0C0C0; /* Default fallback */
    margin-left: 10px;
}

#menuItems {
    list-style: none;
    padding: 0;
    margin: 0;
}

#menuItems li {
    padding: 12px 15px; /* Default fallback */
    cursor: pointer;
    border-radius: 3px;
    margin-bottom: 5px;
    transition: background-color 0.15s ease, color 0.15s ease, border-left 0.15s ease;
    display: flex;
    align-items: center;
    font-size: 16px; /* Default fallback */
    position: relative;
    overflow: hidden; /* Pour la bordure gauche */
}

#menuItems li:last-child {
    margin-bottom: 0;
}

#menuItems li .fas {
    margin-right: 10px;
    min-width: 20px; /* Assure un alignement pour les icônes */
    text-align: center;
    transition: color 0.15s ease;
}

/* Style pour l'élément actif */
#menuItems li.active {
    background-color: rgba(50, 150, 255, 0.3); /* Default fallback */
    color: #FFFFFF; /* Default fallback */
    border-left: 4px solid #3296FF; /* Default fallback */
    transform: translateX(2px);
}

/* Styles au survol */
#menuItems li:not(.active):hover {
    background-color: rgba(50, 150, 255, 0.15); /* Default fallback */
    color: #FFFFFF; /* Default fallback */
}

/* Styles pour les titres (isTitle: true) */
#menuItems li.is-title {
    font-weight: bold;
    text-transform: uppercase;
    color: #FFD700; /* Une couleur distincte pour les titres */
    background-color: rgba(0, 0, 0, 0.3);
    pointer-events: none; /* Empêche la sélection au clavier/clic */
    margin-top: 10px;
    margin-bottom: 5px;
    border-bottom: 1px dashed rgba(255, 255, 255, 0.1);
    padding-bottom: 8px;
    border-left: none !important; /* Pas de bordure gauche pour les titres */
    cursor: default;
}
#menuItems li.is-title .fas {
    color: inherit !important; /* L'icône prend la couleur du titre */
}

/* Indicateur de sous-menu */
#menuItems li.has-submenu::after {
    content: "\\f0da"; /* Icône de chevron droit Font Awesome */
    font-family: "Font Awesome 5 Free";
    font-weight: 900;
    position: absolute;
    right: 15px;
    color: inherit;
    opacity: 0.7;
}

/* Styles pour les ombres */
.menu-container.shadow {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5); /* Exemple d'ombre par défaut */
}

/* Styles dynamiques (générés par JS) */
:root {
    --main-color: #3296FF;
    --bg-color: #0A0A0A;
    --bg-opacity: 0.9;
    --text-color: #F0F0F0;
    --title-color: #61DAFB;
    --version-color: #C0C0C0;
    --font-size: 16px;
    --header-title-size: 24px;
    --menu-border-radius: 4px;
    --menu-border-size: 1px;
    --menu-border-color: #ffffff;
    --menu-shadow-color: #000000;
    --menu-shadow-size: 20px;
    --menu-font: "Arial", sans-serif;
    --text-align: left;
    --menu-padding: 10px;
    --menu-item-padding: 12px;

    --hover-bg-color: #3296FF;
    --hover-bg-opacity: 0.3;
    --hover-text-color: #FFFFFF;
    --hover-icon-color: #FFFFFF;
    --hover-border-size: 4px;
    --hover-border-color: #3296FF;
}

.menu-container {
    background-color: rgba(var(--bg-color-rgb), var(--bg-opacity));
    border-radius: var(--menu-border-radius);
    border: var(--menu-border-size) solid var(--menu-border-color);
    box-shadow: 0 0 var(--menu-shadow-size) var(--menu-shadow-color);
    padding: var(--menu-padding);
    color: var(--text-color);
    font-family: var(--menu-font);
}

.menu-header {
    padding: calc(var(--menu-padding) / 2) var(--menu-padding);
}

.menu-header h2 {
    font-size: var(--header-title-size);
    color: var(--title-color);
}

#menuVersion {
    color: var(--version-color);
}

#menuItems li {
    padding: var(--menu-item-padding);
    font-size: var(--font-size);
    text-align: var(--text-align);
}

#menuItems li.active {
    background-color: rgba(var(--hover-bg-color-rgb), var(--hover-bg-opacity));
    color: var(--hover-text-color);
    border-left: var(--hover-border-size) solid var(--hover-border-color);
}

#menuItems li .fas {
    color: var(--icon-color, inherit); /* Par défaut la couleur du texte, sinon une couleur d'icône spécifique */
}

#menuItems li:not(.active):hover {
    background-color: rgba(var(--hover-bg-color-rgb), calc(var(--hover-bg-opacity) / 2)); /* Moins opaque au survol */
    color: var(--hover-text-color);
}
/* Ajoutez d'autres styles qui utilisent les variables ici */
`;
    zip.file("ui/style.css", uiCssContent.trim());

    // 4. ui/script.js (pour le NUI)
    const uiScriptContent = `
const menuContainer = document.getElementById('menuContainer');
const menuTitle = document.getElementById('menuTitle');
const menuVersion = document.getElementById('menuVersion');
const menuItemsList = document.getElementById('menuItems');
const dynamicStyles = document.getElementById('dynamic-styles');

let fullMenuData = {};
let currentMenuKey = "main";
let activeItemIndex = 0;

function hexToRgbA(hex, opacity) {
    if (!hex || hex.length < 7) return null; // Retourne null si hex est invalide
    let c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length === 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        return \`$${[(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',')}$\`; // Format RGB pour CSS custom properties
    }
    return null;
}

function applyStylesToRoot(styles) {
    const root = document.documentElement;

    root.style.setProperty('--main-color', styles.mainColor || "#3296FF");
    root.style.setProperty('--bg-color', styles.bgColor || "#0A0A0A");
    root.style.setProperty('--bg-opacity', styles.bgOpacity || 0.9);
    root.style.setProperty('--text-color', styles.textColor || "#F0F0F0");
    root.style.setProperty('--title-color', styles.titleColor || "#61DAFB");
    root.style.setProperty('--version-color', styles.versionColor || "#C0C0C0");
    root.style.setProperty('--font-size', styles.fontSize || "16px");
    root.style.setProperty('--header-title-size', styles.headerTitleSize || "24px");
    root.style.setProperty('--menu-border-radius', styles.menuBorderRadius || "4px");
    root.style.setProperty('--menu-border-size', styles.menuBorderSize || "1px");
    root.style.setProperty('--menu-border-color', styles.menuBorderColor || "#ffffff");
    root.style.setProperty('--menu-shadow-color', styles.menuShadowColor || "#000000");
    root.style.setProperty('--menu-shadow-size', styles.menuShadowSize || "20px");
    root.style.setProperty('--menu-font', styles.menuFont || "'Arial', sans-serif");
    root.style.setProperty('--text-align', styles.textAlign || "left");
    root.style.setProperty('--menu-padding', styles.menuPadding || "10px");
    root.style.setProperty('--menu-item-padding', styles.menuItemPadding || "12px");

    root.style.setProperty('--hover-bg-color', styles.hoverBgColor || "#3296FF");
    root.style.setProperty('--hover-bg-opacity', styles.hoverBgOpacity || 0.3);
    root.style.setProperty('--hover-text-color', styles.hoverTextColor || "#FFFFFF");
    root.style.setProperty('--hover-icon-color', styles.hoverIconColor || "#FFFFFF");
    root.style.setProperty('--hover-border-size', styles.hoverBorderSize || "4px");
    root.style.setProperty('--hover-border-color', styles.hoverBorderColor || "#3296FF");

    // Convertir les couleurs hex en RGB pour les opacités
    root.style.setProperty('--bg-color-rgb', hexToRgbA(styles.bgColor || "#0A0A0A", 1));
    root.style.setProperty('--hover-bg-color-rgb', hexToRgbA(styles.hoverBgColor || "#3296FF", 1));

    // Mettre à jour la police du body si elle change
    document.body.style.fontFamily = styles.menuFont || "Arial, sans-serif";

    // Charger les Google Fonts si nécessaire (logique simplifiée ici, l'éditeur gère l'ajout des <link>)
    if (styles.menuFont && !styles.menuFont.includes("Arial") && !styles.menuFont.includes("sans-serif")) {
        const fontName = styles.menuFont.split(',')[0].trim().replace(/\s/g, '+');
        if (!document.querySelector(\`link[href*="family=\${fontName}"]\`)) {
            const link = document.createElement('link');
            link.href = \`https://fonts.googleapis.com/css2?family=\${fontName}:wght@300;400;700&display=swap\`;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }
    }
}


function populateMenu(menuData, menuKey) {
    fullMenuData = menuData;
    currentMenuKey = menuKey;
    const currentMenu = fullMenuData[currentMenuKey];

    if (!currentMenu) {
        console.error(\`Menu '\${currentMenuKey}' non trouvé.\`);
        return;
    }

    menuTitle.textContent = currentMenu.title || currentMenuKey;
    menuVersion.textContent = currentMenu.version || '';
    menuItemsList.innerHTML = ''; // Clear previous items

    currentMenu.items.forEach((item, index) => {
        const li = document.createElement('li');
        li.dataset.index = index;
        li.innerHTML = \`<i class="fas fa-\${item.icon || 'circle'}" style="color: \${item.iconColor || 'inherit'};"></i> \${item.name || 'Undefined Item'}\`;
        
        if (item.isTitle) {
            li.classList.add('is-title');
        } else if (item.subMenu) {
            li.classList.add('has-submenu');
        }

        // Appliquer les styles spécifiques à l'élément s'ils existent
        if (item.textColor) li.style.color = item.textColor;
        if (item.bgColor) li.style.backgroundColor = item.bgColor;

        menuItemsList.appendChild(li);
    });

    activeItemIndex = 0;
    if (menuItemsList.children.length > 0) {
        // Skip title items for active selection
        while (currentMenu.items[activeItemIndex] && currentMenu.items[activeItemIndex].isTitle) {
            activeItemIndex++;
            if (activeItemIndex >= menuItemsList.children.length) {
                activeItemIndex = 0; // Reset if all are titles
                break;
            }
        }
        if (menuItemsList.children[activeItemIndex]) {
            menuItemsList.children[activeItemIndex].classList.add('active');
        }
    }
}

function updateActiveItem(newIndex) {
    const items = menuItemsList.children;
    if (items.length === 0) return;

    if (activeItemIndex !== -1 && items[activeItemIndex]) {
        items[activeItemIndex].classList.remove('active');
    }

    let nextIndex = newIndex;
    const currentMenu = fullMenuData[currentMenuKey];

    // Skip over title items
    while (currentMenu.items[nextIndex] && currentMenu.items[nextIndex].isTitle) {
        if (newIndex > activeItemIndex) { // Moving down
            nextIndex++;
            if (nextIndex >= items.length) nextIndex = 0; // Wrap around
        } else { // Moving up
            nextIndex--;
            if (nextIndex < 0) nextIndex = items.length - 1; // Wrap around
        }
        if (nextIndex === newIndex) break; // Prevent infinite loop if all items are titles
    }
    
    activeItemIndex = nextIndex;
    if (items[activeItemIndex]) {
        items[activeItemIndex].classList.add('active');
        items[activeItemIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}


function handleAction(item) {
    if (item.isTitle) return; // Cannot activate title items

    if (item.subMenu) {
        // Naviguer vers un sous-menu
        postMessageToParent('navigateMenu', { targetMenuKey: item.subMenu });
    } else if (item.action) {
        // Exécuter une action
        const actionPayload = { action: item.action, args: item.args || [], customLua: item.customLua };
        postMessageToParent('executeAction', actionPayload);
    }
}

function postMessageToParent(type, data) {
    if (window.invokeNative) { // Si c'est dans le client FiveM
        if (type === 'closeMenu') {
            fetch(\`https://${window.resourceName}/closeMenu\`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            }).then(resp => resp.json()).then(data => console.log('Menu fermé:', data));
        } else {
            fetch(\`https://${window.resourceName}/nuimessage\`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: type, payload: data }),
            });
        }
    } else { // Si c'est dans l'éditeur (iframe)
        window.parent.postMessage({ type: type, ...data }, '*');
    }
}


// Listen for messages from the NUI framework (or parent editor)
window.addEventListener('message', (event) => {
    const data = event.data;
    if (data.type === 'openMenu') {
        fullMenuData = data.menuData;
        currentMenuKey = data.currentMenu || "main";
        populateMenu(fullMenuData, currentMenuKey);
        applyStylesToRoot(fullMenuData.styles);
        menuContainer.classList.remove('menu-hidden');
        menuContainer.classList.add('menu-visible');
    } else if (data.type === 'closeMenu') {
        menuContainer.classList.remove('menu-visible');
        menuContainer.classList.add('menu-hidden');
        activeItemIndex = 0; // Reset active item on close
    } else if (data.type === 'navigateMenu') { // Message de l'éditeur pour naviguer
        fullMenuData = data.menuData;
        currentMenuKey = data.currentMenu || "main";
        populateMenu(fullMenuData, currentMenuKey);
        applyStylesToRoot(fullMenuData.styles);
    } else if (data.type === 'updateMenu') { // Message de l'éditeur pour mettre à jour le contenu
        fullMenuData = data.menuData;
        currentMenuKey = data.currentMenu || "main";
        populateMenu(fullMenuData, currentMenuKey);
        applyStylesToRoot(fullMenuData.styles);
    } else if (data.type === 'applyStyles') { // Message de l'éditeur pour appliquer les styles
        applyStylesToRoot(data.styles);
    } else if (data.type === 'keyPress') {
        // Gérer les pressions de touches (simulées par l'éditeur ou réelles dans FiveM)
        if (data.key === 'ArrowUp') {
            let prevIndex = activeItemIndex - 1;
            if (prevIndex < 0) prevIndex = menuItemsList.children.length - 1;
            updateActiveItem(prevIndex);
        } else if (data.key === 'ArrowDown') {
            let nextIndex = activeItemIndex + 1;
            if (nextIndex >= menuItemsList.children.length) nextIndex = 0;
            updateActiveItem(nextIndex);
        } else if (data.key === 'Enter') {
            const currentItem = fullMenuData[currentMenuKey].items[activeItemIndex];
            if (currentItem) {
                handleAction(currentItem);
            }
        } else if (data.key === 'Backspace') {
            if (currentMenuKey !== "main") {
                postMessageToParent('navigateMenu', { targetMenuKey: 'main' });
            } else {
                postMessageToParent('closeMenu', {});
            }
        }
    }
});

// Pour la simulation dans l'éditeur : initialisation
if (!window.invokeNative) { // Si ce n'est pas FiveM (donc l'éditeur)
    // Données de base pour l'aperçu initial dans l'éditeur
    fullMenuData = {
        main: {
            title: "Menu Principal",
            version: "v1.0",
            items: [
                { name: "Option 1", icon: "cog", type: "action", action: "printMessage", args: ["Salut!"] },
                { name: "Option 2 (Sous-menu)", icon: "car", type: "subMenu", subMenu: "vehicules_menu" },
                { name: "Titre Exemple", isTitle: true },
                { name: "Fermer le menu", icon: "times", type: "action", action: "closeMenu" }
            ]
        },
        vehicules_menu: {
            title: "Menu Véhicules",
            items: [
                { name: "Spawn Voiture", icon: "car", type: "action", action: "spawnVehicle", args: ["t20"] },
                { name: "Réparer", icon: "wrench", type: "action", action: "repairCurrentVehicle" },
                { name: "Retour", icon: "arrow-left", type: "action", action: "goBack" }
            ]
        },
        styles: {
            mainColor: "#3296FF",
            bgColor: "#0A0A0A",
            bgOpacity: 0.9,
            textColor: "#F0F0F0",
            titleColor: "#61DAFB",
            versionColor: "#C0C0C0",
            fontSize: "16px",
            headerTitleSize: "24px",
            menuBorderRadius: "4px",
            menuBorderSize: "1px",
            menuBorderColor: "#ffffff",
            menuShadowColor: "#000000",
            menuShadowSize: "20px",
            menuFont: "Arial, sans-serif",
            textAlign: "left",
            menuPadding: "10px",
            menuItemPadding: "12px",
            hoverBgColor: "#3296FF",
            hoverBgOpacity: 0.3,
            hoverTextColor: "#FFFFFF",
            hoverIconColor: "#FFFFFF",
            hoverBorderSize: "4px",
            hoverBorderColor: "#3296FF"
        }
    };
    populateMenu(fullMenuData, currentMenuKey);
    applyStylesToRoot(fullMenuData.styles);
    menuContainer.classList.add('menu-visible'); // Rendre visible dans l'éditeur
}
`;
    zip.file("ui/script.js", uiScriptContent.trim());

    // 5. client.lua
    const clientLuaContent = `
local opened = false
local menuData = {}
local currentMenuKey = "main" -- Default to main menu

-- Écouteur pour ouvrir le menu depuis le serveur (si vous l'utilisez)
RegisterNetEvent('${cleanResourceName}:openMenu')
AddEventHandler('${cleanResourceName}:openMenu', function(data, initialMenu)
    menuData = data
    currentMenuKey = initialMenu or "main"
    SendNuiMessage(json.encode({
        type = 'openMenu',
        menuData = menuData,
        currentMenu = currentMenuKey
    }))
    SetNuiFocus(true, true)
    opened = true
end)

-- Écouteur pour fermer le menu (peut être appelé par une action du menu)
RegisterNetEvent('${cleanResourceName}:closeMenu')
AddEventHandler('${cleanResourceName}:closeMenu', function()
    SendNuiMessage(json.encode({
        type = 'closeMenu'
    }))
    SetNuiFocus(false, false)
    opened = false
end)

-- Écouteur NUI pour les messages de l'interface utilisateur
RegisterNUICallback('nuimessage', function(data, cb)
    local type = data.type
    local payload = data.payload

    if type == 'navigateMenu' then
        currentMenuKey = payload.targetMenuKey
        SendNuiMessage(json.encode({
            type = 'updateMenu',
            menuData = menuData,
            currentMenu = currentMenuKey
        }))
    elseif type == 'executeAction' then
        local action = payload.action
        local args = payload.args
        local customLua = payload.customLua

        if action == 'closeMenu' then
            TriggerEvent('${cleanResourceName}:closeMenu')
        elseif action == 'goBack' then
            -- Logique pour revenir au menu parent, nécessite de suivre l'historique
            -- Pour l'instant, on revient au "main" si on n'est pas déjà dessus.
            -- Une implémentation plus robuste maintiendrait un historique de navigation.
            if currentMenuKey ~= "main" then
                currentMenuKey = "main" -- Ou la logique de retour au parent réel
                SendNuiMessage(json.encode({
                    type = 'updateMenu',
                    menuData = menuData,
                    currentMenu = currentMenuKey
                }))
            else
                TriggerEvent('${cleanResourceName}:closeMenu')
            end
        elseif action == 'printMessage' then
            TriggerEvent('chat:addMessage', { args = { '[Menu]', args[1] or 'Message vide.' } })
        elseif action == 'spawnVehicle' then
            -- Nécessite une fonction côté client pour le spawn de véhicule
            -- Exemple de fonction client pour ESX, ou à adapter à votre framework
            local model = GetHashKey(args[1])
            if IsModelInCdimage(model) and IsModelAVehicle(model) then
                RequestModel(model)
                while not HasModelLoaded(model) do
                    Wait(0)
                end
                local ped = PlayerPedId()
                local coords = GetOffsetFromEntityInWorldCoords(ped, 0.0, 5.0, 0.0)
                local heading = GetEntityHeading(ped)
                local vehicle = CreateVehicle(model, coords.x, coords.y, coords.z, heading, true, false)
                SetPedIntoVehicle(ped, vehicle, -1)
                SetEntityAsNo longerNeeded(vehicle)
                SetModelAsNo longerNeeded(model)
                TriggerEvent('${cleanResourceName}:closeMenu') -- Fermer le menu après l'action
            else
                TriggerEvent('chat:addMessage', { args = { '[Menu]', 'Modèle de véhicule invalide: ' .. (args[1] or 'N/A') } })
            end
        elseif action == 'repairCurrentVehicle' then
            local ped = PlayerPedId()
            if IsPedInAnyVehicle(ped, false) then
                local vehicle = GetVehiclePedIsIn(ped, false)
                SetVehicleFixed(vehicle)
                SetVehicleDirtLevel(vehicle, 0.0)
                TriggerEvent('chat:addMessage', { args = { '[Menu]', 'Votre véhicule a été réparé.' } })
                TriggerEvent('${cleanResourceName}:closeMenu')
            else
                TriggerEvent('chat:addMessage', { args = { '[Menu]', 'Vous n\'êtes dans aucun véhicule.' } })
            end
        elseif action == 'customAction' and customLua then
            -- Exécuter le code Lua personnalisé
            -- ATTENTION: L'exécution de code arbitraire côté client peut être dangereuse.
            -- Assurez-vous que ce code provient d'une source fiable.
            print('Exécution d\'action personnalisée côté client:')
            load(customLua)() -- Charge et exécute le code Lua
            TriggerEvent('${cleanResourceName}:closeMenu') -- Fermer le menu après l'action personnalisée
        else
            print('Action non reconnue ou sans implémentation client: ' .. action)
        end
    end
    cb('ok') -- Répondre à la requête NUI
end)

-- Gérer les touches pour la navigation dans le menu
Citizen.CreateThread(function()
    while true do
        Citizen.Wait(0)
        if opened then
            if IsControlJustReleased(0, 172) then -- INPUT_VEH_HEADLIGHT (touche Z / Haut)
                SendNuiMessage(json.encode({ type = 'keyPress', key = 'ArrowUp' }))
            elseif IsControlJustReleased(0, 173) then -- INPUT_VEH_EXIT (touche S / Bas)
                SendNuiMessage(json.encode({ type = 'keyPress', key = 'ArrowDown' }))
            elseif IsControlJustReleased(0, 176) then -- INPUT_VEH_HANDBRAKE (touche E / Entrée)
                SendNuiMessage(json.encode({ type = 'keyPress', key = 'Enter' }))
            elseif IsControlJustReleased(0, 177) then -- INPUT_VEH_DUCK (touche Retour arrière / Echap)
                SendNuiMessage(json.encode({ type = 'keyPress', key = 'Backspace' }))
            end
        end
    end
end)

-- Commande de test pour ouvrir le menu (peut être retirée en production)
RegisterCommand('open${cleanResourceName}', function()
    TriggerEvent('${cleanResourceName}:openMenu', menuData, 'main') -- Utilisez vos données de menu complètes ici
end)
`;
    zip.file("client.lua", clientLuaContent.trim());

    // 6. server.lua
    const serverLuaContent = `
-- Exemple pour le serveur (peut être vide si vous n'avez pas de logique serveur)
-- Vous pouvez déclencher des actions serveur ici si nécessaire, par exemple
-- en recevant un message NUI du client.

RegisterNetEvent('nuimessage:server')
AddEventHandler('nuimessage:server', function(data)
    local source = source
    local type = data.type
    local payload = data.payload

    if type == 'myServerAction' then
        print('Action serveur reçue: ' .. payload.someArg)
        -- Faire quelque chose sur le serveur
    end
end)

-- Exemple d'événement que le client pourrait déclencher pour demander une action serveur
-- TriggerServerEvent('nuimessage:server', { type = 'myServerAction', payload = { someArg = 'hello from client' } })
`;
    zip.file("server.lua", serverLuaContent.trim());

    // Générer le ZIP et le télécharger
    zip.generateAsync({ type: "blob" }).then(function (content) {
        saveAs(content, `${cleanResourceName}.zip`);
        alert("Ressource FiveM générée et téléchargée !");
    });
}

// --- Initialisation ---

document.addEventListener('DOMContentLoaded', () => {
    // Initialisation des données de menu si elles sont vides
    if (Object.keys(fullMenuData).length === 0) {
        fullMenuData = {
            main: {
                title: "Menu Principal",
                version: "v1.0",
                items: [
                    { name: "Option 1", icon: "cog", type: "action", action: "printMessage", args: ["Salut du menu!"] },
                    { name: "Aller au sous-menu", icon: "arrow-right", type: "subMenu", subMenu: "test_menu" },
                    { name: "Titre d'exemple", isTitle: true },
                    { name: "Fermer le menu", icon: "times", type: "action", action: "closeMenu" }
                ]
            },
            test_menu: {
                title: "Sous-Menu Test",
                items: [
                    { name: "Retour au principal", icon: "arrow-left", type: "action", action: "goBack" },
                    { name: "Spawn Police Car", icon: "taxi", type: "action", action: "spawnVehicle", args: ["police"] }
                ]
            },
            styles: {
                mainColor: "#3296FF",
                bgColor: "#0A0A0A",
                bgOpacity: 0.9,
                textColor: "#F0F0F0",
                titleColor: "#61DAFB",
                versionColor: "#C0C0C0",
                fontSize: "16px",
                headerTitleSize: "24px",
                menuBorderRadius: "4px",
                menuBorderSize: "1px",
                menuBorderColor: "#ffffff",
                menuShadowColor: "#000000",
                menuShadowSize: "20px",
                menuFont: "Arial, sans-serif",
                textAlign: "left",
                menuPadding: "10px",
                menuItemPadding: "12px",
                hoverBgColor: "#3296FF",
                hoverBgOpacity: 0.3,
                hoverTextColor: "#FFFFFF",
                hoverIconColor: "#FFFFFF",
                hoverBorderSize: "4px",
                hoverBorderColor: "#3296FF"
            }
        };
    }

    // Assignation des gestionnaires d'événements
    mainColorInput.addEventListener('input', updateVisualOptions);
    bgColorInput.addEventListener('input', updateVisualOptions);
    bgOpacityInput.addEventListener('input', () => {
        bgOpacityValueSpan.textContent = bgOpacityInput.value + '%';
        updateVisualOptions();
    });
    textColorInput.addEventListener('input', updateVisualOptions);
    titleColorInput.addEventListener('input', updateVisualOptions);
    versionColorInput.addEventListener('input', updateVisualOptions);
    fontSizeInput.addEventListener('input', updateVisualOptions);
    headerTitleSizeInput.addEventListener('input', updateVisualOptions);
    menuBorderRadiusInput.addEventListener('input', updateVisualOptions);
    menuBorderSizeInput.addEventListener('input', updateVisualOptions);
    menuBorderColorInput.addEventListener('input', updateVisualOptions);
    menuShadowColorInput.addEventListener('input', updateVisualOptions);
    menuShadowSizeInput.addEventListener('input', updateVisualOptions);
    menuFontInput.addEventListener('input', updateVisualOptions);
    textAlignSelect.addEventListener('change', updateVisualOptions);
    menuPaddingInput.addEventListener('input', updateVisualOptions);
    menuItemPaddingInput.addEventListener('input', updateVisualOptions);

    hoverBgColorInput.addEventListener('input', updateVisualOptions);
    hoverBgOpacityInput.addEventListener('input', () => {
        hoverBgOpacityValueSpan.textContent = hoverBgOpacityInput.value + '%';
        updateVisualOptions();
    });
    hoverTextColorInput.addEventListener('input', updateVisualOptions);
    hoverIconColorInput.addEventListener('input', updateVisualOptions);
    hoverBorderSizeInput.addEventListener('input', updateVisualOptions);
    hoverBorderColorInput.addEventListener('input', updateVisualOptions);


    currentMenuSelect.addEventListener('change', loadMenuForEditing);

    // Événements pour la configuration de l'élément sélectionné
    itemNameInput.addEventListener('input', updateSelectedMenuItem);
    itemIconInput.addEventListener('input', updateSelectedMenuItem);
    itemIconColorInput.addEventListener('input', updateSelectedMenuItem);
    itemTextColorInput.addEventListener('input', updateSelectedMenuItem);
    itemBgColorInput.addEventListener('input', updateSelectedMenuItem);
    itemIsTitleCheckbox.addEventListener('change', () => {
        toggleItemType();
        updateSelectedMenuItem(); // Appliquer le changement immédiatement
    });
    itemTypeSelect.addEventListener('change', toggleActionFields);
    itemTypeSelect.addEventListener('change', updateSelectedMenuItem); // Important pour appliquer subMenu/action
    itemSubMenuSelect.addEventListener('change', updateSelectedMenuItem);
    itemActionSelect.addEventListener('change', toggleActionArgs);
    itemActionSelect.addEventListener('change', updateSelectedMenuItem);
    actionArg1Input.addEventListener('input', updateSelectedMenuItem);
    customActionLuaTextarea.addEventListener('input', updateSelectedMenuItem);


    // Événements pour l'éditeur JSON brut
    document.getElementById('loadJsonBtn').addEventListener('click', loadJsonFromRawEditor);
    document.getElementById('copyJsonBtn').addEventListener('click', copyCurrentJson);
    document.getElementById('generateResourceBtn').addEventListener('click', exportResource);
    document.getElementById('addNewMenuBtn').addEventListener('click', addNewMenu);
    document.getElementById('deleteMenuBtn').addEventListener('click', deleteCurrentMenu);
    document.getElementById('addNewMenuItemBtn').addEventListener('click', addNewMenuItem);


    // Initialisation de l'UI
    applyVisualOptionsToInputs();
    populateMenuSelect();
    loadMenuForEditing();
    updateRawJsonEditor();
    updatePreview(); // Assurez-vous que l'aperçu se charge au démarrage
});