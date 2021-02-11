import {wallet} from "../wallet.js"

//----------------------------------------
//-- LISTEN to "message" from injected content script
//-- msg path is ext-> content-script-> here-> dispatchEvent("wallet-connected"|"wallet-disconnected"|"wallet-event")
//-- process by raising 'wallet-event'  
//----------------------------------------
window.addEventListener("message", 
    function(event) {
        console.log("wallet-ts messagelistener",event.data.dest, event.data);
        if (event.source != window) return; //only internal messages (from the injected content script)
        if (event.data.dest!="page") return; //only messages destined to this web page (DApp) 
        msgReceivedFromContentScript(event.data)
    }
    , false)
;

function msgReceivedFromContentScript(msg:Record<string,any>){
    
    console.log("msg ext->page: " + JSON.stringify(msg));

    //handle connect and disconnect
    if (msg.code=="connect"){
        const response={dest:"ext", code:"connected", relayer:"wallet-api", version:"0.1", network:wallet.network, err:""}
        if (!msg.data || msg.data.network!=wallet.network){
            //respond back what network we're working in
            response.err="The web page requires a "+wallet.network+" account";
            window.postMessage(response,"*")
            return;
        }
        //turn on connected flags
        wallet._isConnected = true;
        wallet._accountId = msg.data.accountId;
        //respond back so the the chrome-extension knows we're listening
        window.postMessage(response,"*")
    }
    else if (msg.code=="disconnect"){
        if (wallet.isConnected) {      
            wallet.disconnect(); //dispatchs event, does it all
        }   
        return;
    }
    else if (msg.code=="request-resolved"){
        //chrome-extension completed a request
        //find & resolve the request by requestId 
        processRequestResolved(msg);
    }

    //Also dispatchEvent to the DApp can react to extension-wallet events
    //like "wallet-connected"|"wallet-disconnected"
    let eventKey:string = eventFromCode(msg.code);
    const eventInfo = 
        new CustomEvent(
            eventKey,
            { detail:{
                source:'ext',
                code: msg.code,
                err: msg.err,
                data: msg.data,
                }
            })
    if (eventKey="wallet-connected") wallet.version=msg.version||100000001;
    console.log("document.dispatchEvent "+ eventInfo.type) 
    document.dispatchEvent(eventInfo);
}

function eventFromCode(code:string):string{
    switch(code){
        case "connect": return "wallet-connected";
        case "disconnect": return "wallet-disconnected";
        default: return 'wallet-event';
    }
}

/* ----------------
example event data:
  connected = {
        code: 'connected',
        source:'ext',
        dest:'page',
        err: undefined,
        data: {
            accountId: "${user_account_id}"
        },
  }
*/

//requests made to the extension's background.js
type requestInfo = {
    requestId:number,
    payload: any,
    resolve: Function,
    reject: Function,
}
const requests:requestInfo[]=[];
let requestId=0; //incremental request-id

//result from the extension
export type RequestResult = {
    requestId:number,
    err?:string,
    data?:any,
}

//queue a request, send to the extension via window.postMessage, return a Promise
export function backgroundRequest(requestPayload:any):Promise<any>{
    return new Promise((resolve,reject)=>{
        const request:requestInfo = {requestId:++requestId, payload: requestPayload, reject:reject, resolve:resolve}
        requests.push(request)
        requestPayload.requestId=requestId; //add requestId to payload
        if (!requestPayload.dest) requestPayload.dest="ext";
        //broadcast (injected content script will process it)
        window.postMessage(requestPayload, "*")
    })
}

//called when the resolved msg comes back
function processRequestResolved(msg:any){

    let inx=requests.findIndex(req => req.requestId==msg.requestId);
    if (inx>=0){
        //remove it from the array
        let r=requests.splice(inx,1)[0];
        //reject or resolve promise
        if (msg.err){
            return r.reject(Error(msg.err));
        }
        else {
            return r.resolve(msg.data);
        }
    }
    else {
        console.error("requestId NOT FOUND ",msg)        
    }
    
}
