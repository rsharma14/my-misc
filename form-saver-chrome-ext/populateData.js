
chrome.runtime.sendMessage({
    action: "onPopulate",
    source: onPopulate()
});

function onPopulate() {
    formInputs = [], formInputs_ = [], storedForm = '';

    if (localStorage.getItem(location.href)) {
        storedForm = JSON.parse(localStorage.getItem(location.href))
        let bodyNode = document.getElementsByTagName('body')[0];
        iterateChildren(bodyNode, 1);
    }
    return "localStorage.getItem('form')";
}

function iterateChildren(nodes, type) {

    if (nodes == null) return;
    if (nodes.childElementCount > 0) {
        for (let child of nodes.children) {
            iterateChildren(child, type);
        }
    } else {
        let el = processStoring(nodes);
        if (el && type == 1)
            processFilling(el);
    }
}
function processFilling(node) {
    let attrVal = getAttrDertails(node);
    attrVal=attrVal.id?{id:attrVal.id}:attrVal;
    let fill = storedForm.find(f => JSON.stringify(f.el) === JSON.stringify(attrVal));
    //TBD: compare el attr if matches >70%
    if (fill) {
        switch (fill.type.toUpperCase()) {
            case 'CHECKBOX':
            case 'RADIO':
                $(node).prop('checked', fill.value === true ? true : false);
                break;
            default: $(node).val(fill.value); break;
        }
        //TBD: trigger element                
        $(node).trigger('change');
        storedForm.splice(fill,1);

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
        formInputs.push({ el: getAttrDertails(el), type: type, value: val });
        formInputs_.push(el);
        return el;
    }

}
function getAttrDertails(node) {
    let attrVal = {};
    node.getAttributeNames().map((a, b) => {
        attrVal[a] = node.getAttribute(a);
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
