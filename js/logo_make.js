var debug = false;
var ANDROID_LOGO_SCALE = 0.251;
var A_L_S_ARR = [];
var H_A_L_S_RATIO = [0.226, 0.226, 0.299]; // 22.5% ~ 30%
var V_A_L_S_RATIO = [0.251, 0.251, 0.499]; // 25% ~ 50%
// android logo area / custom logo area
var AREA_RATIO = 0.899;
var AREA_RATIO_LIMIT = 0.899; // < 90%
var isGo = false;
var onlyAndroid = false;
var androidLogo, customLogo;
var oldWidth = -1;
var oldHeight = -1;
var width = 0,
    height = 0;
var bgWhite = '#FFFFFF';
var bgBlack = '#000000';
var curBgColor = bgBlack;
var oldBgColor;

var reader = new FileReader();
// logo width
var inpW = document.getElementsByTagName('input')[0];
// logo height
var inpH = document.getElementsByTagName('input')[1];
// custom logo
var logoC = document.getElementById('c_l_i');
var oCanvas = document.getElementsByTagName('canvas')[0];
var ctx = oCanvas.getContext('2d');
// background color
var selectBgColor = document.getElementById('bg_color');
var only_android = document.getElementById('only_android');
var is_go = document.getElementById('is_go');
var androidLogoBox = document.getElementById('android_logo_box');
var cleanBtn = document.getElementById('clean_btn');
var androidRange = document.getElementById('android_range');
var customRange = document.getElementById('custom_range');
var firstSelect = document.getElementById('first_select');
var vertical_move = document.getElementById('vertical_move');

window.onload = function () {
    androidLogo = new AndroidLogo();
    customLogo = new CustomLogo();
    bindEvent();
    if ("createEvent" in document) {
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent("change", false, true);
        only_android.dispatchEvent(evt);
        is_go.dispatchEvent(evt);
        selectBgColor.dispatchEvent(evt);
    } else {
        only_android.fireEvent("onchange");
        is_go.fireEvent("onchange");
        selectBgColor.fireEvent("onchange");
    }
}

function bindEvent() {
    androidLogo.img.onload = function () {
        if (debug) console.log('androidLogo.img.onload');
        initAndroidScaleLimit();
        androidLogo.update();
    }
    if (!onlyAndroid) {
        customLogo.img.onload = function () {
            if (debug) console.log('customLogo.img.onload');
            initCustomScaleLimit();
            customLogo.update();
        }
    }
    if (debug) console.log('bindEvent', androidLogo.img, customLogo.img.onload);
}

inpW.oninput = function () {
    width = parseInt(inpW.value);
    if (oldWidth == undefined | oldWidth != width) {
        oldWidth = width
        updateCanvasSize();
    }
}

inpH.oninput = function () {
    height = parseInt(inpH.value);
    if (oldHeight != height) {
        oldHeight = height
        updateCanvasSize();
    }
}

function updateCanvasSize() {
    // console.log('updateCanvasSize : ' + width + "x" + height);
    oCanvas.setAttribute('width', width);
    oCanvas.setAttribute('height', height);
    drawCanvas();
}

selectBgColor.onchange = function (e) {
    // console.log('selectBgColor ' + e.target.value);
    curBgColor = e.target.value;
    if (oldBgColor != curBgColor) {
        // console.log('selectBgColor ' + e.target.value);
        oldBgColor = curBgColor;
        drawCanvas();
    }
}

function drawCanvas() {
    ctx.fillStyle = curBgColor;
    ctx.fillRect(0, 0, width, height);
}

cleanBtn.onclick = function () {
    androidLogo.oldArr = [];
    customLogo.oldArr = [];
    androidLogoBox.style.display = 'block';
    firstSelect.style.display = 'block';
    drawCanvas();
    vertical_move.parentElement.style.display = 'none';
    customRange.parentElement.style.display = 'none';
    androidRange.parentElement.style.display = 'none';
}

