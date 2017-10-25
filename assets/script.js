$(function () {

    var participantID = '';
    var countDown, timeWatch;
    var possibleDemoOptions = ["PEN", "PENCIL", "BRUSH", "NORMAL", "THIN", "THICK"];
    var optionStore = '';
    var mode = 'demo'; // training or INTA or INTB or demo
    var mainOptionsTouch, subOptionsTouch;

    $(".goto-button").click(function (event) {
        var screenID = event.target.id.split("goto-")[1];
        showScreen(screenID);
    });

    ///////////////////////////////////// 
    function startTimer() {
        countDown = 0;
        timeWatch = setInterval(function () {
            countDown += 1;
        }, 1);
    }

    function stopTimer() {
        clearInterval(timeWatch);
    }
    ////////////////////////////////////

    function showStimuli(screenID) {
        window.setTimeout(function () {
            optionStore = possibleDemoOptions[Math.floor(Math.random() * 6)];
            $("." + screenID + ' .interface-A-stimuli').removeClass('hidden').removeClass('red-border').removeClass('green-border').text(optionStore);
            startTimer();
        }, 2000);
    }

    $(".start-stimuli-interface-A").click(function (event) {
        var screenID = 'screen-4'
        $("." + screenID + " .start-stimuli-interface-A").addClass('hidden');
        showStimuli(screenID);
    });


    $("#pid-form").click(function () {
        participantID = $("#participantid").val();
        if (participantID) {
            console.log("Participant ID -" + participantID);
            showScreen('screen-3');
        } else {
            alert("Participant ID cannot be empty");
        }
    });


    function showScreen(screenID) {
        if (screenID == 'screen-3') {
            mode = 'demo';
            reinitialize(screenID);
        }
        if (screenID == 'screen-4') {
            mode = 'training';
            reinitialize(screenID);
            // show start stimuli button and hide existing stimuli
            $("." + screenID + " .start-stimuli-interface-A").removeClass("hidden");
            $("." + screenID + " .interface-A-stimuli").addClass("hidden");
        }
        $("body>.screen").addClass('hidden');
        $("body>." + screenID).removeClass('hidden');
    }

    function reinitialize(screenIndex) {
        if (mainOptionsTouch) {
            mainOptionsTouch.destroy();
        }
        if (subOptionsTouch) {
            subOptionsTouch.destroy();
        }

        mainOptionsTouch = Hammer($("." + screenIndex + ' .interface-A-touch .main-options')[0]).on("tap", function (event) {
            if (event.target && event.target.id && (event.target.id == 'method' || event.target.id == 'thickness')) {
                $("." + screenIndex + " .sub-options").addClass("hidden");
                $("." + screenIndex + " #sub-options-" + event.target.id).removeClass('hidden');
            }
        });

        subOptionsTouch = Hammer($("." + screenIndex + ' .interface-A-touch .sub-options-container')[0]).on("tap", function (event) {
            if (event.target && event.target.id && (event.target.id.indexOf("interfaceA-") >= 0)) {
                $("." + screenIndex + " .sub-options").addClass("hidden");
                var selectedValue = event.target.id.split("interfaceA-")[1];
                console.log(selectedValue);
                if (mode == 'demo') {
                    $("." + screenIndex + ' #interfaceA-selected-option').text("OPTION - " + selectedValue);
                }
                if (mode == 'training') {
                    if (optionStore == selectedValue) {
                        $("." + screenIndex + ' .interface-A-stimuli').removeClass('red-border').addClass('green-border');
                        console.log("timer value - " + countDown);
                        stopTimer();
                        showStimuli(screenIndex);
                    } else {
                        $("." + screenIndex + ' .interface-A-stimuli').addClass('red-border').removeClass('green-border');
                    }
                }
            }
        });
    }

});