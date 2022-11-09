/// 설정 섹션 ///

// 히트박스 보기.
let view_hit_box = false;
// 절대 안 죽음.
let naver_die = false;
// 백그라운드 흔들림 세기.
const background_shaking_power = 1;
// 공룡 히트박스 크기 축소.
let minus_dino_hitbox_size = 10;
// 운석 히트박스 크기 축소.
let minus_meteor_hitbox_size = 10;
// 돌 히트박스 크기 축소.
let minus_stone_hitbox_size = 8;

/// ///



const cvs = document.querySelector("#canvas");
const ctx = cvs.getContext("2d");

let score;
let scoreText;
let highscore;
let highscoreText;
let hpText;
let dino;
let background;
let gravity;
let obstacles = [];
let gameSpeed;
let keys = {};
let meteorSpeed;
const background_img_url = './img/omg_background.png';
let play_background_music = false;
const BackgroundMusicPlayer = new Audio();
const NoiseMusicPlayer = new Audio();
const SoundPlayer = new Audio();
let sound_list = [];
// 체력 모두 소진 시, 게임 오버 창을 띄우기 전에 모든 버튼에서 손을 땠는지의 유무.
let game_over = false;
// 나라 정보. 기본값은 null이므로 아무 이미지도 안그림.
let get_country_code = null;
let BGRD_auto_update_window;



const obstacle_img_url_map = function( get=0 )
{
    switch ( get )
    {
        case 'meteor0' : 
        case 0 : return( './img/meteor0.png' );
        
        case 'meteor1' : 
        case 1 : return( './img/meteor1.png' );
        
        case 'stone0' : 
        case 2 : return( './img/stone0.png' );
        
        case 'stone1' : 
        case 3 : return( './img/stone1.png' );
        
        default : return( undefined );
    }
};


const sound_url_map = function( get )
{
    switch ( get )
    {
        case 'explosion0' :
        case 0 : return( './sound/explosion0.wav' );

        case 'explosion1' :
        case 1 : return( './sound/explosion1.wav' );

        case 'noise' :
        case 2 : return( './sound/black_embient_noise.mp3' );

        case 'background' :
        case 3 : return( './sound/ROBLOX-Shadow_of_Colossus.mp3' );

        default : return( undefined );
    }
};


const country_img_url_map = function( get )
{
    switch ( get )
    {
        case 'CH' :
        case 0 : return( './img/CH.png' );
        
        case 'CA' :
        case 1 : return( './img/CA.png' );

        case 'FI' :
        case 2 : return( './img/FI.png' );

        case 'JP' :
        case 3 : return( './img/JP.png' );

        case 'KP' :
        case 4 : return( './img/KP.png' );

        case 'KR' :
        case 5 : return( './img/KR.png' );

        case 'RU' :
        case 6 : return( './img/RU.png' );

        case 'UA' :
        case 7 : return( './img/UA.png' );

        case 'US' :
        case 8 : return( './img/US.png' );

        case 'LT' :
        case 8 : return( './img/LT.png' );

        default : return( undefined );
    }
};


const getJSON = async function( url, naxetCallback )
{
    const xhr = new XMLHttpRequest();
    xhr.open('get', url, true);
    xhr.responseType = 'json';
    
    xhr.onload = function()
    {
        console.log('xhr :', xhr);
        naxetCallback( xhr );
    };

    xhr.onerror = function()
    {
        console.log(`error : faild getJSONx`);
        console.log('xhr : ', xhr);
        naxetCallback( xhr );
    };
    
    // const run = function( get )
    // {
    //     console.log('get : ', JSON.stringify(get));
    //     // console.log(xhr.status, xhr.response, xhr.getAllResponseHeaders());
    //     callback(xhr.status, xhr.response, xhr.getAllResponseHeaders());
    //     // const status = xhr.status;
    //     // if ( status === 200 )
    //     // {
    //     //     callback(null, xhr.response);
    //     // }
    //     // else
    //     // {
    //     //     callback(status, xhr.response);
    //     // }

    // };
    // xhr.onload = run;
    // xhr.onabort = run;
    // xhr.onerror = run;
    
    xhr.send();
};