only_android.onchange = function (e) {
    onlyAndroid = e.target.value == 'true';
    updateAndroidLogoList();
}
// select is go or not go
is_go.onchange = function (e) {
    var value = e.target.value;
    isGo = value == 'true' ? true : false;
    updateAndroidLogoList();
}

// select android logo img list
function updateAndroidLogoList() {
    if (debug) console.log('is go : ' + isGo, 'only android : ' + onlyAndroid);
    var allList = androidLogoBox.children;
    var showClass = isGo ? 'is_go' : 'no_go';
    var showList = [];
    for (var key in allList) {
        if (allList.hasOwnProperty(key)) {
            var ele = allList[key];
            var className = ele.className;
            if (className.indexOf(showClass) != -1) {
                ele.classList.remove('android_logo_hide');
                showList.push(ele);
            } else {
                ele.classList.add('android_logo_hide');
            }
        }
    }
    for (var key in showList) {
        if (showList.hasOwnProperty(key)) {
            var ele = showList[key];
            var className = ele.className;
            if (onlyAndroid && className.indexOf('only_a') != -1) {
                ele.classList.remove('android_logo_hide');
            } else if (!onlyAndroid && className.indexOf('only_a') == -1) {
                ele.classList.remove('android_logo_hide');
            } else {
                ele.classList.add('android_logo_hide');
            }
        }
    }
}
// select android logo
androidLogoBox.addEventListener('click', function (e) {
    if (e.target.tagName == "IMG" & inpH.value > 0 & inpW.value > 0) {
        customLogo.clear();
        logoC.value = null;
        androidLogo.clear();
        logoC.style.display = 'inline-block';
        androidLogo.img.src = e.target.src;
        androidLogoBox.style.display = 'none';
        firstSelect.style.display = 'none';
    }
});

// upload custom logo
logoC.onchange = function () {
    reader.readAsDataURL(logoC.files[0]);
}
// upload success
reader.onload = function () {
    customLogo.img.src = this.result;
    logoC.style.display = 'none';
}

reader.error = function (e) {
    if (debug) console.log(e);
}

customRange.oninput = function (e) {
    scale.custom.value = this.value / 1000;
    if (debug) console.log('customRange : ' + this.value);
    customLogo.update();
}

androidRange.oninput = function (e) {
    scale.android.value = this.value / 1000;
    if (debug) console.log('androidRange : ' + this.value);
    if (!onlyAndroid & customLogo.img.src.length > 0) {
        initCustomScaleLimit();
    }
    androidLogo.update();
    if (!onlyAndroid & customLogo.img.src.length > 0) {
        customLogo.update();
    }
}

vertical_move.oninput = function (e) {
    scale.custom_vertical_move.value = this.value;
    customLogo.update();
}

function getCtx() {
    if (this.ctx === undefined) {
        var canvas = document.getElementsByTagName('canvas')[0];
        if (canvas != undefined) {
            this.ctx = canvas.getContext('2d');
        }
    }
    return this.ctx;
}
var scale = {
    android: {
        min: 1,
        value: 1,
        max: 100,
        setValue: function (arr) {
            this.min = arr[0];
            this.value = arr[1];
            this.max = arr[2];
        }
    },
    custom: {
        min: 1,
        value: 1,
        max: 100,
        setValue: function (arr) {
            this.min = arr[0];
            this.value = arr[1];
            this.max = arr[2];
        }
    },
    custom_vertical_move: {
        min: 1,
        value: 1,
        max: 100,
        setValue: function (arr) {
            this.min = arr[0];
            this.value = arr[1];
            this.max = arr[2];
        }
    }
}

function initAndroidScaleLimit() {
    if (width > height) {
        scale.android.min = parseInt(H_A_L_S_RATIO[0] * width * 1000 / androidLogo.img.width) / 1000;
        scale.android.max = parseInt(H_A_L_S_RATIO[2] * width * 1000 / androidLogo.img.width) / 1000;
    } else {
        scale.android.min = parseInt(V_A_L_S_RATIO[0] * width * 1000 / androidLogo.img.width) / 1000;
        scale.android.max = parseInt(V_A_L_S_RATIO[2] * width * 1000 / androidLogo.img.width) / 1000;
    }
    scale.android.value = scale.android.min;
    if (debug) console.log('android scale : [' + scale.android.min + ', ' + scale.android.value + ', ' + scale.android.max + ']');
}

