$(function () {
    console.log("document is ready!");

    var $container = $("#containment-wrapper");

    var zones = [
        {cls: "mult2", leftPct: 8, topPct: 6, wPct: 20, hPct: 30, mult: 2, label: "×2"},
        {cls: "mult3", leftPct: 60, topPct: 50, wPct: 28, hPct: 36, mult: 3, label: "×3"},
        // hidden/stealth zone (smaller)
        {cls: "hidden", leftPct: 36, topPct: 15, wPct: 18, hPct: 18, mult: 4, label: "×4 (hidden)"}
    ];

    $container.addClass("zones-hidden"); // start hidden (user can show)

    zones.forEach(function(z, idx){
        var $z = $("<div class='zone'></div>");
        $z.addClass(z.cls);
        $z.css({
            left: z.leftPct + "%",
            top: z.topPct + "%",
            width: z.wPct + "%",
            height: z.hPct + "%",
            "text-align": "center"
        });
        $z.attr("data-multiplier", z.mult);
        $z.text(z.label);
        $container.append($z);
        z.$el = $z;
    });

    var $toggleBtn = $('<button id="toggle-zones" class="btn btn-outline-primary btn-sm">Show Zones</button>');
    $(".score-box").prepend($toggleBtn);

    $toggleBtn.on("click", function(){
        var hidden = $container.hasClass("zones-hidden");
        if(hidden){
            $container.removeClass("zones-hidden");
            $(this).text("Hide Zones");
            $container.find(".hidden").css("opacity", 0.6);
        } else {
            $container.addClass("zones-hidden");
            $(this).text("Show Zones");
            $container.find(".hidden").css("opacity", 0.12);
        }
    });

    if ($("#mult-badge").length === 0) {
        $("<div id='mult-badge'>×1</div>").insertAfter("#score-display");
    }

    $("#doge-meme-pic").draggable({
        containment: "#containment-wrapper",
        scroll: false,
        drag: function () {
            calculateWow();   
        },
        stop: function () {
            calculateWow();   
        }
    });

    function calculateWow() {
        var $doge = $("#doge-meme-pic");
        var pos = $doge.position(); 
        var dogeW = $doge.outerWidth();
        var dogeH = $doge.outerHeight();
        var centerX = pos.left + dogeW / 2;
        var centerY = pos.top + dogeH / 2;

        var base = Math.floor(pos.top + pos.left);
        if (base < 0) base = 0;

        var multiplier = 1;
        zones.forEach(function(z){
            var el = z.$el;
            if (!el || el.length === 0) return;
            var rect = {
                left: el.position().left,
                top: el.position().top,
                right: el.position().left + el.outerWidth(),
                bottom: el.position().top + el.outerHeight()
            };
            if (centerX >= rect.left && centerX <= rect.right && centerY >= rect.top && centerY <= rect.bottom) {
                multiplier = Math.max(multiplier, parseInt(el.attr("data-multiplier") || 1, 10));
            }
        });

        var score = base * multiplier;

        if ($("#wow-output").length) {
            if (score < 500) {
                $("#wow-output").html('<h2>not much wow (' + score + ')</h2>');
            } else {
                $("#wow-output").html('<h2>so much wow (' + score + ')!!</h2>');
            }
        }

        $("#score-display").text(score);

        $("#mult-badge").text("×" + multiplier);

        var percent = Math.min((score / 1000) * 100, 100);
        $("#score-progress").css("width", percent + "%");

        var status = "";
        if (score <= 50) {
            status = "Doge is warming up...";
        } else if (score < 300) {
            status = "Doge is getting stronger...";
        } else if (score < 600) {
            status = "Wow! Doge is gaining power!";
        } else if (score < 900) {
            status = "Much skill. Very drag. Wow.";
        } else {
            status = "MAXIMUM WOW ACHIEVED! 💥🐶";
        }
        if (multiplier > 1) {
            status += " (Multiplier: ×" + multiplier + ")";
        }
        $("#status-message").text(status);
    }

    calculateWow();
});

