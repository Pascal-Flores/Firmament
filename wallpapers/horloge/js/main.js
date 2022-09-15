let width = window.innerWidth, height = window.innerHeight;
let squares = [], squareSize = 1920 / (1920 * 0.05), squareLength = squareSize * squareSize;
let crosses = [], crossSize = 1920 / (1920 * 0.05), crossLength = crossSize * crossSize;
let rect = {
    pos: [],
    array: [],
    size: 136,
    gap: 10,
    length: 9
};
let radian = Math.PI / 180;
let clock = {
    second: {
        num: 60,
        pos: [],
        array: [],
        deg: 6,
        radius: 530,
        fontSize: 1.0,
        color: 0.25,
        transition: 0.2
    },
    minute: {
        num: 60,
        pos: [],
        array: [],
        deg: 6,
        radius: 460,
        fontSize: 0.9,
        color: 0.25,
        transition: 0.2
    },
    hour: {
        num: 12,
        pos: [],
        array: [],
        deg: 30,
        radius: 390,
        fontSize: 2.0,
        color: 0.25,
        transition: 0.4
    }
}

const getSquares = () => {
    let length = (height / width).toFixed(1) * squareLength;
    for(let i = 0; i < length; i++){
        squares[i] = {
            id: i
        }
    }
}
const getCrosses = () => {
    let length = (height / width).toFixed(1) * crossLength;
    for(let i = 0; i < length; i++){
        crosses[i] = {
            id: i
        }
    }
}
const createClock = (clocks) => {
    for(let i = 0; i < clocks.num; i++){
        let x = `${Math.cos((i * clocks.deg) * radian) * (height * clocks.radius / 2160)}px`;
        let y = `${Math.sin((i * clocks.deg) * radian) * (height * clocks.radius / 2160)}px`;
        clocks.pos[i] = {x: x, y: y};
        clocks.array[i] = {
            id: i,
            text: i,
            style: {
                trans: {transform: `translate(${clocks.pos[i].x}, ${clocks.pos[i].y})`, transition: `${clocks.transition}s`},
                font: {color: `rgba(255, 255, 255, ${clocks.color})`, fontSize: `${clocks.fontSize}vw`, textShadow: "0px 0px 5px rgba(0, 0, 0, 0.5)"}
            }
        }
    }
}
const createRect = () => {
    for(let i = 0; i < rect.length; i++){
        let rSize = height * rect.size / 2160;
        let rGap = height * rect.gap / 2160;
        let x = `${((i % 3) * rSize) + (((i % 3) + 1) * rGap)}px`;
        let y = `${(Math.floor(i / 3) * rSize) + ((Math.floor(i / 3) + 1) * rGap)}px`;
        rect.pos[i] = {x: x, y: y};
        rect.array[i] = {
            id: i,
            style: {
                one: {transform: `translate(${x}, ${y})`, outline: "1px solid rgba(65, 135, 206, 0.3)", transition: "transform 0.3s"},
                two: {transform: `scale(1.0)`, transition: "transform 0.3s"},
                three: {opacity: '0.1', transition: 'opacity 0.3s'}
            }
        }
    }
}
const init = () => {
    new Vue({
        el: '#wrap',
        data: {
            utils: {
                width: {
                    vw: 100,
                    halfOfVw: 50,
                },
                height: {
                    vh: 100,
                    halfOfVh: 50
                },
                mouse: {
                    x: 0,
                    y: 0
                }
            },
            styles: {
                loading: {
                    div: {width: "0px"},
                    span: {
                        a: {left: "0", display: "block"},
                        b: {right: "0", display: "block"},
                        c: {display: "none"}
                    }
                },
                background: {
                    frame: {opacity: 0.7},
                    image: {backgroundImage: `url('./image/background/1.jpg')`, transform: "scale(1.2)", transition: "transform 1.2s", transitionDelay: "0.3s", transformOrigin: "top"}
                },
                clock: {
                    second: {
                        t: {color: "rgba(255, 255, 255, 1.0)", fontSize: "1.4vw", textShadow: "0px 0px 8px rgba(255, 181, 86, 1.0)"},
                        f: {color: "rgba(255, 255, 255, 0.2)", fontSize: "0.5vw", textShadow: "0px 0px 5px rgba(255, 181, 86, 0)"}
                    },
                    minute: {
                        t: {color: "rgba(255, 255, 255, 1.0)", fontSize: "1.4vw", textShadow: "0px 0px 8px rgba(255, 181, 86, 1.0)"},
                        f: {color: "rgba(255, 255, 255, 0.2)", fontSize: "0.5vw", textShadow: "0px 0px 5px rgba(255, 181, 86, 0)"}
                    },
                    hour: {
                        t: {color: "rgba(255, 255, 255, 1.0)", fontSize: "2.4vw", textShadow: "0px 0px 8px rgba(255, 181, 86, 1.0)"},
                        f: {color: "rgba(255, 255, 255, 0.2)", fontSize: "1.2vw", textShadow: "0px 0px 5px rgba(255, 181, 86, 0)"}
                    },
                }
            },
            shows: {
                opening: true,
                overlay: false,
                video: false
            },
            arrays: {
                square: squares,
                cross: crosses,
                clock: {
                    second: clock.second.array,
                    minute: clock.minute.array,
                    hour: clock.hour.array,
                    circles: [{id: 0}, {id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}, {id: 6}, {id: 7}, {id: 8},],
                    rects: rect.array
                }
            },
            loading: {
                step: 0.75,
                width: 0,
                isPlay: true,
                progress: 0,
                complete: "100%"
            },
            clockPos: {
                seconds: clock.second.pos,
                minutes: clock.minute.pos,
                hours: clock.hour.pos
            },
            time: {
                sec: 0,
                min: 0,
                hour: 0,
                day: 0,
                date: 0,
                mon: 0,
                year: 0
            },
            uptime: 0,
            src: ''
        },
        mounted(){
            this.animate();
            window.addEventListener('resize', this.onWindowResize, false);
            this.currentTime();
        },
        computed: {
            displayFullDate(){
                let mon = this.time.mon + 1 < 10 ? '0'+(this.time.mon + 1) : this.time.mon + 1;
                let date = this.time.date < 10 ? '0'+this.time.date : this.time.date;
                return this.time.year+'.'+mon+'.'+date;
            },
            displayFullTime(){
                let hour = this.time.hour < 10 ? '0'+this.time.hour : this.time.hour;
                let min = this.time.min < 10 ? '0'+this.time.min : this.time.min;
                let sec = this.time.sec < 10 ? '0'+this.time.sec : this.time.sec;
                return hour+':'+min+':'+sec;
            },
            displayUptime(){
                let sec = Math.floor(this.uptime / 1000) % 60;
                let min = Math.floor(Math.floor(this.uptime / 1000) / 60) % 60; //除以60取余数，解决显示会超过60的问题
                let hour = Math.floor(Math.floor(this.uptime / 1000) / 3600) % 100;
                sec = sec < 10 ? '0'+sec : sec;
                min = min < 10 ? '0'+min : min;
                hour = hour < 10 ? '0'+hour : hour;
                return hour+':'+min+':'+sec;
            },
            displayDay(){
                let day = ['Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.', 'Sat.']
                return day[this.time.day];
            },
            lineSecondWidth(){
                let ratio = this.time.sec / 60 * 280;
                return {
                    width: `calc(100vh * ${ratio} / 2160`
                }
            },
            lineMinuteWidth(){
                let ratio = this.time.min / 60 * 320;
                return {
                    width: `calc(100vh * ${ratio} / 2160`
                }
            },
            lineHourWidth(){
                let ratio = this.time.hour / 24 * 360;
                return {
                    width: `calc(100vh * ${ratio} / 2160`
                }
            },
            watchTimeSec(){
                return this.time.sec;
            },
            watchTimeMin(){
                return this.time.min;
            },
            watchTimeHour(){
                return this.time.hour;
            },
            clockTrans(){
                return {
                    transform: this.rotateClock(),
                    transition: "0.3s cubic-bezier(0.23, 1, 0.32, 1)",
                    transformOrigin: "center"
                }
            }
        },
        watch: {
            watchTimeSec(){
                this.watchClock(clock.second, this.arrays.clock.second, this.clockPos.seconds);
                this.watchRect();
            },
            watchTimeMin(){
                this.watchClock(clock.minute, this.arrays.clock.minute, this.clockPos.minutes);
            },
            watchTimeHour(){
                this.watchClock(clock.hour, this.arrays.clock.hour, this.clockPos.hours);
            }
        },
        methods: {
            changeBG(isImage, id){
                if(isImage){
                    this.shows.video = false;
                    this.$refs.videobg.currentTime = 0;
                    this.$refs.videobg.pause();
                    switch (id){
                        case 0:
                            this.styles.background.image.backgroundImage = `url(./image/background/1.jpg)`;
                            this.styles.background.frame.opacity = '0.7';
                            break;
                        case 1:
                            this.styles.background.image.backgroundImage = `url(./image/background/2.jpg)`;
                            this.styles.background.frame.opacity = '0.85';
                            break;
                        case 2:
                            this.styles.background.image.backgroundImage = `url(./image/background/6.jpg)`;
                            this.styles.background.frame.opacity = '0.75';
                            break;
                        case 3:
                            this.styles.background.image.backgroundImage = `url(./image/background/7.jpg)`;
                            this.styles.background.frame.opacity = '0.5';
                            break;
                        case 4:
                            this.styles.background.image.backgroundImage = `url(./image/background/8.jpg)`;
                            this.styles.background.frame.opacity = '0.5';
                            break;
                    }
                }else{
                    this.shows.video = true;
                    this.$refs.videobg.currentTime = 0;
                    this.styles.background.frame.opacity = '0.7';
                    switch (id){
                        case 0:
                            this.$refs.videobg.src = './video/1.webm';
                            break;
                        case 1:
                            this.$refs.videobg.src = './video/2.webm';
                            break;
                        case 2:
                            this.$refs.videobg.src = './video/3.webm';
                            break;
                    }
                    this.$refs.videobg.play();
                }
            },
            displayOverlay(){
                this.shows.overlay = true;
            },
            hideOverlay(){
                this.shows.overlay = false;
            },
            watchRect(){
                if(this.time.sec % 10 == 0){
                    for(let i = 0; i < rect.length; i++){
                        this.arrays.clock.rects[i].style.one.transform = `translate(${rect.pos[4].x}, ${rect.pos[4].y})`;
                        this.arrays.clock.rects[i].style.one.outline = `0px solid rgba(65, 135, 206, 0.3)`;
                        this.arrays.clock.rects[i].style.two.transform = `scale(2.4)`;
                        this.arrays.clock.rects[i].style.three.opacity = `0.2`;
                    }
                }else{
                    for(let i = 0; i < rect.length; i++){
                        let random = Math.floor(Math.random() * 9);
                        this.arrays.clock.rects[i].style.one.transform = `translate(${rect.pos[random].x}, ${rect.pos[random].y})`;
                        this.arrays.clock.rects[i].style.one.outline = `1px solid rgba(65, 135, 206, 0.3)`;
                        this.arrays.clock.rects[i].style.two.transform = `scale(1.0)`;
                        this.arrays.clock.rects[i].style.three.opacity = `0.1`;
                    }
                }
            },
            resizeRect(){
                for(let i = 0; i < rect.length; i++){
                    let rSize = height * rect.size / 2160;
                    let rGap = height * rect.gap / 2160;
                    let x = `${((i % 3) * rSize) + (((i % 3) + 1) * rGap)}px`;
                    let y = `${(Math.floor(i / 3) * rSize) + ((Math.floor(i / 3) + 1) * rGap)}px`;
                    rect.pos[i] = {x: x, y: y};
                    this.arrays.clock.rects[i].style.one.transform = `translate(${x}, ${y})`;
                }
            },
            rotateClock(){
                let x, y, degree = 2.5;
                x = (this.utils.mouse.x - width / 2) / (width / 2) * degree;
                y = (this.utils.mouse.y - height / 2) / (height / 2) * degree;
                return `rotateX(${-y}deg) rotateY(${x}deg)`
            },
            mouseMove: throttle(function(e) {
                this.utils.mouse.x = e.clientX;
                this.utils.mouse.y = e.clientY;
            }, 50),
            watchClock(clocks, arrays, clockPos){
                for(let i = 0; i < clocks.num; i++){
                    let step = i == clocks.num - 1 ? 0 : i + 1;
                    arrays[i].style.trans.transform = `translate(${clockPos[step].x}, ${clockPos[step].y})`;
                }
                let last = clockPos.shift();
                clockPos.push(last);
            },
            checkClock(length, time, array, styles){
                for(let i = 0; i < length; i++){
                    if(time % length == array[i].text){
                        array[i].style.font.color = styles.t.color;
                        array[i].style.font.fontSize = styles.t.fontSize;
                        array[i].style.font.textShadow = styles.t.textShadow;
                    }else{
                        array[i].style.font.color = styles.f.color;
                        array[i].style.font.fontSize = styles.f.fontSize;
                        array[i].style.font.textShadow = styles.f.textShadow;
                    }
                }
            },
            resizeClock(clocks){
                for(let i = 0; i < clocks.num; i++){
                    let x = `${Math.cos((i * clocks.deg) * radian) * (height * clocks.radius / 2160)}px`;
                    let y = `${Math.sin((i * clocks.deg) * radian) * (height * clocks.radius / 2160)}px`;
                    clocks.pos[i] = {x: x, y: y};
                    clocks.array[i].style.trans.transform = `translate(${clocks.pos[i].x}, ${clocks.pos[i].y})`;
                }
            },
            resizeSquareLength(){
                let length = (height / width).toFixed(1) * squareLength;
                this.arrays.square = [];
                squares = [];
                for(let i = 0; i < length; i++){
                    squares[i] = {
                        id: i, 
                        style: {boxShadow: "0px 0px 20px rgba(0, 0, 0, 0)", opacity: "0", transition: "box-shadow, opacity 0.3s"}
                    }
                }
                this.arrays.square = squares;
            },
            resizeCrossLength(){
                let length = (height / width).toFixed(1) * crossLength;
                this.arrays.cross = [];
                crosses = [];
                for(let i = 0; i < length; i++){
                    crosses[i] = {
                        id: i
                    }
                }
                this.arrays.cross = crosses;
            },
            onWindowResize(){
                width = window.innerWidth;
                height = window.innerHeight;
                this.resizeSquareLength();
                this.resizeCrossLength();
                this.resizeClock(clock.second);
                this.resizeClock(clock.minute);
                this.resizeClock(clock.hour);
                this.resizeRect();
            },
            loadCompleted(){
                this.styles.loading.span.a.display = "none";
                this.styles.loading.span.b.display = "none";
                this.styles.loading.span.c.display = "block";
                this.loading.isPlay = false;
                this.shows.opening = false;
                this.styles.background.image.transform = "scale(1.0)";
            },
            loadingBar(){
                if(this.loading.width < this.utils.width.halfOfVw){
                    this.loading.width += this.loading.step;
                    this.styles.loading.div.width = `${this.loading.width}vw`;
                    this.styles.loading.span.a.left = `${this.loading.width - this.loading.step * 2}vw`;
                    this.styles.loading.span.b.right = `${this.loading.width - this.loading.step * 2}vw`;
                    this.loading.progress = Math.floor(this.loading.width / this.utils.width.halfOfVw * 100);
                }
                else {
                    this.loadCompleted();
                }
            },
            currentTime(){
                let date = new Date();
                this.time.sec = date.getSeconds();
                this.time.min = date.getMinutes();
                this.time.hour = date.getHours();
                this.time.day = date.getDay();
                this.time.date = date.getDate();
                this.time.mon = date.getMonth();
                this.time.year = date.getFullYear();
                this.checkClock(clock.second.num, this.time.sec, this.arrays.clock.second, this.styles.clock.second);
                this.checkClock(clock.minute.num, this.time.min, this.arrays.clock.minute, this.styles.clock.minute);
                this.checkClock(clock.hour.num, this.time.hour, this.arrays.clock.hour, this.styles.clock.hour);

                setTimeout(this.currentTime, 1000);
            },
            render(){
                if(this.loading.isPlay) this.loadingBar();
                //this.currentTime();
                this.uptime = window.performance.now();
            },
            animate(){
                this.render();
                requestAnimationFrame(this.animate);
            }
        }
    })
}
const render = () => {
    getSquares();
    getCrosses();
    createClock(clock.second);
    createClock(clock.minute);
    createClock(clock.hour);
    createRect();
    init();
}
render();