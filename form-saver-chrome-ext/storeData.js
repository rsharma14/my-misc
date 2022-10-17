
chrome.runtime.sendMessage({
    action: "storeData",
    source: storeData()
});


function storeData() {
    formInputs = [], formInputs_ = [], idx = 0;
    let bodyNode = document.getElementsByTagName('body')[0];
    iterateChildren(bodyNode, 0);
    localStorage.setItem(location.href, JSON.stringify(formInputs));
    formInputs = [], formInputs_ = [];
    return "localStorage.getItem('form')"
}

function iterateChildren(nodes, type) {

    if (nodes == null) return;
    if (nodes.childElementCount > 0) {
        for (let child of nodes.children) {
            iterateChildren(child, type);
        }
    } else {
        processStoring(nodes);
    }
}

function processStoring(node) {
    let sw = node.getAttribute('type');
    sw = sw ? sw : node.tagName;
    let el = node, type, val, valid = true;
    switch (sw.toUpperCase()) {
        case 'TEXT':
        case 'NUMBER':
        case 'PASSWORD':
        case 'TEXTAREA':
        case 'HIDDEN':
        case 'DATE':
        case 'EMAIL':
        case 'TEL':
        case 'RANGE':

            val = node.value;
            type = node.type;
            break;
        case 'CHECKBOX':
        case 'RADIO':
            val = node.checked;
            type = node.type;
            break;
        case 'OPTION':
            el = node.parentElement;
            val = Array.from(node.parentElement.selectedOptions).map(({ value }) => value);
            type = 'select';
            break;
        case '': break;
        default: valid = false; break;
    }
    if (valid && !formInputs_.includes(el)) {
        formInputs.push({ id: idx++, el: getAttrDertails(el), type: type, value: val });
        formInputs_.push(el);
        return el;
    }

}
function getAttrDertails(node) {
    let attrVal = {};
    node.getAttributeNames().every((a, b) => {
        if (a === 'id') {
            attrVal = [];
            attrVal[a] = node.getAttribute(a);
            return false;
        }
        attrVal[a] = node.getAttribute(a);
        return true;
    });
    return sortObjectByKey(attrVal);
}

function sortObjectByKey(o) {
    let sorted = {},
        keys = Object.keys(o).sort();
    for (let k of keys) {
        sorted[k] = o[k];
    }
    return sorted;
}