/////////////////////////////////////////////////
// getJSON(`https://api.openweathermap.org/data/2.5/weather?lat=37.54281347234269&lon=126.96677338393458&appid=011dd5837bbcc912836ae104dda70b3f&units=metric`, function( error, data )
// {
//     if ( error !== null )
//     {
//         alert(`날씨 정보를 불러오는 중 문제가 발생했습니다. [스텝 : 1]`);
//     }
//     else
//     {
//         temp = data.main.temp;
//         alert(`현재\n온도는 ${data.main.temp}도\n풍속은 ${data.wind.speed}m/s\n습도는 ${data.main.humidity}%\n최고:${data.main.temp_max}/최저:${data.main.temp_min}`);
//     }
// });

const drawSquare = function( x, y, width, height, color_code='#000000'  )
{
    ctx.beginPath();
    ////////////////////////////////////////
    ctx.strokeStyle = color_code;
    ctx.fillStyle = color_code;
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.closePath();
    ctx.stroke();
};

class Dino
{
    constructor( x, y, w, h, c, country_code=null )
    {
        this.x = x;
        this.y = y;

        this.hitbox_x = x + minus_dino_hitbox_size;
        this.hitbox_w = w - minus_dino_hitbox_size*2;

        this.hitbox_y = y + minus_dino_hitbox_size;
        this.hitbox_h = h - minus_dino_hitbox_size*2;
        
        this.originalHeight = h;
        this.hitbox_originalHeight = this.hitbox_h;
        
        this.w = w;
        this.h = h;
        this.c = c;
        this.dy = 0;
        this.jumpForce = 15;
        this.grounded = false;
        this.jumpTimer = 0;
        // 공룡의 체력을 저장함.
        this.hp = 100;
        this.img = new Image();
        this.country_img = new Image();
        this.country_code = country_code??null;
        // this.country_code = 'CH';
        this.country_img.src = country_img_url_map(this.country_code)??null;
    }
    
    Draw()
    {
        // alert(`country : ${ this.country_code }, ${ this.country_img.src }`);
        // ctx.beginPath();
        // ctx.fillStyle = this.c;
        // ctx.fillRect(this.x, this.y, this.w, this.h);
        // ctx.closePath();
        if ( game_over ) return;

        // let img = new Image();
        if ( (keys['ShiftLeft'] || keys['KeyS']) && this.grounded )
        {   // 숙인 상태라면 숙인 이미지로.
            this.img.src = './img/dino_down.png';
        }
        else
        {   // 서 있는 상태라면.
            this.img.src = './img/dino_up.png';
        }
        // 1. 공룡 이미지 그림.
        ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
        // 2. 공룡 위에 국기 이미지 그림.
        // ctx.drawImage(this.country_img, this.x, this.y + (this.h/2 - this.h/4), this.w, this.h/2);
        // ctx.drawImage(this.country_img, this.x + ( this.w / 12 ), this.y + (this.h/2 - this.h/4), this.w - ( this.w / 6 ), this.h/2);
        if ( country_img_url_map(this.country_code)??false )
        {
            this.country_img.src = country_img_url_map(this.country_code)??country_img_url_map('KR');
            ctx.drawImage(this.country_img, this.x + ( this.w / 12 ), this.y - ( this.h ), this.w - ( this.w / 6 ), this.h/2);
        }
        if ( view_hit_box ) drawSquare(this.hitbox_x, this.hitbox_y, this.hitbox_w, this.hitbox_h, 'red');
        // if ( view_hit_box ) drawSquare(this.x, this.y, this.w, this.h, 'red');
    }

