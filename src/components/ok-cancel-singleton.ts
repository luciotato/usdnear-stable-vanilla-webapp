import * as d from "../util/document.js"

export let confirmFunction: Function | undefined;

export let cancelFunction: Function | undefined;

//-----------------
// page init
//-----------------
let okCancelRow: d.El
let confirmBtn: d.El
let cancelBtn: d.El

export function init() {

    okCancelRow = new d.El(".ok-cancel")
    confirmBtn = new d.El("button#ok")
    cancelBtn = new d.El("button#cancel")
    confirmBtn.onClick(confirmClicked);
    cancelBtn.onClick(cancelClicked);
}

export function hide() {
    okCancelRow.hide()
}

export function show_onOK(onOK: Function, onCancel?:Function) {
    confirmFunction = onOK
    cancelFunction = onCancel
    okCancelRow.show()
    enable()
}
export function disable() {
    confirmBtn.disabled = true
    cancelBtn.disabled = true
}
export function enable() {
    confirmBtn.disabled = false
    cancelBtn.disabled = false
}

//--------------------------------
//--- OK Button clicked Handler --
//--------------------------------
function confirmClicked(ev: Event) {
    try {
        if (confirmFunction) confirmFunction(ev);
    }
    catch (ex) {
        d.showErr(ex.message);
    }
    finally {
    }
}

//------------------------------------
//--- CANCEL button clicked Handler --
//------------------------------------
function cancelClicked(ev: Event) {
    okCancelRow.hide()
    try {
        if (cancelFunction) cancelFunction(ev);
    }
    catch (ex) {
        d.showErr(ex.message);
    }
    finally {
    }
}
