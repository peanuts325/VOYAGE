$(function () {
    /*=================================================
    ハンバーガーメニュー
    ===================================================*/
    // ハンバーガーメニューのクリックイベント
    //下記も同様の意味となります。
    $(".hamburger").on("click", function () {
        $("header").toggleClass("open");
    });

    // メニューが表示されている時に画面をクリックした場合
    $('.mask').on('click', function () {
        // openクラスを削除して、メニューを閉じる
        $('header').removeClass('open');
    });
    $('.menu__item').on('click', function () {
        // openクラスを削除して、メニューを閉じJる
        $('header').removeClass('open');
    });
});

/*=================================================
PICK UP スワイパー  GSAP
===================================================*/
$(function () {
    const slider = document.querySelector('.swiper');
    const lane = document.querySelector('.swiper-card'); // ← カードのレーン
    const overlay = document.querySelector('.slot-overlay.title');
    const cards = gsap.utils.toArray('.card');

    if (!slider || !lane || cards.length === 0) throw new Error('DOM構成を確認してね');

    // ---- 設定 ----
    const MOBILE_BP = 768;
    const OUTER = true;
    const BASE_CARD = 220;  // 通常カードサイズ
    const BASE_GAP = 60;   // 通常ギャップ
    const MIN_VISIBLE = 3;    // ★ 最低3枚は入れる
    const MOVE = 0.9, STOP = 1.5;

    // レイアウトで更新される値
    let CARD_SIZE = BASE_CARD;
    let GAP = BASE_GAP;
    let SLOT_PX = CARD_SIZE + GAP; // 1スロット幅
    let VISIBLE = MIN_VISIBLE;

    const N = cards.length;
    let head = 0;

    // カードの元インデックス
    cards.forEach((el, i) => el.dataset.i = i);
    const slotOf = (el) => ((+el.dataset.i - head + N) % N);

    // 768px以下はフェード無効化（常に見える）
    function updateVisibilityProgress() {
        if (window.innerWidth <= MOBILE_BP) {
            gsap.set(cards, { opacity: 1 });
            return;
        }
        const base = OUTER ? GAP / 2 : 0;
        const slot1Left = 1 * SLOT_PX + base;
        const slot1Right = slot1Left + SLOT_PX;

        cards.forEach((el) => {
            const x = gsap.getProperty(el, 'x');
            const overlap = (x + CARD_SIZE > slot1Left) && (x < slot1Right);
            gsap.to(el, { opacity: overlap ? 0 : 1, duration: 0.2, overwrite: 'auto' });
        });
    }

    // タイトルの配置：PCは2枚目に重ねる／モバイルは通常フローで上段
    function positionOverlay() {
        if (!overlay) return;

        const base = OUTER ? GAP / 2 : 0;
        const left = 1 * SLOT_PX + base;

        if (window.innerWidth <= MOBILE_BP) {
            // モバイル：重ねない（CSSでposition:staticに）
            slider.classList.add('is-mobile');
            overlay.style.left = '';  // クリア
            overlay.style.top = '';
            overlay.style.width = '';
            overlay.style.height = '';
        } else {
            // PC：2枚目スロットに重ねる
            slider.classList.remove('is-mobile');
            overlay.style.width = `${CARD_SIZE}px`;
            overlay.style.height = `${CARD_SIZE}px`;
            overlay.style.left = `${left}px`;
            overlay.style.top = `${(SLOT_PX - CARD_SIZE) / 2}px`;
        }
    }

    // 画面幅を見て「最低3枚」を保証するサイズ計算
    function computeResponsiveSizes() {
        const sw = lane.clientWidth || 0; // ★ レーンの幅を基準に
        const slotBase = BASE_CARD + BASE_GAP;
        const minVisible = (window.innerWidth <= MOBILE_BP) ? 2 : 3;
        const canShow = Math.floor(sw / slotBase);

        if (canShow >= minVisible) {
            CARD_SIZE = BASE_CARD;
            GAP = BASE_GAP;
            SLOT_PX = CARD_SIZE + GAP;
            VISIBLE = canShow;  // ← 3枚以上入るならそのままOK
        } else {
            VISIBLE = minVisible;  // ← 画面幅が狭いときだけ最低値に強制
            SLOT_PX = sw / minVisible;
            // 狭い時はギャップも圧縮（下限6px）
            GAP = Math.max(6, Math.min(BASE_GAP, Math.round(SLOT_PX * 0.08)));
            CARD_SIZE = Math.max(10, Math.floor(SLOT_PX - GAP));
        }
    }

    function layout() {
        computeResponsiveSizes();

        // レーン（カード帯）の高さは常に1スロット分
        lane.style.height = `${SLOT_PX}px`;

        // タイトルの配置（先に決める）
        positionOverlay();

        const base = OUTER ? GAP / 2 : 0;

        // カードの初期位置
        cards.forEach((el) => {
            gsap.set(el, {
                width: CARD_SIZE,
                height: CARD_SIZE,
                x: slotOf(el) * SLOT_PX + base,
                y: (SLOT_PX - CARD_SIZE) / 2,
                opacity: 1
            });
        });

        updateVisibilityProgress();
    }

    function step() {
        const base = OUTER ? GAP / 2 : 0;

        gsap.to(cards, {
            duration: MOVE,
            ease: 'power1.inOut',
            x: (i, el) => (slotOf(el) - 1) * SLOT_PX + base,
            onUpdate: updateVisibilityProgress,
            onComplete: () => {
                head = (head + 1) % N;
                cards.forEach((el) => gsap.set(el, { x: slotOf(el) * SLOT_PX + base }));
                updateVisibilityProgress();
                gsap.delayedCall(STOP, step);
            }
        });
    }

    window.addEventListener('load', () => { layout(); step(); });
    window.addEventListener('resize', () => {
        layout();
        const base = OUTER ? GAP / 2 : 0;
        cards.forEach((el) => gsap.set(el, { x: slotOf(el) * SLOT_PX + base }));
    });
});






