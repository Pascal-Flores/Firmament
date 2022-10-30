export enum WallpaperType {
    HTML,
    URL,
}

export class Wallpaper {
    path : string;
    type : WallpaperType;

    public constructor (wallpaperPath : string, wallpaperType : WallpaperType) {
        this.path = wallpaperPath;
        this.type = wallpaperType;
    }

}