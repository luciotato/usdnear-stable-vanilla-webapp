import * as d from "./util/document.js"

import * as InitialPage from "./pages/initial.js"
import * as Dashboard from "./pages/dashboard.js"

import { wallet } from "./wallet-api/wallet.js"

import { show as MyAccountPage_show } from "./pages/my-account.js"
import { usdnearStable } from "./contracts/usdnearStable.js"

import {init as okCancel_init} from "./components/ok-cancel-singleton.js"

function connectionInfoClicked(){
  const div = d.byId("connection-info")
  if (!wallet.isConnected) wallet.connectionHelp()
}

function walletConnected(ev:CustomEvent){
  const div = d.byId("connection-info");
  div.innerText = ev.detail.data.accountId;
  div.classList.add("connected")
  d.showSuccess("wallet connected")
  Dashboard.show()
}
function walletDisconnected(ev:CustomEvent){
  const div = d.byId("connection-info")
  div.innerText = "Not connected";
  div.classList.remove("connected")
  d.showSuccess("wallet disconnected")
  InitialPage.show()
}

// ---------------------
// DOM Loaded - START
// ---------------------
async function onLoad() {

  //TESTING MODE NETWORK or mainnet
  wallet.network = "testnet" //"guildnet" //"mainnet"

  //init singleton components
  okCancel_init()

  //clear err messages on click
  d.onClickId("err-div", () => {
    const errDiv = d.byId("err-div")
    while (errDiv.firstChild) errDiv.firstChild.remove()
  });

  d.onClickId("connection-info", connectionInfoClicked);

  wallet.onConnect(walletConnected)
  wallet.onDisconnect(walletDisconnected)

  InitialPage.show()

}

document.addEventListener('DOMContentLoaded', onLoad);

