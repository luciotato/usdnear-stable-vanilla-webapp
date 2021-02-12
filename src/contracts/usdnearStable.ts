//----------------------------------
// USDNEAR Stablecoin smart-contract proxy
// https://github.com/luciotato/usdnear-stable
//----------------------------------

import {ntoy} from "../util/conversions.js"
import {Wallet} from "../wallet-api/wallet.js"
import {Nep141} from "./NEP141.js"

import type {ContractInfo} from "./NEP129.js"

export const CONTRACT_ACCOUNT = "usdnear.stable.testnet"

//struct returned from get_account_info
export type GetAccountInfoResult = {
    account_id: string;
    usdnear: string; //U128,
    stnear: string; //U128,
    stnear_price_usd: string; //U128,

    usdnear_credit_limit: string; //U128,
    locked_stnear: string; //U128,
    valued_collateral_usd: string; //U128,
    outstanding_loans_usdnear: string; //U128,
    collateralization_ratio: number; //u32 basis point,

    stbl: string; //U128 governance token
}

//JSON compatible struct returned from get_contract_state
export type ContractState = {
    total_usdnear: string, //U128,
    total_collateral_stnear: string, //U128,
    total_for_unstaking: string, //U128,
    current_stnear_price: string, //U128, 
    valued_collateral: string, //U128, 
    total_stbl: string, //U128,
    balances_count: string, //U64,
    b_accounts_count: string, //U64,
    total_collateral_shares: string, //U128,
    usdnear_apr_basis_points: number, //u32,
}

//singleton class
export class UsdnearStable extends Nep141 {

    /// returns JSON string according to [NEP-129](https://github.com/nearprotocol/NEPs/pull/129)
    get_contract_info() : Promise<ContractInfo> {
        return this.view("get_contract_info")
    }

    get_contract_state() : Promise<ContractState> {
        return this.view("get_contract_state")
    }

    //get account info from current connected user account
    get_account_info(accountId:string) : Promise<GetAccountInfoResult> {
        return this.view("get_account_info",{account_id:accountId }) 
    }
    
    convert_usdnear(amount:number) : Promise<void> {
        return this.call("convert_usdnear", {usdnear_to_convert:ntoy(amount)})
    }

    withdraw_stnear(amount:number) : Promise<void> {
        return this.call("withdraw_stnear", {amount:ntoy(amount)})
    }

    //take USDNEAR loan
    take_loan(usdnear_amount:number) : Promise<void> {
        return this.call("take_loan", {usdnear_amount:ntoy(usdnear_amount)})
    }

    //repay USDNEAR loan
    repay_loan(usdnear_amount:number) : Promise<void> {
        return this.call("repay_loan", {usdnear_amount:ntoy(usdnear_amount)})
    }

    //liquidate undercollateralized loan
    liquidate(loan_account_id:string, max_usdnear_buy:number) : Promise<void> {
        return this.call("liquidate", {accound_id:loan_account_id, max_usdnear_buy:ntoy(max_usdnear_buy)})
    }
    
}

//singleton export
export const usdnearStable = new UsdnearStable(CONTRACT_ACCOUNT);

