import * as d from "../util/document.js"

import { wallet } from "../wallet-api/wallet.js"


//--------------------------
export async function show() {

  d.hideErr()

  d.onClickId("how-to-connect-a-wallet", wallet.connectionHelp);

  d.showPage("initial-page")

}


