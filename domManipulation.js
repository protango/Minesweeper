/**
 * Creates a new HTMLElement and adds it to a parent
 * @param {Element} parent The parent element
 * @param {string} type The type of new element
 * @param {string[]|string} [classes] Class or array of classes to be applied to the new element
 * @param {string} [id] The ID of the new element
 * @returns {HTMLElement} The new HTMLElement
 */
export function createElement(parent, type, classes, id) {
    let elem = document.createElement(type);
    if (Array.isArray(classes)) elem.classList.add(...classes);
    else if (classes) elem.classList.add(classes);
    if (id) elem.id = id;
    parent.appendChild(elem);
    return elem;
}

/**
 * Query selector alias
 * @param {string} queryString 
 * @param {Element} [parent]
 */
export function qs(queryString, parent) {
    if (!parent) return document.querySelector(queryString);
    else return parent.querySelector(queryString);
}

/**
 * Query selector all alias
 * @param {string} queryString 
 * @param {Element} [parent]
 */
export function qsa(queryString, parent) {
    if (!parent) return document.querySelectorAll(queryString);
    else return parent.querySelectorAll(queryString);
}

/**
 * Removes all element children
 * @param {Element} elem 
 */
export function clearChildren(elem) {
    while (elem.firstChild) {
        elem.firstChild.remove();
    }
}
