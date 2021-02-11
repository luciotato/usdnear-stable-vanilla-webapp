
//----------------------------------
//------ conversions Yoctos<->Near
//----------------------------------

/**
 * returns string representing NEAR with thsnds separators, and 2 decimal places
 * @param {string} yoctos 
 */
export function ytonString(yoctos:string):string {
    const just2dec = ytonFull(yoctos).slice(0, -22)
    return addCommas(just2dec) 
}

/**
 * converts yocto string to Near number truncated to 4 decimal places
 * @param {string} yoctos amount in yoctos
 */
export function yton(yoctos:string):number {
    try {
        const just4dec = ytonFull(yoctos).slice(0, -20) // truncated to 4 decimals 
        return Number(just4dec) 
    }
    catch (ex) {
        console.error("ERR: ytoNN(", yoctos, ")", ex)
        return NaN;
    }
}
/**
 * convert nears expressed as a js-number with MAX 4 decimals into a yoctos-string
 * @param n amount in near MAX 4 DECIMALS
 */
export function ntoy(n: number) {
    let millionsText = Math.round(n * 1e4).toString() // near * 1e4 - round
    let yoctosText = millionsText + "0".repeat(20) //  mul by 1e20 => yoctos = near * 1e(4+20)
    return yoctosText
}

//----------------------------------
//------ conversions number -> display string
//----------------------------------
/**
 * Formats a number in NEAR to a string with commas and 2 decimal places .- 
 * we migth extend to 4 because yton rounds to that and NEAR migth increase in price
 * @param {number} n 
 */
export function toStringDec(n:number) {
    const text1e4N = Math.trunc(n * 100).toString().padStart(3, "0");
    const withDecPoint =text1e4N.slice(0, -2) + "." + text1e4N.slice(-2); 
    return addCommas(withDecPoint);
}
/**
 * converts a string with and commas and decimal places into a number
 * @param {string} str
 */
export function toNum(str:string):number {
    return Number(str.replace(/,/g, ""))
}

/**
 * returns string with a decimal point and 24 decimal places
 * @param {string} str amount in yoctos
 */
export function ytonFull(str:string):string {
    let result = (str + "").padStart(25, "0")
    result = result.slice(0, -24) + "." + result.slice(-24)
    return result
}

/**
 * adds commas to a string number with 4 decimals
 * @param {string} str 
 */
export function addCommas(str:string) {
    let n = str.indexOf(".") - 4
    while (n >= 0) {
        str = str.slice(0, n + 1) + "," + str.slice(n + 1)
        n = n - 3
    }
    return str;
}

