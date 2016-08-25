/////////////////////////
var currentWidth = 0,   //当前状态的宽    
    currentHeight = 0,  //当前状态的高
    loadWidth = 0,      //图片初始化后原始的宽
    loadHeight = 0,     //图片初始化后原始的高
    ratio = 1,          //图片相对于图片初始化时的缩放比例
    speed = 0.03,       //图片缩放速度
    topY = 0,           //目标y坐标
    leftX = 0,          //目标x坐标
    markX = 0,          // 标记的x坐标，相对于原始尺寸
    markY = 0,          // 标记的y坐标，相对于原始尺寸
    markWidth = 0,      // 标记的实际宽度，相对与原始尺寸
    markHeight = 0;     // 标记的实际高度，相对于原始尺寸

var move = false,       //鼠标移动状态
    drawable = false,   //是否是即将要画框的状态
    drawing = false,    //是否处于正在画框的状态
    _x, _y,             //点击拖拽的时候，鼠标离图片左、上的距离
    d_x, d_y,           //标记方框的时候，鼠标画框时的初始坐标
    signBox = [],       //存储了若干组标记框的对象数组
    randomId = 0;       //标记的时候生成div的id使用的随机数

$('#zoom-img').on('load', function () {
    var $this = $(this);
    loadHeight = $this.height(); //jquery对象
    loadWidth = $this[0].width;  //DOM对象
    topY = parseInt($this.css('top'));
    leftX = parseInt($this.css('left'));
    if (signBox.length > 0) {
        setMarkPos();           //画出缺陷框
    }
});

$('#zoom-img').bind('mousewheel', function (event) {
    var wheelDelta = event.originalEvent.wheelDelta;
    var type = 0;
    if (wheelDelta > 0) type = 1;
    //判断滚轮是放大还是缩小
    zoom(event.offsetX, event.offsetY, type);
});

$("#zoom-img").mousedown(function (e) {
    if (drawable) {
        move = false;
        drawing = true;
        randomId = Math.floor(Math.random() * Math.random() * 10000);
        $('#imgContainer').append("<div id='box" + randomId + "' class='box-content'><div class='draw-box'></div></div>");
        $("#" + "box" + randomId).find('.draw-box').css({
            border: '4px solid #59c2e6',
            position: 'absolute'
        });
        d_x = e.clientX;
        d_y = e.clientY;
    } else {
        move = true;
        $('#zoom-img').addClass('drag-mouse');

    }
    _x = e.offsetX;
    _y = e.offsetY;
});

$("#zoom-img").bind('dragstart', function () {
    window.event.returnValue = false;
});
$("#zoom-img").mousemove(function (e) {
    if (move && !drawable) {
        var x = e.clientX - _x;//控件左上角到屏幕左上角的相对位置
        var y = e.clientY - _y;
        $("#zoom-img").css({"top": y, "left": x});
        topY = y;
        leftX = x;
        if (signBox.length > 0) setMarkPos();
    } else if (drawable && drawing && !move) {
        $("#" + "box" + randomId).find('.draw-box').css({
            width: e.clientX - d_x - 20,
            height: e.clientY - d_y - 20,
            top: d_y,
            left: d_x
        });
        markWidth = (e.clientX - d_x - 20) / ratio;
        markHeight = (e.clientY - d_y - 20) / ratio;
        markX = (e.offsetX - (e.clientX - d_x)) / ratio;
        markY = (e.offsetY - (e.clientY - d_y)) / ratio;
    }
}).mouseup(function () {
    if (drawable) {
        drawable = false;
        drawing = false;
        // alert('画完了')
        var newBox = $("#" + "box" + randomId);
        newBox.append("<div class='delete-btn'><span>删除</span></div>");
        newBox.find('.delete-btn').css({
            top: d_y - 30,
            left: d_x
        });
        var box = new Object();
        box.markWidth = markWidth;
        box.markHeight = markHeight;
        box.markX = markX;
        box.markY = markY;
        box.id = 'box' + randomId;
        signBox.push(box);
    }
    move = false;
    $("#zoom-img").removeClass('drag-mouse draw-mouse');
});

function zoom(x, y, type) {
    if (type == 1 && ratio - speed <= 2) {    //放大
        topY = topY - y * speed;
        leftX = leftX - x * speed;
        currentWidth = loadWidth * (ratio + speed);
        currentHeight = loadHeight * (ratio + speed);
        ratio += speed;
    } else if (type == 0 && ratio - speed >= 1) {
        topY = topY + y * speed;
        leftX = leftX + x * speed;
        currentWidth = loadWidth * (ratio - speed);
        currentHeight = loadHeight * (ratio - speed);
        ratio -= speed;
        if (ratio == 1) {
            topY = 0;
            leftX = 0;
            setMarkPos();
        }
    } else if (ratio == 1) {
        currentWidth = loadWidth;
        currentHeight = loadHeight;
    }
    console.log(ratio);
    console.log(x);
    console.log(y);
    $("#zoom-img").css({
        width: currentWidth,
        height: currentHeight,
        top: topY,
        left: leftX
    });
    if (signBox.length > 0)  setMarkPos();
}

// 设置标记位置和尺寸
function setMarkPos() {
    for (var i = 0; i < signBox.length; i++) {
        $("#" + signBox[i].id).find('.draw-box').css({
            width: signBox[i].markWidth * ratio,
            height: signBox[i].markHeight * ratio,
            top: signBox[i].markY * ratio + topY,
            left: signBox[i].markX * ratio + leftX
        });
        $("#" + signBox[i].id).find('.delete-btn').css({
            top: signBox[i].markY * ratio + topY - 30,
            left: signBox[i].markX * ratio + leftX
        });
    }
}

$('.fullScreen-box').on('click', '#sign-btn', function () {
    drawable = true;
    $('#zoom-img').addClass('draw-mouse');
});

$('.fullScreen-box').on('click', '#zoomInButton', function () {
    if (ratio - speed <= 2) {
        ratio += speed;
        zoom(0, 0, 1);
    }
});

$('.fullScreen-box').on('click', '#zoomOutButton', function () {
    if (ratio - speed >= 1) {
        ratio -= speed;
        zoom(0, 0, 0);
    }
});

$('.fullScreen-box').on('click', '.delete-btn', function () {
    var $this = $(this);
    $this.parents('.box-content').remove();
});

$('.fullScreen-box').on('click', '.draw-box', function () {
    var $this = $(this);
    $this.parents('.box-content').find('.delete-btn').show();
});






















