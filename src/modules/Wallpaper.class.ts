import { PathLike } from "original-fs";

export enum WallpaperType {
    HTML,
    URL,
}

export class Wallpaper {
    path : PathLike;
    type : WallpaperType;

    public constructor (wallpaperPath : PathLike, wallpaperType : WallpaperType) {
        this.path = wallpaperPath;
        this.type = wallpaperType;
    }

}