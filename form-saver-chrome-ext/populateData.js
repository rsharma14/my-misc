
chrome.runtime.sendMessage({
    action: "onPopulate",
    source: onPopulate()
});

function onPopulate() {
    formInputs = [], formInputs_ = [], storedForm = '',idx = 0;

    if (localStorage.getItem("StoreForm_"+location.href)) {
        storedForm = JSON.parse(localStorage.getItem("StoreForm_"+location.href))
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
    let fill = storedForm.find(f => findElement(f, getAttrDertails(node)));
    if (fill) {
        let trigger = true;
        switch (fill.type.toUpperCase()) {
            case 'CHECKBOX':
            case 'RADIO':
                $(node).prop('checked', fill.value === true ? true : trigger = false);
                break;
            default:
                $(node).val(fill.value);
                break;
        }
        if (trigger) {
            //jquery not worked
            node.dispatchEvent(new Event("input"));
            node.dispatchEvent(new Event('change'));
        }

        storedForm.splice(fill, 1);
    }
}
function findElement(storedEl, attrVal) {
    if (attrVal.id === storedEl.id
        || JSON.stringify(storedEl.el) === JSON.stringify(attrVal) //100%
        || calPercentage(Object.keys(storedEl.el), Object.keys(attrVal)) >= 90
        || calPercentage(Object.keys(storedEl.el), Object.keys(attrVal)) >= 80
        || calPercentage(Object.keys(storedEl.el), Object.keys(attrVal)) >= 70

    )
        return true;
    return false;
}
function calPercentage(ori, cur) {
    const cur_ = ori.filter(obj => {
        return cur.indexOf(obj) !== -1;
    });
    //TBD:need to check attr value as well
    ori = ori.length, cur = cur_.length;
    //console.log(cur == ori ? 100 : (Math.abs(cur - ori) / ori) * 100);
    return (cur == ori ? 100 : (Math.abs(cur - ori) / ori) * 100);

}
function processStoring(node) {
    let sw = node.getAttribute('type');
    let tag = node.tagName;
    sw = sw ? sw : (tag.toUpperCase() === 'INPUT' ? 'text' : tag);
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
        formInputs.push({ id: el.id ? el.id : idx++, el: getAttrDertails(el), type: type, value: val });
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
