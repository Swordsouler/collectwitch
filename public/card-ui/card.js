const params = new URLSearchParams(document.location.search);
const image_card = params.get("image_card");
const image_universe = params.get("image_universe");
const color1 = params.get("color1");
const color2 = params.get("color2");
const name = params.get("name");
const state = params.get("state");
const amount = params.get("amount");
const rarity = params.get("rarity");

document.getElementById("card-image").src = image_card;
document.getElementById("universe-image").src = image_universe;

const root = document.documentElement;
root.style.setProperty("--color1", color1);
root.style.setProperty("--color2", color2);

document.getElementById("card-name").innerHTML = name;
document.getElementById("card-state").innerHTML = state;
document.getElementById("card-amount").innerHTML = amount;

const rarityToColor = {
    UNDEFINED: "#888888",
    COMMON: "#00d26a",
    RARE: "#0074ba",
    EPIC: "#8d65c5",
    LEGENDARY: "#ff6723",
};
//change background color of rarity
root.style.setProperty(
    "--rarity",
    rarityToColor[rarity] ?? rarityToColor["UNDEFINED"]
);

var x;
var delay = null;
var $cards = $(".card");
var $style = $(".hover");

$cards
    .on("mousemove touchmove", function (e) {
        // perfom action every 1 second
        if (delay) {
            return false;
        }
        delay = setTimeout(function () {
            delay = null;
        }, 20);

        // normalise touch/mouse
        var pos = [e.offsetX, e.offsetY];
        e.preventDefault();
        if (e.type === "touchmove") {
            pos = [e.touches[0].clientX, e.touches[0].clientY];
        }
        var $card = $(this);
        // math for mouse position
        var l = pos[0];
        var t = pos[1];
        var h = $card.height();
        var w = $card.width();
        var px = Math.abs(Math.floor((100 / w) * l) - 100);
        var py = Math.abs(Math.floor((100 / h) * t) - 100);
        var pa = 50 - px + (50 - py);
        // math for gradient / background positions
        var lp = 50 + (px - 50) / 1.5;
        var tp = 50 + (py - 50) / 1.5;
        var px_spark = 50 + (px - 50) / 7;
        var py_spark = 50 + (py - 50) / 7;
        var p_opc = 20 + Math.abs(pa) * 1.5;
        var ty = ((tp - 50) / 2) * -1;
        var tx = ((lp - 50) / 1.5) * 0.5;
        // css to apply for active card
        var grad_pos = `background-position: ${lp}% ${tp}%;`;
        var sprk_pos = `background-position: ${px_spark}% ${py_spark}%;`;
        var opc = `opacity: ${p_opc / 100};`;
        var tf = `transform: rotateX(${ty}deg) rotateY(${tx}deg)`;
        // need to use a <style> tag for psuedo elements
        var style = `
      .card:hover:before { ${grad_pos} }  /* gradient */
      .card:hover:after { ${sprk_pos} ${opc} }   /* sparkles */ 
    `;
        // set / apply css class and style
        $cards.removeClass("active");
        $card.removeClass("animated");
        $card.attr("style", tf);
        $style.html(style);
        if (e.type === "touchmove") {
            return false;
        }
        clearTimeout(x);
    })
    .on("mouseout touchend touchcancel", function () {
        // remove css, apply custom animation on end
        var $card = $(this);
        $style.html("");
        $card.removeAttr("style");
        x = setTimeout(function () {
            $card.addClass("animated");
        }, 2500);
    });
