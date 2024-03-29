function loadImg(arr, fn) {
    var result = {};
    var iNow = 0;
    for (var i = 0; i < arr.length; i++) {
        var oImage = new Image();
        var tmp = arr[i].split('.');
        result[tmp[0]] = oImage;
        oImage.onload = function() {
            iNow++;
            if (iNow >= arr.length) {
                fn(result);
            }
        }
        oImage.src = 'Images/' + arr[i];
    }
}
window.onload = function() {
    var oCans = document.getElementById('canvas');
    var curW = document.documentElement.clientWidth || document.body.clientWidth;
    var curH = document.documentElement.clientHeight || document.body.clientHeight;
    var integral = '0';
    var integralArr = getInteger(0);
    var i = 0;
    oCans.width = curW;
    oCans.height = curH - 5;
    var DrawingInterval;
    var oGc = oCans.getContext('2d');
    loadImg(['gun.png', 'bullet.png', 'gold.png', 'fish1.png', 'fish1_1.png', 'fish2.png', 'fish2_1.png', 'fish3.png', 'fish3_1.png', 'integer.png', 'bottom.jpg'], function(result) {
        //炮的运动
        oGc.drawImage(result['gun'], 0, 0, 64, 64, oCans.offsetWidth / 2 - 32, oCans.offsetHeight - 64, 64, 64);
        var gun = {};

        var goldArr = [];
        var goldRun = [];
        var bulletArr = [];

        var bottomL = (oCans.offsetWidth / 2) - (result['bottom'].width);

        gun.x = oCans.offsetWidth / 2;
        gun.y = oCans.offsetHeight - 32;

        oCans.onmouseover = function() {
                this.onmousemove = function(ev) {
                    var oEvent = ev || event;
                    var iMx = oEvent.layerX;
                    var iMy = oEvent.layerY;

                    //console.log((iMx - gun.x)+' : '+(iMy - gun.y));

                    gun.radian = Math.atan2(iMy - gun.y, iMx - gun.x) + Math.PI / 2;
                    //炮
                    oGc.save();
                    oGc.translate(gun.x, gun.y); //设置原点
                    oGc.rotate(gun.radian);
                    oGc.drawImage(result['gun'], 0, 0, 64, 64, -32, -32, 64, 64);
                    oGc.restore();
                }
                this.onmousedown = function(ev) {
                    var oEvent = ev || event;
                    var iCx = oEvent.layerX;
                    var iCy = oEvent.layerY;
                    console.log(iCx + ' : ' + iCy);

                    bulletArr.push({
                        x: gun.x,
                        y: gun.y,
                        startX: iCx,
                        startY: iCy,
                        radian: gun.radian,
                        curPosition: 1
                    });
                }
            }
            //画
        DrawingInterval = setInterval(function() {
            oGc.clearRect(0, 0, oCans.offsetWidth, oCans.offsetHeight);
            //子弹
            for (i = 0; i < bulletArr.length; i++) {
                var arcX = bulletArr[i].x;
                var arcY = bulletArr[i].y;
                //console.log(arcX+' : '+arcY);

                oGc.save();
                oGc.translate(arcX, arcY); //设置原点
                oGc.rotate(bulletArr[i].radian);
                oGc.drawImage(result['bullet'], 0, parseInt(bulletArr[i].curPosition) * 48, 30, 48, -15, -24, 30, 48);
                oGc.restore();

                //console.log(bulletArr[i].curPosition);

                var speed = 6;
                var speedX = Math.cos(bulletArr[i].radian - Math.PI / 2) * speed;
                var speedY = Math.sin(bulletArr[i].radian - Math.PI / 2) * speed;
                bulletArr[i].x = arcX + speedX;
                bulletArr[i].y = arcY + speedY;

                bulletArr[i].curPosition += 0.3;
                if (bulletArr[i].curPosition > 3) {
                    bulletArr[i].curPosition = 0;
                }
                if (bulletArr[i].x <= 0 || bulletArr[i].x >= oCans.offsetWidth || bulletArr[i].y <= 0 || bulletArr[i].y >= oCans.offsetHeight) {
                    bulletArr.splice(i, 1);
                    i--;
                }
            }

            //炮
            oGc.save();
            oGc.translate(gun.x, gun.y); //设置原点
            oGc.rotate(gun.radian);
            oGc.drawImage(result['gun'], 0, 0, 64, 64, -32, -32, 64, 64);
            oGc.restore();
            //鱼
            for (i = 0; i < fishArr.length; i++) {

                var speedX = 2;

                if (fishArr[i].type == 1) {
                    speedX = -2;
                }
                var speedY = parseFloat(speedX * Math.tan(fishArr[i].radian));

                fishArr[i].x = fishArr[i].x + speedX;
                fishArr[i].y = fishArr[i].y + speedY;

                oGc.save();
                oGc.translate(fishArr[i].x, fishArr[i].y);
                oGc.rotate(fishArr[i].radian);
                oGc.drawImage(result[fishArr[i].name], 0, parseInt(fishArr[i].curPosition) * fishArr[i].h, fishArr[i].w, fishArr[i].h, speedX, speedY, fishArr[i].w, fishArr[i].h);
                oGc.restore();
                fishArr[i].curPosition += fishArr[i].step;
                if (fishArr[i].curPosition > fishArr[i].endPoy) {
                    fishArr[i].curPosition = 0;
                }
                if (fishArr[i].type == 0 && fishArr[i].x > oCans.offsetWidth) {
                    fishArr.splice(i, 1);
                    i--;
                } else if (fishArr[i].x < -fishArr[i].w) {
                    fishArr.splice(i, 1);
                    i--;
                }
            }

            //打中
            for (i = 0; i < bulletArr.length; i++) {
                for (var n = 0; n < fishArr.length; n++) {
                    if (collideTest(bulletArr[i].x, bulletArr[i].y, 30, 46, fishArr[n].x, fishArr[n].y, fishArr[n].w, fishArr[n].h)) {
                        var goldTmp = {
                            x: fishArr[n].x,
                            y: fishArr[n].y,
                            curPosition: 0,
                        };
                        integralArr = getInteger(fishArr[n].integral); //设置积分
                        $('#credits').text(parseFloat(integral));
                        goldArr.push(goldTmp);
                        fishArr.splice(n, 1);
                        bulletArr.splice(i, 1);
                        i--;
                        break;
                    }
                }
            }

            //金币
            for (i = 0; i < goldArr.length; i++) {
                oGc.drawImage(result['gold'], 0, parseInt(goldArr[i].curPosition) * 51, 49, 51, goldArr[i].x, goldArr[i].y, 49 * 0.8, 51 * 0.8);
                if (goldArr[i].curPosition >= 5) {
                    goldRun.push({
                        curX: goldArr[i].x,
                        curY: goldArr[i].y,
                    });
                    goldArr.splice(i, 1);
                } else {
                    goldArr[i].curPosition += 0.5;
                }
            }


            for (i = 0; i < goldRun.length; i++) {
                oGc.drawImage(result['gold'], 0, 0, 49, 51, goldRun[i].curX, goldRun[i].curY, 49 * 0.8, 51 * 0.8);
                var speed = 0.2;
                var x = oCans.offsetWidth * 0.08;
                // console.log(120/oCans.offsetWidth)
                var y = oCans.offsetHeight - 100;
                var speedX = parseInt(x - goldRun[i].curX) * speed;
                // var speedY = parseInt(867 - goldRun[i].curY)*speed;
                var k = (y - goldRun[i].curY) / (x - goldRun[i].curX);

                goldRun[i].curX += speedX;
                goldRun[i].curY = k * (goldRun[i].curX - x) + y;

                //console.log(goldRun[i].curY/goldRun[i].curX);
                if (speedX == 0) {
                    goldRun.splice(i, 1);
                    i--;
                }
            }

        }, 1000 / 60);
    });

    var fishArr = [];
    var arr = [{
        name: 'fish1',
        endPoy: 12,
        step: 0.1,
        w: 80,
        h: 80,
        integral: 2
    }, {
        name: 'fish2',
        endPoy: 8,
        step: 0.1,
        w: 60,
        h: 64,
        integral: 3
    }, {
        name: 'fish3',
        endPoy: 9,
        step: 0.1,
        w: 50,
        h: 56,
        integral: 1
    }]

    var StartGame = setInterval(function() {
        var rand = Math.round(Math.random() * (arr.length - 1));
        var iType = Math.round(Math.random() * 1);
        var tmp = {
            x: -arr[rand].w,
            y: oCans.offsetHeight / 2 - 150,
            radian: (Math.PI / 180) * (parseInt(Math.random() * 60 - 20)),
            curPosition: 0,
            step: arr[rand].step,
            endPoy: arr[rand].endPoy,
            name: arr[rand].name,
            w: arr[rand].w,
            h: arr[rand].h,
            integral: arr[rand].integral,
            type: 0
        };
        if (iType === 1) {

            tmp.type = 1;
            tmp.x = oCans.offsetWidth + tmp.w;
            tmp.name = tmp.name + '_1';
        }
        fishArr.push(tmp);
    }, 800);

    //碰撞检测
    function collideTest(x1, y1, w1, h1, x2, y2, w2, h2) {

        // var r1 = x1 + w1;
        // var b1 = y1 + h1;

        // var r2 = x2 + w2;
        // var b2 = y2 + h2;

        // if (x1 > r2 || r1 < x2 || b1 < y2 || y1 > b2) {
        //     return false;
        // } else {
        //     return true;
        // }

        // var dist = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
        // console.log(Math.sqrt(w1*w1+h1*h1)/2 + Math.sqrt(w2*w2+h2*h2)/2);

        var x = x1 - (x2 + w2 / 2);
        var y = y1 - (y2 + h2 / 2);
        var dist = Math.sqrt(x * x + y * y);
        var r = Math.sqrt(w1 * w1 + h1 * h1) / 2 + Math.sqrt(w2 * w2 + h2 * h2) / 2;

        if (dist < r / 2) {
            return true;
        } else {
            return false;
        }
    }

    function getInteger(num) {
        var integralArr = [];
        for (var i = 0; i < String(integral).length; i++) {
            integralArr.push({
                old: Number(String(integral)[i]) * 53,
                curPosition: 0
            });
        }
        integral = parseFloat(integral) + num;
        for (i = String(integral).length; i < 6; i++) {
            integral = '0' + integral;
        }
        for (i = 0; i < integralArr.length; i++) {
            integralArr[i].number = Number(String(integral)[i]) * 53;
        }
        return integralArr;
    }

    //倒计时
    var time = 60;
    var Countdown = setInterval(function() {
        //console.log(time);
        $('#time').text(time + 'S');
        if (time == 0) {
            clearInterval(Countdown);
            clearInterval(StartGame);
            clearInterval(DrawingInterval);
            alert('Over');
            //alert(integral);
            //location.reload();
        }
        time -= 1;
    }, 1000);
}