import * as d from "../util/document.js"
import * as c from "../util/conversions.js"

import { show as MyAccountPage_show } from "./my-account.js"

import { wallet } from "../wallet-api/wallet.js"
import { usdnearStable } from "../contracts/usdnearStable.js"

async function dashboardRefresh() {

  try {
    d.showWait()
    d.hideErr()

    //let contractInfo = await divPool.get_contract_info()
    let contractState = await usdnearStable.get_contract_state()

    let dashboardInfo = 
    {
      location: usdnearStable.contractAccount,
      total_usdnear: c.toStringDec(c.yton(contractState.total_usdnear)),
      balances_count: contractState.balances_count,
      total_collateral_stnear: c.ytonString(contractState.total_collateral_stnear),
      b_accounts_count: contractState.b_accounts_count,
      current_stnear_price: c.toStringDec(c.yton(contractState.current_stnear_price)),
      valued_collateral: c.ytonString(contractState.valued_collateral),
      loan_apr: contractState.usdnear_apr_basis_points/100,
    }
    //show dashboard info
    d.applyTemplate("dashboard", "dashboard-template", dashboardInfo)

    document.querySelectorAll("#dashboard .number").forEach(el => {
      if (el instanceof HTMLDivElement) {
        el.innerText = el.innerText.replace(".00", "")
      }
    })
    d.showPage("dashboard-page")
  }
  catch (ex) {
    d.showErr(ex.message)
  }
  finally {
    d.hideWait()
  }
}

//--------------------------
export async function show() {

  d.onClickId("refresh-dashboard", dashboardRefresh);
  d.onClickId("enter-my-account", myAccountClicked);
  
  dashboardRefresh()

}

//---------------------------------------------------
//-- account item clicked => account selected Page --
//---------------------------------------------------
async function myAccountClicked(ev: Event) {
  try {
    wallet.checkConnected()
    MyAccountPage_show()
  }
  catch (ex) {
    d.showErr(ex.message);
  }
}