    Animate()
    {
        /// 키 감지 섹션 ///

        // 점프 구현.
        if ( keys['Space'] || keys['KeyW'] )
        {   // 스패이스 키 또는 w키 누를 경우.
            // 점프 함수 호출.
            this.Jump();
        }
        else
        {
            this.jumpTimer = 0;
        }

        // 숙이기 구현.
        if ( (keys['ShiftLeft'] || keys['KeyS']) && this.grounded )
        {   // 왼쪽 쉬프트 키 또는 s 키르 누를 경우.
            // 숙이기 구현.
            // this.y += this.h / 2;
            // this.y += this.originalHeight / 2;
            // this.h = this.originalHeight / 2;
            
            // this.y += this.originalHeight - 10;
            // this.h = this.originalHeight - 10;
//////////////////////////////////////////////////디버깅
            // 1. 숙이기 구현 : 숙이기 이미지는 이미지 상으로만 반으로 줄어들지,
            // 실제 이미지 크기는 숙이기 전 이미지와 숙인 후 이미지의 크기가 동일하므로 히트 박스의 크기만 절반으로 줄인다.
            this.hitbox_h = this.hitbox_originalHeight / 2;
        }
        else
        {
            // this.h = this.originalHeight;
            // 숙이지 않으면 히트박스 원래 사이즈로 복구.
            this.hitbox_h = this.hitbox_originalHeight;
        }
        this.y += this.dy;
        this.hitbox_y += this.dy;
        
        /// 중력 작용 섹션 ///
        if ( this.y + this.h < cvs.height )
        {   // 공중에 떠 있을 경우.
            ////////////////////커스터마이징코드.
            this.dy += (keys['ShiftLeft'] || keys['KeyS']) ? gravity*4 : gravity; // 중력만큼 값 늘림. 숙일 경우 더 빠르게 떨어짐
            this.grounded = false;
        }
        else
        {
            this.dy = 0;
            this.grounded = true;
            this.y = cvs.height - this.h;  // 바닥에 딱 붙어 있게 해줌.
            this.hitbox_y = cvs.height - minus_dino_hitbox_size - this.hitbox_h;
        }
        /// 한 프레임에서 2번 그리게 되므로 주석.
        // this.Draw();
    }

    Jump()
    {
        if ( this.grounded && this.jumpTimer == 0 )
        {
            this.jumpTimer = 1;
            this.dy = -this.jumpForce;
        }
        else if ( this.jumpTimer > 0 && this.jumpTimer < 15 )
        {
            this.jumpTimer++;
            this.dy = -this.jumpForce - (this.jumpTimer / 50); // 갈 수록 빠르게 떨어지는 것을 구현한 식.
        }
    }
    
    // 공룡 체력 깎아주는 함수.
    downHp( minus_hp=15 ) {
        this.hp -= minus_hp;
    }
}



class Obstacle
{
    constructor( x, y, w, h, c, obstacle_number=0 )
    {
        this.x = x;
        this.y = y;

        this.w = w;
        this.h = h;
        this.c = c;
        this.dx = -gameSpeed;
        // 운석 낙하 가속 시  사용됨.
        this.dy = meteorSpeed;
        this.obstacle_number = obstacle_number;
        this.obstacle_img_url = obstacle_img_url_map(obstacle_number) ?? obstacle_img_url_map('meteor0');

        ///////////////////////////// 추후 기능 추가!!!!
        if ( this.obstacle_number <= 1 )
        {   // 메테오인 경우.
            this.hitbox_x = x + minus_meteor_hitbox_size/2;
            this.hitbox_w = w - minus_meteor_hitbox_size;
            
            this.hitbox_y = y + minus_meteor_hitbox_size;
            this.hitbox_h = h - minus_meteor_hitbox_size*2;
        }
        else
        {   // 돌인 경우.
            this.hitbox_x = x + minus_stone_hitbox_size;
            this.hitbox_w = w - minus_stone_hitbox_size*2;
            
            this.hitbox_y = y + minus_stone_hitbox_size;
            this.hitbox_h = h - minus_stone_hitbox_size*2;

        }
    }

    Update()
    {
        // 운석 장애물인 경우.
        if ( this.obstacle_number <= 1 )
        {
            // 1. 낙하 좌표 계산. 속도는 점점 증가.
            this.y += this.dy;
            this.hitbox_y += this.dy;
            // 2. 공룡은 앞으로 나아가므로 운석은 화면 왼쪽 방향으로 떨어짐. 속도는 공룡의 속도와 동일.
            this.x += -gameSpeed*1.2;
            this.hitbox_x += -gameSpeed*1.2;
            // 3. 계산된 좌표값들을 이용해 오브젝트 위치 업데이트.
            this.Draw();
            // 4. 다음 프레임에 쓰일 낙하속도 증가량 계산.
            this.dy += 0.2;
        }
        // 돌 장애물인 경우.
        else
        {
            this.x += this.dx;
            this.hitbox_x += this.dx;
            this.Draw();
            this.dx = -gameSpeed;
        }
    }

