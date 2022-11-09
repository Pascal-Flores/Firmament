import { PathLike } from "original-fs";

export enum WallpaperType {
    HTML,
    URL,
}

export class Wallpaper {
    name : string;
    path : PathLike;
    type : WallpaperType;

    public constructor (name : string, wallpaperPath : PathLike, wallpaperType : WallpaperType) {
        this.name = name;
        this.path = wallpaperPath;
        this.type = wallpaperType;
    }

}