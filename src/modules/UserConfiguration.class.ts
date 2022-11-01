import { cpSync, existsSync, mkdirSync, PathLike } from "original-fs";
import {resolve, dirname} from "path"
import { isAccelerator } from "./isAccelerator";
import { parseJSONFromFile, writeJSONToFile } from "./JSONFromTo";

export class UserConfiguration {

    //public
    public static content : ConfigurationContent;

    public static loadUserConfiguration() : void {
        if (!process.env.CONFIG_DIRECTORY)
            throw new Error('Attempt to load configuration before config directory path definition!');
        try {
            UserConfiguration.content = UserConfiguration.removeInvalidFields(parseJSONFromFile(`${process.env.CONFIG_DIRECTORY}/config.json`));
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

    public static sanitizeConfigurationDirectory() : void {
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

    public static sanitizeShortcuts() : void {
        
        let defaultShortcuts : ShortcutList = parseJSONFromFile(resolve(__dirname, '../../assets/default_config.json')).shortcuts;
        
        if (UserConfiguration.content.shortcuts === undefined) {
            UserConfiguration.content.shortcuts = defaultShortcuts;
        }
        else {

            // removes all the properties that are not specified in the ShortcutList type
            Object.keys(UserConfiguration.content.shortcuts).forEach(key => {
                if (!Object.keys(defaultShortcuts).includes(key))
                    delete UserConfiguration.content.shortcuts[key as keyof ShortcutList];
            });

            // adds all the missing properties from the ShortcutList type
            Object.keys(defaultShortcuts).forEach(key => {
                if (UserConfiguration.content.shortcuts[key as keyof ShortcutList] === undefined ||
                    !isAccelerator(UserConfiguration.content.shortcuts[key as keyof ShortcutList])) {
                    UserConfiguration.content.shortcuts[key as keyof ShortcutList] = defaultShortcuts[key as keyof ShortcutList];
                }
            });
        }
    }

    public static sanitizeCurrentWallpaper() : void {
        let defaultWallpaper : PathLike = parseJSONFromFile(resolve(__dirname, '../../assets/default_config.json')).currentWallpaper;

        if (UserConfiguration.content.currentWallpaper === undefined) 
            UserConfiguration.content.currentWallpaper = defaultWallpaper;
        else 
            if (!existsSync(UserConfiguration.content.currentWallpaper))
                UserConfiguration.content.currentWallpaper = defaultWallpaper;
    }
    // private
    private static removeInvalidFields(configuration : any) : ConfigurationContent {
        let defaultConfiguration : ConfigurationContent = parseJSONFromFile(resolve(__dirname, '../../assets/default_config.json'));
        
        // removes from configurationToSanitize all the properties that do not belong to the UserConfiguration type
        Object.keys(configuration).forEach(key => {
            if (!Object.keys(defaultConfiguration).includes(key))
                delete configuration[key];
        });

        return configuration;
    }
}

type ConfigurationContent = {
    currentWallpaper : PathLike;
    shortcuts : ShortcutList;
    pinnedWallpapers : Pin[];
}

type Pin = {
    name : string;
    src : PathLike; 
}

type ShortcutList = {
    import : string;
    choose : string;
    quit : string;
    previousPinnedWallpaper : string;
    nextPinnedWallpaper : string;
}