    Draw()
    {
        // const obstacle_img = {
        //     'meteor0' : './img/meteor0.png',
        //     'meteor1' : 
        // };
        // let img = new Image();
        // img.src = './img/catus.png';
        // img.src = ( this.isBird ) ? ('./img/bird.png') : ('./img/catus.png');
        // ctx.drawImage(img, this.x, this.y, this.w, this.h);
        if ( game_over ) return;
        const img = new Image();
        img.src = this.obstacle_img_url;
        ctx.drawImage(img, this.x, this.y, this.w, this.h);
        // if ( view_hit_box ) drawSquare(this.x, this.y, this.w, this.h, this.c);
        if ( view_hit_box ) drawSquare(this.hitbox_x, this.hitbox_y, this.hitbox_w, this.hitbox_h, this.c);
    }
}


class Text
{
    constructor( t, x, y, a, c, s )
    {
        this.t = t;
        this.x = x;
        this.y = y;
        this.a = a;
        this.c = c;
        this.s = s;
    }

    Draw()
    {
        if ( game_over ) return;

        ctx.beginPath();
        ctx.fillStyle = this.c;
        ctx.font = `${this.s}px sans-serif`;
        ctx.textAlign = this.a;
        ctx.fillText(this.t, this.x, this.y);
        ctx.closePath();
    }

}



class Background
{
    constructor( img_url )
    {
        // 천지 흔들림 발동!
        this.is_shaking = false;
        this.background_grrr_power = background_shaking_power;
        this.grrr_power = this.background_grrr_power;
        this.background_shaking_on = false;


        // 배경이미지 좌표.
        this.img_x = -this.grrr_power;
        this.img_y = -this.grrr_power;
        this.img_width = cvs.width + this.grrr_power*2;
        this.img_height = cvs.height + this.grrr_power*2;
        
        
        // 이미지.
        this.img = new Image();
        this.img.src = img_url;
        
        // 자동 애니메이션.
        this.BGRD_animate;
    }
    
    
    Init()
    {
        this.img_x = -this.grrr_power;
        this.img_y = -this.grrr_power;
        this.img_width = cvs.width + this.grrr_power*2;
        this.img_height = cvs.height + this.grrr_power*2;
    }
    
    
    Animate()
    {   // 호출 시, 현재 세기 값으로 랜덤한 방향 및 길이로 좌표 계산.
        if ( this.grrr_power !== 0 )
        {
            
            let random_grrr_x = -RandomIntInRange(0, this.grrr_power);
            let random_grrr_y = -RandomIntInRange(0, this.grrr_power);
            
            this.img_x = random_grrr_x;
            this.img_y = random_grrr_y;
            // this.img_x = random_grrr_x + this.grrr_power;
            // this.img_y = random_grrr_y + this.grrr_power;
        }
    }


    Shaking( power=100, millis=800 )
    {
        this.grrr_power = power;
        this.Init();
        
        // 0. 인터버 호출 가능한지 확인.
        if ( !this.is_shaking )
        {
            // 1. 인터버 중복 호출 방지를 위해 인터버 작동 유무 변수 업데이트.
            this.is_shaking = true;
            // 2. 화면 흔들기 인터버 호출됨.
            this.BGRD_animate = setInterval(
                // 3. 현재 객체를 가리키는 this를 받아옴.
                function( get_this )
                {
                    // 4. 기본 흔들림 값이 설정하고싶은 흔들림 값보다 더 큰 경우 현재 함수를 호출하는 의미가 없으므로 인터버 종료.
                    if ( get_this.grrr_power <= get_this.background_grrr_power )
                    {
                        // 5. 인터버가 종료됐다는 상태로 전환. 인터버 호출 가능 상태.
                        get_this.is_shaking = false;
                        get_this.grrr_power = get_this.background_grrr_power;
                        clearInterval(get_this.BGRD_animate);
                    }
                    // 4. 그 외의 경우 화면 흔들림의 크기를 자연스럽게 줄임.
                    else
                    {
                        get_this.grrr_power -= 2;
                        get_this.Init();
                    }
                },
                50,
                this
            );
        }
    }
    

    Draw()
    {
        if ( !game_over )
        ctx.drawImage(this.img, this.img_x, this.img_y, this.img_width, this.img_height);
    }

};



function SpawnObstacle()
{
    let size = RandomIntInRange(40, 70);  // 사이즈는 20~70 사이.
    // let type = RandomIntInRange(0, 1);  // 1 : 새, 0 : 선인장.
    
    /// 장애물 종류 선정 섹션 ///
    // 1. 장애물 객체 생성.
    let obstacle;
    const obstacle_number = RandomIntInRange(0, 3);
    if ( obstacle_number > 1 )
    {   // 돌인 경우.
        obstacle = new Obstacle(cvs.width, cvs.height-size, size, size, 'red', obstacle_number);
    }
    else
    {   // 메테오.
        const random_x = RandomIntInRange(dino.w * 4, cvs.width);
        obstacle = new Obstacle(random_x, -size, size, size, 'red', obstacle_number);
    }
    

    obstacles.push(obstacle);  // 장애물 객체 추가.
}

