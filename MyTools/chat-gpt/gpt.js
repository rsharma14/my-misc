
let gpt = 0;
let eventSource;
let conversationIdx = 0;
let resp = '';
let chatHistory = parse(localStorage.getItem("chatHistory"));
chatHistory = chatHistory ? chatHistory : [];
var query, token, cid;
var conversation_id = "";
var parent_message_id = "";
let gpts = ["O", "C"];
const PARENT_URL = "https://merawork.in/api/backapp-service";
const loginUrl = `${PARENT_URL}/auth/v1/public/login`;

document.addEventListener('DOMContentLoaded', function () {
    onDocLoad();
});

function onDocLoad() {

    chatHistory.forEach(h => {
        addToHistoryDiv(h);
    });

    document.getElementById("query").addEventListener("keydown", function (event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            clickCB();
        }
    });
}

function addToHistoryDiv(h) {
    var a = createEl("a", null, "nodec historyAnchor");
    a.href = "javascript:void(0)";
    a.onclick = function () { pickHistoryChat(this, h); };
    a.appendChild(document.createTextNode(h[0]));
    document.getElementById("chatHistory").prepend(a);
}
function addToHistory(q) {
    let h = [q, conversation_id, parent_message_id];
    chatHistory.push(h);
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    addToHistoryDiv(h);
}

function pickHistoryChat(e, q) {
    document.getElementById("query").value = q[0];
    conversation_id = q[1];
    parent_message_id = q[2];
    clickCB();
}
function clickCB() {
    document.getElementById("toggle-checkbox").click();
}
function submitQuery(e) {

    if (!e.checked) {
        closeStream();
        return;
    }
    query = document.getElementById("query").value;
    token = document.getElementById("token").value;
    cid = document.getElementById("cid").value;
    if (!query || query.trim().length <= 0) {
        clickCB();
        return;
    }

    createConversionBlock(++conversationIdx);
    insertQuery(query);
    scrollToBottom("content");

    document.getElementById(`data_${conversationIdx}`).innerHTML = '<div class="blink_me">Processing...</div>';
    if (gpt === 0) {
        console.log("openaiGPT");
        openaiGPT(query, token, cid);
    } else if (gpt === 1) {
        console.log("converseGPT");
        converseGPT(query);
    }

    errorStream();

}

function onComplete(q) {
    clickCB();
    addToHistory(query);
    markedSyntax();

}
function openaiGPT(q, t, c) {

    eventSource = new EventSource(`${PARENT_URL}/gpt/openai-gpt?q=${encodeURIComponent(q)}&token=${t}&conversation_id=${conversation_id}&parent_message_id=${parent_message_id}`);
    eventSource.addEventListener("message", (e) => {
        scrollToBottom("content");

        let p = parse(e.data);
        //console.log(p)
        if (!p) return;

        if (p.is_completion) {
            conversation_id = p.conversation_id;
            parent_message_id = p.id;
            onComplete();
        } else {
            resp = p.message?.content?.parts.join();
            document.querySelector(`#data_${conversationIdx}`).innerHTML = escapeHtml(resp);
            conversation_id = p.conversation_id;
            parent_message_id = p.message.id;
        }
    });
}

function converseGPT(q) {
    eventSource = new EventSource(`${PARENT_URL}/gpt/converse-gpt?q=${encodeURIComponent(q)}`);
    let i = 0;
    eventSource.addEventListener("message", (e) => {
        //console.log(e);
        scrollToBottom("content");
        if (i++ == 0)
            document.querySelector(`#data_${conversationIdx}`).innerHTML = '';

        if (e.data.indexOf("DONE") > 0) {
            conversation_id = "";
            parent_message_id = "";
            onComplete();
        } else {
            let a = JSON.parse(e.data);
            resp = a.choices.map(a => a.delta.content).join();
            document.querySelector(`#data_${conversationIdx}`).innerHTML += escapeHtml(resp);
        }
        //console.log(resp)

    });
}
function errorStream() {
    //console.log("error stream");
    eventSource.addEventListener("error", (e) => {
        onComplete();
        document.querySelector(`#data_${conversationIdx}`).innerHTML += "error";
        console.log(e);

    });

}
function closeStream() {
    if (!eventSource) return;
    //console.log("closed stream");
    eventSource.close();
    eventSource = null;
}

function scrollToBottom(id) {
    const messageContainer = document.getElementById(id);
    messageContainer.scrollTop = messageContainer.scrollHeight;

}
function parse(json) {
    try {
        return JSON.parse(json);
    } catch (err) { }
    return null;
}
function markedSyntax(e) {
    let id = `data_${conversationIdx}`;
    const renderer = new marked.Renderer();
    renderer.code = (code, language) => {
        const lang = language && hljs.getLanguage(language);
        const cd = lang ? hljs.highlight(code, { language }).value : hljs.highlightAuto(code).value;
        return `<div><div class="code-header"><span style="margin-right: auto;">${language}</span><span style="margin-left: auto;"><a href="javascript:void(0)" onclick="copyBlock(this)" class="nodec">copy &#10064;</a></span></div><pre><code class="hljs ${language}">${cd}</code></pre></div>`;
    }
    marked.setOptions({
        renderer: renderer
    });
    document.getElementById(`conv_${conversationIdx}`).classList.toggle("whitespace-pre-wrap");
    let rawText = document.getElementById(id).innerHTML;
    document.getElementById(id).innerHTML = marked.parse(htmlDecode(rawText));


}
function copyBlock(token) {
    //console.log(token);
    if (document.selection) {
        // IE
        var range = document.body.createTextRange();
        range.moveToElementText(document.getElementById(token));
        range.select();
    } else if (window.getSelection) {
        var range = document.createRange();
        range.selectNode(token.parentNode.parentNode.nextSibling);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        document.execCommand("copy");
    }

}
function createConversionBlock(id) {

    var convDiv = createEl("div", "conv_" + id, "conversation whitespace-pre-wrap break-words");
    var queryDiv = createEl("div", "query_" + id, "query");
    var dataDiv = createEl("div", "data_" + id, "conversation");

    convDiv.appendChild(queryDiv);
    convDiv.appendChild(dataDiv);
    convDiv.appendChild(createEl("hr"));

    var targetElement = document.getElementById("content");
    targetElement.appendChild(convDiv);

}
function insertQuery(query) {
    document.getElementById(`query_${conversationIdx}`).innerHTML =
        `<strong class="gpt-name">${gpts[gpt]}</strong> ${escapeHtml(query)}`;
    document.getElementById(`query`).value = '';
}
function createEl(el, id, className) {
    var elm = document.createElement(el);
    if (id) elm.id = id;
    if (className) elm.className = className;

    return elm;


}
const escapeHtml = (txt) => {
    return txt?.replaceAll('&', '&amp;').replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;').replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}
function htmlDecode(input) {
    var e = document.createElement('textarea');
    e.innerHTML = input;
    return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
}