import { getAllAttributes } from "../../db/services/attributeService.js";
import { DEFAULT_FILTERS_MENU } from "../constants/filters.js";

export async function createFiltersMenuList() {
    const attributes = await getAllAttributes();

    if (!attributes) return DEFAULT_FILTERS_MENU;

    DEFAULT_FILTERS_MENU.map(element => {
        if (attributes[element.key])
            element.options = attributes[element.key];
    });
};

export function getFilterByKey(key) {
    return DEFAULT_FILTERS_MENU.find(filter => filter.key === key);
};

export function buildFilterText(listAttr, filterName, filterInventory) {
    let text = "";

    if (listAttr === undefined || listAttr === "") {
        text = `Please write a ${filterName.toLowerCase()}`;
    } else {
        text = `Please choose a ${filterName.toLowerCase()}`;
    }

    if (filterInventory !== null) {
        text += `\nYou chose: ${filterInventory}`;
    }

    return text;
};

export function manageFilterSelect(inventorsFilter, filterIndex) {
    const isSelected = inventorsFilter ? inventorsFilter === filterIndex : false;

    if (isSelected) {
        return null;
    } else {
        return filterIndex;
    }
};

export function wasChange(baseObject, userInvent) {
    return Object.keys(baseObject).some(key =>
        key !== "id" && baseObject[key] !== userInvent[key]
    );
};

export function cleanLastFilter(lastText) {
    if (lastText.includes("You write:")) return lastText.replace(/You write: .*/, '');
    return lastText;
};