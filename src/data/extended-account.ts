import * as c from "../util/conversions.js"

import { GetAccountInfoResult } from "../contracts/usdnearStable.js";

/**
 * processed contract user account data to show on the DApp
 */
export class ExtendedAccountData {

  accountInfo: GetAccountInfoResult;

  nearAccount: string = "";
  usdnear: number = 0;
  stnear: number = 0;
  usdnear_credit_limit: number = 0;
  locked_stnear: number = 0;
  stnear_price_usd: number = 0;
  valued_collateral_usd: number = 0;
  free_stnear: number = 0;
  outstanding_loans_usdnear: number = 0;
  collateralization_ratio: number = 0;
  stbl: number;

  loan_status = "OK";
  loan_status_class = "success";

  constructor(accountInfo: GetAccountInfoResult) {
    this.accountInfo = accountInfo;
    this.nearAccount = accountInfo.account_id
    this.usdnear = c.yton(accountInfo.usdnear)
    this.stnear = c.yton(accountInfo.stnear)
    this.stnear_price_usd = c.yton(accountInfo.stnear_price_usd)
    this.usdnear_credit_limit = c.yton(accountInfo.usdnear_credit_limit)
    this.locked_stnear = c.yton(accountInfo.locked_stnear)
    this.valued_collateral_usd = c.yton(accountInfo.valued_collateral_usd)
    this.free_stnear = this.stnear-this.locked_stnear
    this.outstanding_loans_usdnear = c.yton(accountInfo.outstanding_loans_usdnear)
    this.collateralization_ratio = accountInfo.collateralization_ratio/100
   
    this.usdnear_credit_limit = c.yton(accountInfo.usdnear_credit_limit)
    this.stbl = c.yton(accountInfo.stbl)

    if (this.collateralization_ratio<150){
      this.loan_status="OPEN FOR LIQUIDATION"
      this.loan_status_class = "critical"
    }
    else if (this.collateralization_ratio<200){
      this.loan_status="WARNING: LOW COLLATERAL"
      this.loan_status_class = "warning"
    }
    else {
      this.loan_status="OK"
      this.loan_status_class = "success"
    }
  }

  get valuedCollateral(): number {
    return this.stnear * this.stnear_price_usd;
  }

}
