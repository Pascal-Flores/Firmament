import { readFileSync } from "original-fs"
import {extname} from "path"

export function getURLFromFile(filePath : string) : string | never {
    if (extname(filePath) === ".url") {
        let fileContent : string = readFileSync(filePath, 'utf-8');
        return fileContent.substring(fileContent.lastIndexOf('URL')+4);
    }
    else   
        throw new NotAURLFileError();
}

export class NotAURLFileError extends Error {
    public constructor(errorMessage ?: string) {
        if (errorMessage)
            super(errorMessage);
        else    
            super();
    }
}