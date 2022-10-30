import { PathLike, readFileSync, writeFileSync } from "original-fs";

export function parseJSONFromFile(filePath : PathLike) {
    try {
        return JSON.parse(readFileSync(filePath, 'utf-8'));
    }
    catch (error) {
        console.log(`Error during parsing of file : \n\t${error}\n`);
    }
}

export function writeJSONToFile(filePath : PathLike, content : Object) {
    try {
        writeFileSync(filePath, JSON.stringify(content));
    }
    catch (error){
        console.log(`Error during file wrte :\n\t${error}\n`);
    }
}