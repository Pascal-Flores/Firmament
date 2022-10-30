import { PathLike } from "original-fs";
import {resolve} from "path"
import { parseJSONFromFile, writeJSONToFile } from "./JSONFromTo";

export class UserConfiguration {
    public static content : ConfigurationContent;

    public static loadUserConfiguration() : void {
        if (!process.env.CONFIG_DIRECTORY)
            throw new Error('Attempt to load configuration before config directory path definition!');
        try {
            UserConfiguration.content = parseJSONFromFile(`${process.env.CONFIG_DIRECTORY}/config.json`);
        }
        catch (error){
            console.log(`Error during configuration loading :\n\t ${error}\n Restoring default configuration`);
            UserConfiguration.content = parseJSONFromFile(resolve(__dirname, '../../assets/default_config.json'));
        }
    }

    public static saveUserConfiguration() : void {
        if (!process.env.CONFIG_DIRECTORY)
            throw new Error('Attempt to load configuration before config directory path definition!');
        try {
            writeJSONToFile(`${process.env.CONFIG_DIRECTORY}/config.json`, UserConfiguration.content);
        }
        catch (error) {
            console.log(`Error during configuration save :\n\t${error}\nUser Configuration won't be saved!`)
        }
    }
}

type ConfigurationContent = {
    currentWallpaper : PathLike;
    shortcuts : string[];
    pinnedWallpapers : Pin[];
}

type Pin = {
    name : string;
    src : PathLike; 
}