import * as c from "../util/conversions.js"
import * as d from "../util/document.js"

import * as okCancel from "../components/ok-cancel-singleton.js"

import { wallet } from "../wallet-api/wallet.js"
import { usdnearStable } from "../contracts/usdnearStable.js"

import { ExtendedAccountData } from "../data/extended-account.js"

import {show as Dashboard_show} from "./dashboard.js"

import type { AnyElement, ClickHandler } from "../util/document.js"
import { isValidAmount } from "../util/valid.js"
import { metaPool } from "../contracts/metapool.js"


//-----------------
// page init
//-----------------
function init() {

    const backLink = new d.El("#my-account.page .back-link");
    backLink.onClick(Dashboard_show);

    d.onClickId("send-usdnear", sendUsdnearClicked);
    d.onClickId("refresh-account", refreshAccountClicked);

    d.onClickId("deposit", depositClicked);
    d.onClickId("withdraw", withdrawClicked);

    d.onClickId("take-loan", takeLoanClicked);
    d.onClickId("repay", repayClicked);

    showButtons()

}

//slippage slider moved, adjust all numbers
function repaySlippageMoved(ev:Event){
    const slippage = Number((ev.target as HTMLInputElement).value)/10
    slippageDisplay(slippage)
}
function slippageDisplay(slippage:number){

    d.qs("#repay-slippage-display").innerText = slippage + ""

    const repaystnear = c.toNum(d.qs("#repay-confirmation-stnear").innerText)
    const originalNear=c.toNum(d.qs("#original-repay-confirmation-near").innerText)
    const newNear = originalNear * (1-slippage/100)
    d.qs("#repay-confirmation-near").innerText = c.toStringDec(newNear)

}


//-----------------
export async function show() {
    try {
        init();
        await getAccountData()
        showAccountData()
        d.showPage("my-account")
    }
    catch (ex) {
        d.showErr(ex.message);
    }
}

let cachedAccountData: ExtendedAccountData;
let cachedAccountExpire = 0;
let cachedAccountId = ""

async function getAccountData(): Promise<ExtendedAccountData> {

    wallet.checkConnected()
    cachedAccountExpire = 0 //cache disabled
    if (cachedAccountId != wallet.accountId || Date.now() > cachedAccountExpire) {
        const accInfo = await usdnearStable.get_account_info(wallet.accountId);
        cachedAccountData = new ExtendedAccountData(accInfo);
        cachedAccountId = wallet.accountId;
        cachedAccountExpire = Date.now() + 60 * 1 * 1000; //1 min
    }

    return cachedAccountData;
}

async function forceRefreshAccountData() {
    cachedAccountExpire = 0
    return await getAccountData()
}

function showAccountData() {
    d.applyTemplate("my-account-info", "my-account-template", cachedAccountData)
}


type StateResult = {
    amount: string; // "27101097909936818225912322116"
    block_hash: string; //"DoTW1Tpp3TpC9egBe1xFJbbEb6vYxbT33g9GHepiYL5a"
    block_height: number; //20046823
    code_hash: string; //"11111111111111111111111111111111"
    locked: string; //"0"
    storage_paid_at: number; // 0
    storage_usage: number; //2080
}


function onCancelHandler(){
    showButtons()
}

function ifWalletConnectedShowSubPage(subPageId: string, onOKHandler: ClickHandler) {
    try {
        d.hideErr()
        wallet.checkConnected()
        d.showSubPage(subPageId)
        okCancel.show_onOK(onOKHandler,onCancelHandler)
    }
    catch (ex) {
        d.showErr(ex.message)
    }

}


//----------------------
async function withdrawClicked() {
    await forceRefreshAccountData()
    ifWalletConnectedShowSubPage('withdraw-subpage', performWithdraw)
    d.byId("max-withdraw").innerText = c.toStringDec(cachedAccountData.stnear - cachedAccountData.locked_stnear)
}


//----------------------
function depositClicked() {
    ifWalletConnectedShowSubPage('deposit-subpage', performDeposit)
    const amountText = d.qs("#deposit-amount")
    amountText.value = "100"
    amountText.el.focus()
}


//----------------------
function takeLoanClicked() {
    try {

        ifWalletConnectedShowSubPage("take-loan", performTakeLoan)

    } catch (ex) {
        d.showErr(ex.message)
    }
}


//----------------------
async function performTakeLoan() {
    okCancel.disable();
    d.showWait()
    try {

        const amountToTake = d.getNumber("input#take-loan-amount");
        if (amountToTake < 5) throw Error("Stake at least 5 Near");

        await usdnearStable.take_loan(amountToTake)

        //refresh acc info
        await refreshAccount()

        d.showSuccess("You now have "+c.toStringDec(amountToTake)+" more USDNEAR")
        showButtons()

    }
    catch (ex) {
        d.showErr(ex.message)
    }
    finally {
        d.hideWait()
        okCancel.enable();
    }
}