function initCustomScaleLimit() {
    var a_r_w = androidLogo.img.width;
    var a_r_h = androidLogo.img.height;

    var a_c_s = scale.android.value;
    var a_c_S = a_r_w * a_c_s * a_r_h * a_c_s;

    var c_r_w = customLogo.img.width;
    var c_r_h = customLogo.img.height;
    var c_r_S = c_r_w * c_r_h;

    var c_ma_w = width - 100;
    var c_ma_h = c_ma_w * c_r_h / c_r_w;
    var c_ma_S = c_ma_w * c_ma_h;
    var c_ma_s = parseInt((c_ma_w / c_r_w) * 1000) / 1000;

    var c_mi_S = a_c_S / AREA_RATIO_LIMIT;
    var c_mi_s = Math.ceil(Math.sqrt(c_mi_S / c_r_S) * 1000) / 1000;

    var c_c_S = c_r_S * c_mi_s * c_mi_s;
    scale.custom.min = c_mi_s;
    scale.custom.max = c_ma_s;
    scale.custom.value = scale.custom.min;
    if (debug) console.log('custom scale : [' + scale.custom.min + ', ' + scale.custom.value + ', ' + scale.custom.max + ']', a_c_S / c_c_S);
}

function AndroidLogo() {
    var that = this;
    this.oldArr = [];
    this.ctx = getCtx();
    this.img = new Image();
    this.w = undefined;
    this.h = undefined;
    this.x = undefined;
    this.y = undefined;
    this.S = undefined;
    this.isLoaded = false;
    this.range = document.getElementById('android_range');
    this.update = function () {
        this.w = parseInt(this.img.width * scale.android.value);
        this.h = parseInt(this.img.height * scale.android.value);
        this.x = parseInt((width - this.w) / 2);
        if (onlyAndroid) {
            this.y = parseInt((height - this.h) / 2);
        } else {
            this.y = parseInt(height - (this.h * 2));
        }
        this.S = this.w * this.h;
        this.updateRange();
    };
    this.updateRange = function () {
        this.range.setAttribute('min', scale.android.min * 1000);
        this.range.setAttribute('max', scale.android.max * 1000);
        this.range.setAttribute('value', scale.android.value * 1000);
        if (debug) console.log('scale.android.min >= scale.android.max ' + scale.android.min >= scale.android.max, this.range);
        if (scale.android.min >= scale.android.max) {
            this.range.parentElement.style.display = 'none'
        } else {
            this.range.parentElement.style.display = 'inline-block'
        }
        this.range.value = scale.android.value * 1000;
        this.draw();
    };
    this.draw = function () {
        var ox, oy, ow, oh;
        ox = this.oldArr[0];
        oy = this.oldArr[1];
        ow = this.oldArr[2];
        oh = this.oldArr[3];
        var needClear;
        if (this.oldArr.length != 0) {
            if (ox != this.x | oy != this.y | ow != this.w | oh != this.h) {
                needClear = true;
            } else {
                needClear = false;
            }
        } else {
            needClear = false;
        }
        if (needClear) {
            this.clear();
        }
        this.ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
        this.oldArr = [this.x, this.y, this.w, this.h];
        this.loaded = true;
        console.log('android logo : [ t:' + this.y + ', r:' + (width - this.x - this.w) + ', b:' + (height - this.y - this.h) + ', l:' + this.x + ' ];[ w:' + this.w + ', h:' + this.h + ', S:' + this.S + ' ]; width ratio = ' + (this.w / width));
    };
    this.clear = function () {
        // this.ctx.fillStyle = curBgColor;
        this.ctx.fillRect(this.oldArr[0], this.oldArr[1], this.oldArr[2], this.oldArr[3]);
        this.loaded = false;
    };
}