/*=================================================
FIND/voice スライダー jQuery（＋Slick）
===================================================*/
$(function () {

    $('.find__content.slider').slick({
        variableWidth: true, // 4th slide partly visible
        slidesToScroll: 1,
        centerMode: true,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: true,
        appendArrows: $('.arrow_box'),
        prevArrow: '<div class="slide-arrow prev-arrow"></div>',
        nextArrow: '<div class="slide-arrow next-arrow"></div>',
        responsive: [
            {
                breakpoint: 768, // 768px以下のとき
                settings: {
                    variableWidth: false, // 幅可変をOFF
                    slidesToShow: 1,      // 常に1枚だけ表示
                    centerMode: true,     // 中央寄せにする（必要なら）
                    centerPadding: '40px'    // 余白なく中央配置
                }
            }
        ]
    });
});

$(function () {
    $('.voice__wrapper.slider').slick({
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        centerMode: true,
        centerPadding: '20%',   // 左右に“少し見える”余白。px 指定もOK
        speed: 600,
        cssEase: 'ease',
        adaptiveHeight: true,
        arrows: true,
        appendArrows: $('.arrow_box'),
        prevArrow: '<button type="button" class="slide-arrow prev-arrow prev-arrow--voice" aria-label="前へ"></button>',
        nextArrow: '<button type="button" class="slide-arrow next-arrow next-arrow--voice" aria-label="次へ"></button>',
        responsive: [
            { breakpoint: 800, settings: { centerPadding: '5%' } },
            { breakpoint: 480, settings: { centerPadding: '0', slidesToShow: 1 } }
        ]
    });
});


// =================================================
// Parallax .feature GSAP（ScrollTrigger）
// =================================================

// OSで「動きを減らす」がオンならアニメ無効
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduce) {
    gsap.registerPlugin(ScrollTrigger);
    // スクロール量に対する背景の移動量の係数（小さいほど“遅く”見える）
    const parallaxSpeed = 0.05; // 0.1 ~ 0.5 くらいで調整
    gsap.set(".bg-wrapper", { backgroundPosition: "center 0%" });
    ScrollTrigger.create({
        trigger: document.querySelector('.feature'),
        start: "top top",
        end: "bottom top",
        scrub: true,
        scrub: 0.4,
        invalidateOnRefresh: true,
        onUpdate(self) {
            // const y = -window.scrollY * parallaxSpeed;
            const distance = self.end - self.start;         // この区間の高さ(px)
            const y = -(distance * parallaxSpeed * self.progress); // 0 → -distance*係数
            gsap.set(".bg-wrapper", { backgroundPosition: `center ${y}px` });
        }
    });
}