function RandomIntInRange( min, max )
{
    return Math.round(Math.random() * (max - min) + min);
}


function init()
{
    game_over = false;
    obstacles = [];
    score = 0;
    spawnTimer = initialSpawnTimer;
    gameSpeed = 4;
    meteorSpeed = 4;
    background.background_grrr_power = background_shaking_power;
    dino.hp = 100;
    
    window.localStorage.setItem('highscore', highscore);
}

// 맨 처음 시작
async function Start()
{
    cvs.width = window.innerWidth;
    cvs.height = window.innerHeight;
    
    ctx.font = "20px sans-serif";
    
    gameSpeed = 4;
    meteorSpeed = 4;
    gravity = 1;
    score = 0;
    highscore = window.localStorage.getItem('highscore') ?? 0;


    get_country_code = null;
    // 0. 나라 정보를 가져오기 위해 json 형태로 데이터 요청.
    await getJSON(
        'https://ipapi.co/json/',
        function( res )
        {
            if ( res.status === 200 )
            {
                // 1. 나라 정보 가져오기.
                get_country_code = res.response.country_code;
                console.log(`나라 정보 가져오기 성공! : ${ get_country_code }`);
                // alert(`나라 정보 가져오기 성공! : ${ get_country_code }`);
            }
            else if ( res.status === 429 )
            {   // 1. 당신은 제한되었습니다.     당분간 사용할 수 없습니다.
                console.log(`you are banned frome free api\nstatus : ${res.status}\nres : ${res.response}\nheaders : ${res.headers}`);
            }
            else
            {
                console.log(`status : ${res.status}\nres : ${res.response}\nheaders : ${res.headers}`);
            }

            background = new Background(background_img_url);
            background.Init();
            // 2. 공룡 객체 생성 시 가져온 나라 정보를 같이 넘겨줌.
            dino = new Dino(80, cvs.height-150, 50, 50, "red", get_country_code);
            scoreText = new Text(`Score : ${score}`, 25, 25, 'left', 'white', '20');
            highscoreText = new Text(`Highscore : ${highscore}`, cvs.width - 25, 25, 'right', 'white', '20');
            hpText = new Text(`현재 HP : ${dino.hp}`, 25, 45, 'left', 'white', '20');
            BackgroundMusicPlayer.src = sound_url_map('background');
            NoiseMusicPlayer.src = sound_url_map('noise');

            
            BGRD_auto_update_window = setInterval(
                function()
                {
                    cvs.width = window.innerWidth;
                    cvs.height = window.innerHeight;

                    scoreText.x = 25;
                    scoreText.y = 25;

                    highscoreText.x = cvs.width - 25;
                    highscoreText.y = 25;

                    hpText.x = 25;
                    hpText.y = 45;

                    background.Init();
                },
                500
            );

            
            requestAnimationFrame(Update);
            return;
        }
    );


        
}

let initialSpawnTimer = 200;  // 기본 스폰 타이머.
let spawnTimer = initialSpawnTimer;

