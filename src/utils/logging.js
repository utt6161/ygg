
import * as path from 'path'
import * as fs from 'fs'
import moment from 'moment'

function debugLine() {
    let e = new Error();
    let frame = e.stack.split("\n")[2]; // change to 3 for grandparent func
    let lineNumber = frame.split(":").reverse()[1];
    let functionName = frame.split(" ")[5];
    return functionName + " : " + lineNumber;
}

export default (filename, content) =>{
    if(!fs.existsSync(path.resolve() + "/logs")){
        fs.mkdirSync(path.resolve() + "/logs")
    }
    fs.writeFileSync(path.resolve() + `/logs/${filename}.log`, `[${moment().format()}]_[${debugLine()}]` + content)
}