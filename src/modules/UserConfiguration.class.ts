import { cpSync, existsSync, mkdirSync, PathLike } from "original-fs";
import {resolve, dirname} from "path"
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

    public static sanitizeUserConfigurationDirectory() : void {
        if (!process.env.CONFIG_DIRECTORY)
            throw new Error('Attempt to load configuration before config directory path definition!');
        
        let cd = process.env.CONFIG_DIRECTORY;

        if (!existsSync(`${cd}/wallpapers/default`))
            mkdirSync(`${cd}/wallpapers/default`, {recursive : true});
        if (!existsSync(`${cd}/config.json`))
            cpSync(resolve(__dirname, '../../assets/default_config.json'), `${cd}/config.json`);
        if (!existsSync(`${cd}/wallpapers/default_wallpaper.html`))
            cpSync(resolve(__dirname, '../../assets/default_wallpaper.html'), `${cd}/wallpapers/default/default_wallpaper.html`);
        if (!existsSync(`${cd}/wallpapers/default_wallpaper.css`))
            cpSync(resolve(__dirname, '../../assets/default_wallpaper.css'), `${cd}/wallpapers/default/default_wallpaper.css`);
        if (!existsSync(`${cd}/wallpapers/default_wallpaper.mp4`))
            cpSync(resolve(__dirname, '../../assets/default_wallpaper.mp4'), `${cd}/wallpapers/default/default_wallpaper.mp4`);
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