// 화면 업데이트
function Update()
{
    requestAnimationFrame(Update);
    // ctx.clearRect(0,0, cvs.width, cvs.height);
    background.Animate();
    background.Draw();
    dino.country_code = get_country_code;
    dino.Animate();
    dino.Draw();

    spawnTimer--;
    if ( spawnTimer <= 0 )
    {
        SpawnObstacle();
        console.log(obstacles);  //////////////디버깅
        spawnTimer = initialSpawnTimer - gameSpeed * 8;

        if ( spawnTimer < 60 )
        {
            spawnTimer = 60;
        }


    }

    /// 장애물 제거 및 동작 섹션 ///
    for ( let index=0; index<obstacles.length; index++ )
    {
        let o = obstacles[index];

        if ( o.x + o.w < 0 && o.obstacle_number > 1 )
        {   // 돌이 화면 뒤로 완전히 넘어갔다면.
            // obstacles.splice(index, 1);
            obstacles = obstacles.slice(0, index).concat( obstacles.slice(index+1) );
        }
        
        if ( o.y + o.h > cvs.height && o.obstacle_number <= 1 )
        {   // 메테오가 화면 아래로 완전히 넘어갔다면.
            // obstacles.splice(index, 1);
            //////////////////////////////////////////////////////////////디버깅
            // 1. 운석 충돌(화면 흔들림 효과) 발생.
            background.Shaking(60+gameSpeed*1.2+background.background_grrr_power*1.2, 800);
            // 2. 충돌한 운석 삭제.
            obstacles = obstacles.slice(0, index).concat( obstacles.slice(index+1) );
            // 3. 충돌 사운드 재생. explosion0 또는 explosion1 재생.
            sound_list.push(new Audio());
            sound_list[sound_list.length-1].src = sound_url_map( RandomIntInRange(0, 1) );
        }
        

        if (
            // dino.x < o.x + o.w &&
            // dino.x + dino.w > o.x &&
            // dino.y < o.y + o.h &&
            // dino.y + dino.h > o.y
            
            dino.hitbox_x < o.hitbox_x + o.hitbox_w &&
            dino.hitbox_x + dino.hitbox_w > o.hitbox_x &&
            dino.hitbox_y < o.hitbox_y + o.hitbox_h &&
            dino.hitbox_y + dino.hitbox_h > o.hitbox_y
        )
        {
            // 장애물에 닿았고, 체력이 0이 되었을때 초기화됨
            if ( !naver_die )
            {
                // 1. 장애물이 0, 1번 장애물(메테오)인 경우는 25씩, 3 이상의 장애물(일반)인 경우엔 15씩 닳음.
                const minus_hp = (o.obstacle_number<=1) ? (25) : (15);
                dino.downHp(minus_hp);
                // 2. 장애물을 삭제시킴.
                obstacles = obstacles.slice(0, index).concat( obstacles.slice(index+1) );
                // 3. 천지가 흔들림.
                background.Shaking(30, 500);
                // 4. 충돌 사운드 0,1번 중 랜덤 재생.
                sound_list.push( new Audio() );
                sound_list[sound_list.length-1].src = sound_url_map( RandomIntInRange(0, 1) );
            }
            

            if (dino.hp <= 0) {
                // 공룡의 체력이 0 이하가 됐을 때 게임 종료.                
                NoiseMusicPlayer.pause();
                NoiseMusicPlayer.currentTime = 0;
                NoiseMusicPlayer.autoplay = false;
                gameSpeed = 0;
                meteorSpeed = 0;
                game_over = true;
            }
        }
        // 1. 오디오 멀티 재생.
        for ( let audio of sound_list )
        {
            audio.play();
        }
        // 2. 모두 재생 후 비우기.
        sound_list = [];
        o.Update();
    }
    gameSpeed += 0.003;
    meteorSpeed += 0.003;
    background.background_grrr_power += 0.0015;


    // meteorSpeed += 0.1;
    // gameSpeed += 0.1;
    
    score++;
    scoreText.t = `Score : ${score}`;
    scoreText.Draw();
    if ( score > highscore )
    {
        highscore = score;
        highscoreText.t = `Highscore : ${highscore}`;
    }
    highscoreText.Draw();

    hpText.t = `HP : ${dino.hp}`;
    hpText.Draw();

}

function keyDownEvent( e )
{
    if ( !BackgroundMusicPlayer.autoplay )
    {
        BackgroundMusicPlayer.pause();
        BackgroundMusicPlayer.currentTime = 0;
        BackgroundMusicPlayer.loop = true;
        BackgroundMusicPlayer.autoplay = true;
        BackgroundMusicPlayer.play();
    }
    else if ( score >= 5000 && !NoiseMusicPlayer.autoplay )
    {
        NoiseMusicPlayer.pause();
        NoiseMusicPlayer.currentTime = 0;
        NoiseMusicPlayer.loop = true;
        NoiseMusicPlayer.autoplay = true;
        NoiseMusicPlayer.play();
    }
    keys[e.code] = true;
}

function keyUpEvent( e )
{
    keys[e.code] = false;
    if ( game_over )
    {
        alert(`GAME OVER\nSCORE : ${score} / HIGHTSCORE : ${highscore}\n OK to Retry`);
        init();
    }
}

document.addEventListener("keydown", keyDownEvent);
document.addEventListener("keyup", keyUpEvent);




Start();
