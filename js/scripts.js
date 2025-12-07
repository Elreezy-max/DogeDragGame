$(function () {
    console.log("document is ready!");

    //
    // Create multiplier zones dynamically inside the containment wrapper
    //
    function createMultiplierZones() {
        // Remove existing zones if any (helps when reloading)
        $("#containment-wrapper .multizone").remove();

        // Simple zones: small rectangles placed in the play area
        // Positions are percentage-based so they'll work with the fixed container size
        const zones = [
            { id: "zone-x2", label: "×2", top: "10%", left: "5%", width: "18%", height: "20%", multiplier: 2, color: "#d1f0e1" },
            { id: "zone-x3", label: "×3", top: "60%", left: "60%", width: "28%", height: "30%", multiplier: 3, color: "#fde7d9" }
        ];

        zones.forEach(function(z){
            const $z = $("<div></div>")
                .addClass("multizone")
                .attr("id", z.id)
                .css({
                    top: z.top,
                    left: z.left,
                    width: z.width,
                    height: z.height,
                    background: z.color
                })
                .data("multiplier", z.multiplier)
                .text(z.label);

            $("#containment-wrapper").append($z);
        });
    }

    createMultiplierZones();

    //
    // 1. MAKE DOGE DRAGGABLE
    //
    $("#doge-meme-pic").draggable({
        containment: "#containment-wrapper",
        scroll: false,
        drag: function () {
            calculateWow();   // live scoring as user drags
        },
        stop: function () {
            calculateWow();   // final update
        }
    });

    //
    // 2. DOGE SCORE CALCULATION (with multiplier zones)
    //
    function getActiveMultiplier() {
        // Get doge center position relative to containment wrapper
        const $doge = $("#doge-meme-pic");
        const $wrap = $("#containment-wrapper");
        const dogePos = $doge.position();
        const dogeW = $doge.outerWidth();
        const dogeH = $doge.outerHeight();

        const dogeCenterX = dogePos.left + dogeW / 2;
        const dogeCenterY = dogePos.top + dogeH / 2;

        let activeMultiplier = 1;

        // Check each zone: if doge center is inside the zone, use the zone's multiplier
        $("#containment-wrapper .multizone").each(function () {
            const $z = $(this);
            const zLeft = $z.position().left;
            const zTop = $z.position().top;
            const zRight = zLeft + $z.outerWidth();
            const zBottom = zTop + $z.outerHeight();

            if (dogeCenterX >= zLeft && dogeCenterX <= zRight && dogeCenterY >= zTop && dogeCenterY <= zBottom) {
                const zoneMult = Number($z.data("multiplier")) || 1;
                // If multiple zones overlap (unlikely), choose the highest multiplier
                if (zoneMult > activeMultiplier) activeMultiplier = zoneMult;
            }
        });

        return activeMultiplier;
    }

    function calculateWow() {
        var pos = $("#doge-meme-pic").position();

        // base score value (simple and predictable for learning)
        var baseScore = Math.floor(pos.top + pos.left);

        // determine multiplier
        const multiplier = getActiveMultiplier();

        // apply multiplier (but keep integer)
        var score = Math.floor(baseScore * multiplier);

        // cap progress metric at 1000
        const cappedScoreForProgress = Math.max(0, Math.min(score, 1000));

        //
        // UI UPDATES
        //

        // Legacy wow-output (if present on page)
        if ($("#wow-output").length) {
            if (score < 500) {
                $("#wow-output").html('<h2>not much wow (' + score + ')</h2>');
            } else {
                $("#wow-output").html('<h2>so much wow (' + score + ')!!</h2>');
            }
        }

        // Score text
        $("#score-display").text(score);

        // Multiplier badge (create if missing)
        if ($("#mult-badge").length === 0) {
            $("<div id='mult-badge' class='badge badge-secondary text-uppercase mt-2'>x1</div>").insertAfter("#score-progress");
        }
        $("#mult-badge").text("×" + multiplier);

        // Progress bar (max 1000)
        var percent = Math.min((cappedScoreForProgress / 1000) * 100, 100);
        $("#score-progress").css({
            "width": percent + "%",
            "transition": "width 200ms ease"
        });

        // Status message
        if (score < 0) {
            $("#status-message").text("Doge is confused... HOW DID YOU DO DIS");
        }
        else if (score < 300) {
            $("#status-message").text("Doge is warming up...");
        } else if (score < 600) {
            $("#status-message").text("Wow! Doge is gaining power!");
        } else if (score < 900) {
            $("#status-message").text("Much skill. Very drag. Wow.");
        } else {
            $("#status-message").text("MAXIMUM WOW ACHIEVED! 💥🐶");
        }
    }

    // initial call to set UI correctly
    calculateWow();

    // Recreate zones on window resize to stay consistent with layout (mild nicety)
    $(window).on("resize", function () {
        // small debounce
        clearTimeout(window._zoneResizeTimer);
        window._zoneResizeTimer = setTimeout(function () {
            // zones are percent-based so no need to recreate here, but keep in case you change behavior
            // createMultiplierZones();
            calculateWow();
        }, 150);
    });
});