// =================================================
// scroll animation GSAP（ScrollTrigger）
// =================================================
gsap.registerPlugin(ScrollTrigger);

const imageItems = document.querySelectorAll('.image-item');
const container = document.querySelector('.scroll-section');
const textBlock = document.querySelector('.floating-text');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// テキスト全体の初期状態
function initializeImages() {
    gsap.set(textBlock, {
        transformOrigin: "50% 50%",
        scale: 0.1,        // ← 最初から中央に小さく存在
        // autoAlpha: 1,       // ← ずっと見えたまま（フェードしない）
        autoAlpha: 0,       // ← ずっと見えたまま（フェードしない）
        filter: "none",     // ぼかしも不要なら none（好みで "blur(6px)" でもOK）
        clipPath: "none",   // ← クリップで隠さない 要素をマスク（丸や多角形などで切り抜き）して見え方を制限しない
        WebkitClipPath: "none"
    });
}


// カード7枚それぞれの最終座標
function createAnimation() {
    const finalPositions = [
        { x: '6vw', y: '-30vh', rotation: 0 },// 1
        { x: '-25vw', y: '20vh', rotation: 0 },// 2
        { x: '35vw', y: '-32vh', rotation: 0 },// 3
        { x: '25vw', y: '25vh', rotation: 0 },// 4
        { x: '-40vw', y: '-5vh', rotation: 0 },// 5
        { x: '-5vw', y: '35vh', rotation: 0 },// 6
        { x: '-20vw', y: '-35vh', rotation: 0 }// 7
    ];
    
    // 以降の tl.to() のデフォルトeasings設定
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // —— ノブ（ここだけ触れば全体の“体感”が変わります）——
    const CARD_START = 0.3;  // すべてのカードが動き出す最初のタイミング（秒）
    const CARD_STAGGER = 0.2;  // 各カードの“出だし”のズレ幅（秒）←大きくすると「順々に」感が強まる
    const CARD_DURATION = 3;  // 1枚のカードが目的地に着くまでの時間（秒）
    const TEXT_START = 1.3;  // テキスト拡大の開始（秒）
    
    // カード散開：出だしを遅らせ、さらに1枚ずつ間隔を空ける
    imageItems.forEach((item, i) => {
        const pos = finalPositions[i];
        tl.to(item, {
            x: pos.x, y: pos.y, rotation: pos.rotation, scale: 1, duration: CARD_DURATION
        }, CARD_START + i * CARD_STAGGER);
    });
    // —— カード群の「終わる時刻」を計算 ——
    const lastCardStart = CARD_START + (imageItems.length - 1) * CARD_STAGGER;
    const cardsEndTime = lastCardStart + CARD_DURATION;
    
    // —— テキスト：TEXT_START から開始して cardsEndTime にピタッと終わる ——
    const TEXT_DURATION = Math.max(0.001, cardsEndTime - TEXT_START);
    tl.to(textBlock, {
        autoAlpha: 1,
        scale: 1,
        duration: TEXT_DURATION,
        ease: "none"
    }, TEXT_START);
    
    // 末尾に「見た目は変えない3秒」を追加（スクロールは進むが画は止まる）
    const HOLD_SEC = 3;                 // ← 静止したい“長さ”
    tl.to({}, { duration: HOLD_SEC });
    
    return tl;
}

// 動きを減らす設定の人には、最終状態を静的に見せる（スクロールしても動かない)
function attachScrollTrigger() {
    if (reduceMotion) {
        // 動きを抑制：カードは終点、テキストは表示状態へ
        const tl = createAnimation();
        tl.progress(1);
        ScrollTrigger.refresh();
        return;
    }
    
    const animation = createAnimation();
    const SCROLL_RANGE = 500; // %  ← ここを上げ下げするだけで全体の“長さ”を微調整
    ScrollTrigger.create({
        trigger: container,// .container がビューポートに入ってから出るまでが基本の観測範囲。
        start: "top top",// コンテナの上端がビューポートの上端に合ったときに0%開始。
        end: "+=" + SCROLL_RANGE + "%", // コンテンツ高さに依存しない“擬似的スクロール距離”
        scrub: 0.25,// スクロールとアニメを0.25秒ディレイで平滑化（カクつきを抑える）
        pin: true,
        pinSpacing: true,      // pinした分だけ余白を自動追加（デフォルトtrue）
        animation: animation,// 上で作った tl をスクロール進捗にマッピング。
    });
}

