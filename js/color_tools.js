// 将rgb颜色转成hex
function RgbaToHex(mRGBAColor) {
    var r = mRGBAColor.red;
    var g = mRGBAColor.red;
    var b = mRGBAColor.blue;
    var hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    return hex;
}
// 将hex颜色转成rgb
function hexToRgba(hex, mOpacity) {
    var red = parseInt("0x" + hex.slice(1, 3));
    var green = parseInt("0x" + hex.slice(3, 5));
    var blue = parseInt("0x" + hex.slice(5, 7));
    var opacity = mOpacity || 255;
    return new RGBAColor(red, green, blue, opacity);
}

function RGBAColor(red, green, blue, opacity) {
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.opacity = opacity;
    this.equals = function (RGBAColor) {
        return this.red == RGBAColor.red &
            this.green == RGBAColor.green &
            this.blue == RGBAColor.blue &
            this.opacity == RGBAColor.opacity;
    }
}