//----------------------
function repayClicked(){
    try {

        const acc = cachedAccountData
        d.byId("repay-usdnear-max").innerText = c.toStringDec(acc.outstanding_loans_usdnear)

        ifWalletConnectedShowSubPage("repay-stnear", repayOKClicked)

    } catch (ex) {
        d.showErr(ex.message)
    }
}
async function repayOKClicked() {
    try {
        const info = cachedAccountData
        const usdnearToRepay = d.getNumber("input#repay-amount")

        ifWalletConnectedShowSubPage("repay-confirmation", performRepay)

    } catch (ex) {
        d.showErr(ex.message)
    }
}
async function performRepay() {
    okCancel.disable();
    d.showWait()
    try {

        const usdnearToRepay = d.getNumber("input#repay-amount")

        await usdnearStable.repay_loan(usdnearToRepay)

        //refresh acc info
        await refreshAccount()

        d.showSuccess("You repaid USDNEAR "+c.toStringDec(usdnearToRepay))
        showButtons()

    }
    catch (ex) {
        d.showErr(ex.message)
    }
    finally {
        d.hideWait()
        okCancel.enable();
    }
}

//----------------------
function sendUsdnearClicked(){
    try {

        const acc = cachedAccountData
        d.byId("send-usdnear-max").innerText = c.toStringDec(acc.usdnear)

        ifWalletConnectedShowSubPage("send-usnear", sendUsdnearOKClicked)

    } catch (ex) {
        d.showErr(ex.message)
    }

}
async function sendUsdnearOKClicked() {
    try {
        ifWalletConnectedShowSubPage("send-confirmation", performSend)
    } catch (ex) {
        d.showErr(ex.message)
    }
}
async function performSend() {
    okCancel.disable();
    d.showWait()
    try {

        const info = cachedAccountData
        const usdnearTosend = d.getNumber("input#send-amount")
        const receiverId = d.inputById("send-receiver-account").value.trim()
        if (!receiverId) throw Error("invalid receiver account")

        //check if the receiver account exists
        let balance = await wallet.getAccountBalance(receiverId)

        await metaPool.ft_transfer( receiverId, usdnearTosend)

        //refresh acc info
        await refreshAccount()

        d.showSuccess("USDNEAR "+c.toStringDec(usdnearTosend)+" sent to "+receiverId)
        showButtons()

    }
    catch (ex) {
        d.showErr(ex.message)
    }
    finally {
        d.hideWait()
        okCancel.enable();
    }
}


async function performDeposit() {
    try {

        const stNearToDeposit = d.getNumber("#deposit-amount")
        if (!isValidAmount(stNearToDeposit)) throw Error("Amount should be positive");

        okCancel.disable()

        const timeoutSecs = 300; //(wallet.network == "testnet" ? 20 : 300);
        d.showWait(timeoutSecs) //5 min timeout, give the user time to approve

        //transfer stNEAR from the user account to the usdnearStable.contractAccount
        await metaPool.ft_transfer_call(usdnearStable.contractAccount, stNearToDeposit,"")

        showButtons()

        d.showSuccess("stNEAR " + c.toStringDec(stNearToDeposit) + " added to collateral")

        await refreshAccount()

    }
    catch (ex) {
        d.showErr(ex.message)
    }
    finally {
        d.hideWait()
        okCancel.enable()
    }

}

async function performWithdraw() {
    try {

        okCancel.disable()
        d.showWait()

        const amount = d.getNumber("#withdraw-amount")

        const max = cachedAccountData.stnear-cachedAccountData.locked_stnear;

        if (!isValidAmount(amount)) throw Error("Amount should be positive");
        if (amount > max) throw Error("max amount is " + c.toStringDec(max));

        await usdnearStable.withdraw_stnear(amount)

        showButtons()

        d.showSuccess("Success: " + wallet.accountId + " withdrew " + c.toStringDec(amount) + " stNEAR from collateral")

        await refreshAccount()

    }
    catch (ex) {
        d.showErr(ex.message)
    }
    finally {
        d.hideWait()
        okCancel.enable()
    }

}



//-------------------------------
function showButtons() {
    d.showSubPage("account-selected-buttons")
    okCancel.hide()
}


//-------------------------------------------
async function refreshAccount() {
    await getAccountData()
    showAccountData()
}

async function refreshAccountClicked(ev: Event) {
    try {
        await refreshAccount()
        d.showSuccess("Account refreshed")
    }
    catch (ex) {
        d.showErr(ex.message)
    }
}