// 初期化
function init() {
    initializeImages();
    attachScrollTrigger();
}
document.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', () => { ScrollTrigger.refresh(); });

// =======================================================
// jn__new  data属性フィルタリング jQuery 
// =======================================================
$(function () {
    let $btn = $('.category-btn [data-filter]');
    let $list = $('.category-list [data-category]');

    $btn.on('click', function (e) {
        e.preventDefault();
        let $btnCat = $(this).attr('data-filter');
        $list.stop(true, true);
        $list.removeClass('is-animate');

        if ($btnCat === 'all') {
            $list.fadeOut().promise().done(function () {
                $list.addClass('is-animate').fadeIn();
            });
        }
        else {
            $list.fadeOut().promise().done(function () {
                $list.filter('[data-category = "' + $btnCat + '"]').addClass('is-animate').fadeIn();
            });
        }
    });
});


// =================================================
// jn__new ボタンクリックで色変化 jQuery
// =================================================
$(function () {
    $('.button').on('click', function () {
        $('.button').removeClass('is-active');
        $(this).addClass('is-active');
    });
});

// =====================================================
// jn__new 「もっと見る」ボタン GSAP（ScrollToPlugin）＋JS
// =====================================================    
gsap.registerPlugin(ScrollToPlugin);

const button = document.getElementById("toggleButton");

if (button) {
    // 初期状態で hidden が付いている要素だけを対象にする
    const articles = document.querySelectorAll(".jn__article");
    const initiallyHidden = Array.from(articles).filter(li =>
        li.classList.contains("hidden")
    );

    let expanded = false;
    let openScrollY = 0;

    button.addEventListener("click", () => {
        expanded = !expanded;

        // ボタンを一時的に非表示
        gsap.to(button, { opacity: 0, duration: 0.3, pointerEvents: "none" });

        if (expanded) {
            openScrollY = window.scrollY;

            // ===== 展開（上から順に表示） =====
            initiallyHidden.forEach((li, i) => {
                li.classList.remove("hidden");
                li.style.display = ""; // ← display:none解除
                gsap.fromTo(
                    li,
                    {
                        opacity: 0,
                        y: 30
                    },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.4,
                        delay: i * 0.1,
                        ease: "power2.out"
                    }
                );
            });

            // テキスト変更後、再表示
            button.textContent = "閉じる";
            gsap.to(button, {
                opacity: 1,
                delay: initiallyHidden.length * 0.1 + 0.5,
                duration: 0.4,
                pointerEvents: "auto"
            });
        }

        else {
            // ===== 折りたたみ（下から順に非表示） =====
            const visibleInitiallyHidden = initiallyHidden
                .filter(li => !li.classList.contains("hidden") && li.style.display !== "none")
                .reverse(); // 下から順

            // 📍リストの先頭までスムーズに戻る

            gsap.to(window, {
                scrollTo: { y: openScrollY, autoKill: false },
                duration: 1.2,
                // delay: visibleInitiallyHidden.length * 0.1,
                ease: "power2.inOut"
            });

            visibleInitiallyHidden.forEach((li, i) => {
                gsap.to(li, {
                    opacity: 0,
                    y: -30,
                    duration: 0.4,
                    delay: i * 0.1,
                    ease: "power2.inOut",
                    onComplete: () => {
                        li.style.display = "none";
                        li.classList.add("hidden"); // ← 追加
                    }
                });
            });

            const totalDelay = visibleInitiallyHidden.length * 0.1 + 0.5;

            // テキスト変更を先に
            button.textContent = "記事をさらに読み込む";

            // ボタン再表示
            gsap.to(button, {
                opacity: 1,
                delay: totalDelay,
                duration: 0.4,
                pointerEvents: "auto"
            });
        }
    });
}

// =================================================
// article ヘッダーの線アニメーション
// =================================================
window.addEventListener('load', () => {
    if (location.pathname.includes('article.html')) {
        // console.log('article.htmlのヘッダー線アニメーション');
        document.querySelectorAll('.face__wrapper-top').forEach(el => {
            el.classList.add('is-animated');
        });
    }
});