function CustomLogo() {
    var that = this;
    this.oldArr = [];
    this.ctx = getCtx();
    this.img = new Image();
    this.w = undefined;
    this.h = undefined;
    this.x = undefined;
    this.y = undefined;
    this.S = undefined;
    this.isLoaded = false;
    this.range = document.getElementById('custom_range');
    this.update = function () {
        this.w = Math.ceil(this.img.width * scale.custom.value);
        this.h = Math.ceil(this.img.height * scale.custom.value);
        if (height - (androidLogo.h * 3 * 2) < this.h) {
            this.y = height - (androidLogo.h * 3 + 10 + this.h)
        } else {
            this.y = Math.ceil((height - this.h) / 2);
        }
        this.x = parseInt((width - this.w) / 2);
        this.S = this.w * this.h;
        this.updateRange();
    };
    this.updateRange = function () {
        this.range.setAttribute('min', scale.custom.min * 1000);
        this.range.setAttribute('max', scale.custom.max * 1000);
        this.range.setAttribute('value', scale.custom.value * 1000);
        this.range.value = scale.custom.value * 1000;
        if (debug) console.log('scale.custom.min >= scale.custom.max ' + scale.custom.min >= scale.custom.max, this.range);
        if (scale.custom.min >= scale.custom.max) {
            this.range.parentElement.style.display = 'none'
        } else {
            this.range.parentElement.style.display = 'inline-block'
        }
        scale.custom_vertical_move.min = 0;
        scale.custom_vertical_move.max = this.y - 10;
        if (scale.custom_vertical_move.max <= scale.custom_vertical_move.min) {
            vertical_move.parentElement.style.display = 'none';
        } else {
            vertical_move.parentElement.style.display = 'inline-block';
        }
        vertical_move.setAttribute('min', scale.custom_vertical_move.min);
        vertical_move.setAttribute('max', scale.custom_vertical_move.max);
        if (scale.custom_vertical_move.value < scale.custom_vertical_move.min || scale.custom_vertical_move.value > scale.custom_vertical_move.max) {
            scale.custom_vertical_move.value = scale.custom_vertical_move.min;
            vertical_move.value = scale.custom_vertical_move.value;
        }
        vertical_move.setAttribute('value', scale.custom_vertical_move.value);
        if (debug) console.log('custom_vertical_move : [' + scale.custom_vertical_move.min + ", " + scale.custom_vertical_move.value + ", " + scale.custom_vertical_move.max + "]");
        if (debug) console.log('custom_verticl_range : [' + vertical_move.getAttribute('min') + ", " + vertical_move.getAttribute('value') + ", " + vertical_move.getAttribute('max') + "]");
        this.draw();
    };
    this.draw = function () {
        var ox, oy, ow, oh;
        ox = this.oldArr[0];
        oy = this.oldArr[1];
        ow = this.oldArr[2];
        oh = this.oldArr[3];
        var needClear;
        if (this.oldArr.length != 0) {
            if (ox != this.x | oy != (this.y - scale.custom_vertical_move.value) | ow != this.w | oh != this.h) {
                needClear = true;
            } else {
                needClear = false;
            }
        } else {
            needClear = false;
        }
        if (needClear) {
            this.clear();
        }
        this.ctx.drawImage(this.img, this.x, (this.y - scale.custom_vertical_move.value), this.w, this.h);
        this.oldArr = [this.x, (this.y - scale.custom_vertical_move.value), this.w, this.h];
        this.loaded = true;
        console.log('custom logo : [ t:' + (this.y - scale.custom_vertical_move.value) + ', r:' + (width - this.x - this.w) + ', b:' + (height - (this.y - scale.custom_vertical_move.value) - this.h) + ', l:' + this.x + ' ];[ w:' + this.w + ', h:' + this.h + ', S:' + this.S + ' ];\n areas ratio = ' + (androidLogo.S / this.S) + ';\n DH = ' + (androidLogo.y - (this.y - scale.custom_vertical_move.value) - this.h));
    };
    this.clear = function () {
        // this.ctx.fillStyle = curBgColor;
        this.ctx.fillRect(this.oldArr[0], this.oldArr[1], this.oldArr[2], this.oldArr[3]);
        this.loaded = false;
    };
}

