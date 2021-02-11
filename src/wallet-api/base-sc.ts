//-----------------------------
// Base smart-contract class
// provides constructor, view & call methods
// derive your specific contract proxy from this class
//-----------------------------

import {wallet, Wallet} from "./wallet.js"

type yoctos = string

//singleton class
export class SmartContract {
    
    contractAccount:string;
    wallet:Wallet;

    constructor(contractAccount:string)
    {
        this.contractAccount = contractAccount
        this.wallet = wallet
    }

    view(method:string, args?:any) : Promise<any> {
        if (!this.wallet) throw Error(`contract-proxy not connected ${this.contractAccount} trying to view ${method}`)
        return this.wallet.view(this.contractAccount,method,args)
    }

    //default gas is 300T
    call(method:string, args:any, TGas:number=300, nearsToDeposit:number=0) : Promise<any> {
        if (!this.wallet) throw Error(`contract-proxy not connected ${this.contractAccount} trying to call ${method}`)
        return this.wallet.call(this.contractAccount, method, args, TGas, nearsToDeposit)
    }
}

