$(function () {

    // <========================================= Default Variables ============================================================>

    var participantID = '';
    var countDown, timeWatch;
    var mode = 'demo'; // training or INTA or INTB or demo
    var responseStore = '';
    var TrialStoreIndex = [0, 0]; // Block,Trial
    var TrialOutputStore = [];
    var TrialOptions = [
        ["PEN", "BRUSH", "MEDIUM", "THIN", "THICK", "PENCIL", "MEDIUM", "PEN", "THICK", "THIN"],
        ["THIN", "THICK", "PEN", "MEDIUM", "PENCIL", "THICK", "THIN", "MEDIUM", "BRUSH", "PEN"]
    ];
    var errorCount = 0;

    //  Variable store exclusively for INT A

    var possibleDemoOptions = ["PEN", "PENCIL", "BRUSH", "MEDIUM", "THIN", "THICK"];
    var mainOptionsTouch, subOptionsTouch, menuBarTouch, mainOptionsPress, subOptionsPress, menuBarPress;

    //  Variable store exclusively for INT B
    var INTBTouchPanel;
    var touchPause = true;
    var optionMatrix = [
        ["PEN", "PENCIL", "BRUSH"],
        ["THIN", "MEDIUM", "THICK"]
    ];
    var INTBTrainingStoreIndex = 0;
    var INTBOptions = [
        "PEN", "PENCIL", "BRUSH", "THIN", "MEDIUM", "THICK", "BRUSH", "PENCIL", "PEN", "THICK",
        "MEDIUM", "THIN", "PEN", "THIN", "BRUSH", "THICK", "PENCIL", "MEDIUM", "PEN", "THICK"
    ];

    // <========================================= Common Event Handlers ========================================================>

    $('input[type="range"]').rangeslider({
        polyfill: false
    });

    $(".goto-button").click(function (event) {
        var screenID = event.target.id.split("goto-")[1];
        showScreen(screenID);
    });

    $("#questionnaire").submit(function (event) {
        event.preventDefault();
        alert("Thanks for taking part in the study .");
        var answerStore = [];
        for (var i = 1; i < 13; i++) {
            answerStore.push(participantID + "," + (i >= 6 ? "B" : "A") + "," + $("#question-" + i).val())
        }
        saveData(participantID + "-" + "questionnaire", answerStore);
        resetStudy();
    });

    $("#pid-form").submit(function (event) {
        event.preventDefault();
        var level = $("#choice").val();
        participantID = $("#participantid").val();
        if (participantID) {
            showScreen(level == 'INTA' ? 'screen-3' : (level == 'INTB' ? 'screen-6' : 'screen-9'));
        } else {
            alert("Participant ID cannot be empty");
        }
    });

    // <================================ Utlitlity Functions commonly used in both interfaces =================================>

    function startTimer() {
        countDown = 0;
        timeWatch = setInterval(function () {
            countDown += 1;
        }, 1);
    }

    function stopTimer() {
        clearInterval(timeWatch);
    }

    function resetStudy() {
        TrialStoreIndex = [0, 0];
        responseStore = '';
        TrialOutputStore = [];
        showScreen('screen-2');
        touchPause = true;
        errorCount = 0;
        $(".screen-5" + " h1.para-title").text('INTERFACE A -BLOCK 1');
    }

    function saveData(name, dataArray) {
        var csvContent = "data:text/csv;charset=utf-8," + dataArray.join("\n");
        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", name + ".csv");
        link.click();
    }

    function showScreen(screenID) {

        // INTERFACE A
        if (screenID == 'screen-3') {
            mode = 'demo';
            reinitialize(screenID);
        }
        if (screenID == 'screen-4' || screenID == 'screen-5') {
            mode = (screenID == 'screen-4') ? 'training' : 'INTA';
            reinitialize(screenID);
            // show start stimuli button and hide existing stimuli
            $("." + screenID + " .start-stimuli-interface-A").removeClass("hidden");
            $("." + screenID + " .interface-A-stimuli").addClass("hidden");
            $("." + screenID + " div.main-options").addClass("hidden");
        }
        //  INTERFACE B
        if (screenID == 'screen-6') {
            mode = 'demo';
            INTBTrainingStoreIndex = 0;
            $(".screen-6 .para-title").text("INTERFACE B");
            reinitializeTouchPanel(screenID);
            alert("This is a multi touch interface.The red coloured panel is where you can touch.To choose PEN,PENCIL or BRUSH you will need to first place a finger on the left side of the panel and then follow it with a second touch to the top , right or bottom of the first touch .For THIN,MEDIUM and THICK the first touch needs to be on the right of the screen and the second touch to the top , left or bottom of the first one.Make sure the first finger is in place while performing the second touch.Go ahead and try choosing a couple of options.Once you feel you are comfortable with the interface proceed to training.")
        }

        if (screenID == 'screen-7' || screenID == 'screen-8') {
            resetStudy();
            mode = (screenID == 'screen-7') ? 'training' : 'INTB';
            touchPause = true;
            reinitializeTouchPanel(screenID);
            // show start stimuli button and hide existing stimuli
            $("." + screenID + " .start-stimuli-interface-B").removeClass("hidden");
            $(".screen-6 .para-title").removeClass('small-box');

            if (screenID == 'screen-7') {
                alert("This is the training phase.You will be shown 20 stimuli on screen and you will have to select the corresponding options on the red touch panel.Correct selections will be higlighted in green while wrong ones will be shown in red.");
            } else {
                alert("This is the start of the Block 1 for INTERFACE B.PLease be as fast as you can");
            }
        }

        $("body>.screen").addClass('hidden');
        $("body>." + screenID).removeClass('hidden');
    }

    // <==========================================Functions built exclusively for INTERFACE A =========================================================>

    // Event listener that starts showing stimuli when button is clicked 
    $(".start-stimuli-interface-A").click(function (event) {
        var screenID = mode == 'INTA' ? 'screen-5' : 'screen-4';
        $("." + screenID + " .start-stimuli-interface-A").addClass('hidden');
        $("." + screenID + " .menu-tab").removeClass("hidden");
        showStimuli(screenID);
    });

    // Function that selects the on screen stimuli to be shown based on the mode user is in and also switches between blocks
    function showStimuli(screenID) {
        window.setTimeout(function () {
            if (screenID == 'screen-4') {
                responseStore = possibleDemoOptions[Math.floor(Math.random() * 6)];
                $("." + screenID + ' .interface-A-stimuli').removeClass('red-border').removeClass('green-border').text(responseStore).removeClass('hidden');
                startTimer();
            } else {
                if (TrialStoreIndex[1] < 10) {
                    responseStore = TrialOptions[TrialStoreIndex[0]][TrialStoreIndex[1]];
                    TrialStoreIndex[1] = TrialStoreIndex[1] + 1; // increment trial value
                    $("." + screenID + ' .interface-A-stimuli').removeClass('red-border').removeClass('green-border').text(responseStore).removeClass('hidden');
                    startTimer();
                } else if (TrialStoreIndex[0] == 0 && TrialStoreIndex[1] == 10) {
                    TrialStoreIndex[0] = TrialStoreIndex[0] + 1; // increment block value
                    TrialStoreIndex[1] = 0; // reset trial value
                    $("." + screenID + " .start-stimuli-interface-A").removeClass('hidden');
                    $("." + screenID + " .interface-A-stimuli").addClass("hidden");
                    $("." + screenID + " .menu-tab").addClass("hidden");
                    $("." + screenID + " h1.para-title").text('INTERFACE A - BLOCK 2');
                } else {
                    console.log(TrialOutputStore);
                    saveData(participantID + "-" + "INTA", TrialOutputStore);
                    alert("Interface A Study Complete.If you havent finished Interface B please proceed to that else proceed to the Questionnaire.");
                    resetStudy();
                }
            }
        }, 1000);
    }

    // Function that handles touch events for interface A
    function reinitialize(screenIndex) {
        if (mainOptionsTouch)
            mainOptionsTouch.destroy();
        if (subOptionsTouch)
            subOptionsTouch.destroy();
        if (menuBarTouch)
            menuBarTouch.destroy();
        if (mainOptionsPress)
            mainOptionsTouch.destroy();
        if (subOptionsPress)
            subOptionsTouch.destroy();
        if (menuBarPress)
            menuBarTouch.destroy();

        function MenuCallBack(event) {
            $("." + screenIndex + " .interface-A-touch .main-options").toggleClass('hidden');
        }

        function mainOptionsCallBack(event) {
            if (event.target && event.target.id && (event.target.id == 'method' || event.target.id == 'thickness')) {
                $("." + screenIndex + " .sub-options").addClass("hidden");
                $("." + screenIndex + " #sub-options-" + event.target.id).removeClass('hidden');
            }
        }

        function subOptionsCallBack(event) {
            if (event.target && event.target.id && (event.target.id.indexOf("interfaceA-") >= 0)) {
                $("." + screenIndex + " .sub-options").addClass("hidden");
                $("." + screenIndex + " .interface-A-touch .main-options").addClass('hidden');
                var selectedValue = event.target.id.split("interfaceA-")[1];
                if (mode == 'demo') {
                    $("." + screenIndex + ' #interfaceA-selected-option').text("SELECTED OPTION - " + selectedValue);
                } else if (mode == "training" || mode == "INTA") {
                    if (responseStore == selectedValue) {
                        $("." + screenIndex + ' .interface-A-stimuli').removeClass('red-border').addClass('green-border');
                        stopTimer();
                        showStimuli(screenIndex);
                        if (mode == 'INTA') {
                            TrialOutputStore.push(participantID + "," + mode + "," + TrialStoreIndex.join(",") + "," + countDown + "," + errorCount);
                        }
                        errorCount = 0;
                    } else {
                        if (mode == 'INTA') {
                            errorCount++;
                        }
                        $("." + screenIndex + ' .interface-A-stimuli').addClass('red-border').removeClass('green-border');
                    }
                }
            }
        }
        // Quick Fix so touch works for press and tap 
        menuBarTouch = Hammer($("." + screenIndex + ' .interface-A-touch .fa-ellipsis-v')[0]).on("tap", MenuCallBack);
        mainOptionsTouch = Hammer($("." + screenIndex + ' .interface-A-touch .main-options')[0]).on("tap", mainOptionsCallBack);
        subOptionsTouch = Hammer($("." + screenIndex + ' .interface-A-touch .sub-options-container')[0]).on("tap", subOptionsCallBack);
        menuBarPress = Hammer($("." + screenIndex + ' .interface-A-touch .fa-ellipsis-v')[0]).on("press", MenuCallBack);
        mainOptionsPress = Hammer($("." + screenIndex + ' .interface-A-touch .main-options')[0]).on("press", mainOptionsCallBack);
        subOptionsPress = Hammer($("." + screenIndex + ' .interface-A-touch .sub-options-container')[0]).on("press", subOptionsCallBack);
    }

    // <==========================================Functions built exclusively for INTERFACE B =========================================================

    // Event listener that starts showing stimuli in INT B when button is clicked 
    $(".start-stimuli-interface-B").click(function (event) {
        var screenID = mode == 'INTB' ? 'screen-8' : 'screen-7';
        $("." + screenID + " .start-stimuli-interface-B").addClass('hidden');
        touchPause = false;
        showStimuliINTB(screenID);
    });

    // Function that selects the on screen stimuli to be shown based on the mode user is in and also switches between blocks
    function showStimuliINTB(screenID) {
        window.setTimeout(function () {
            if (screenID == 'screen-7') {
                if (INTBTrainingStoreIndex < INTBOptions.length) {
                    responseStore = INTBOptions[INTBTrainingStoreIndex++];
                    $("." + screenID + ' .para-title').addClass("small-box").removeClass('red-border').removeClass('green-border').text(responseStore);
                    startTimer();
                } else {
                    // Training over 
                    alert("Your training level has been completed . You may begin Block 1");
                    showScreen('screen-8');
                }

            } else {
                if (TrialStoreIndex[1] < 10) {
                    responseStore = TrialOptions[TrialStoreIndex[0]][TrialStoreIndex[1]];
                    TrialStoreIndex[1] = TrialStoreIndex[1] + 1; // increment trial value
                    $("." + screenID + ' .para-title').addClass("small-box").removeClass('red-border').removeClass('green-border').text(responseStore);
                    startTimer();
                } else if (TrialStoreIndex[0] == 0 && TrialStoreIndex[1] == 10) {
                    TrialStoreIndex[0] = TrialStoreIndex[0] + 1; // increment block value
                    TrialStoreIndex[1] = 0; // reset trial value
                    $("." + screenID + " .start-stimuli-interface-B").removeClass('hidden');
                    $("." + screenID + " h1.para-title").removeClass("small-box").removeClass('red-border').removeClass('green-border').text('INTERFACE B - BLOCK 2');
                    touchPause = true;
                } else {
                    console.log(TrialOutputStore);
                    saveData(participantID + "-" + "INTB", TrialOutputStore);
                    alert("Interface B Study Complete.If you havent finished Interface A please proceed to that else proceed to the Questionnaire.");
                    resetStudy();
                }
            }
        }, 1000);
    }

    // Function that handles touch events for interface A

    // For LG G6 the test device - The screen width values vary from 0 to 350 so if we were to keep the mid point at 175 then
    // a first finger touch can be categorised as a left if value < 175 and right if not.
    // For the second action we will need to categorise on basis of the difference in touch position values between the first and second touch
    // In the X axis the difference varies from -440 to +440 and in the Y axis the values range from -275 to +275 aproximately 
    // On recalibrating to a range of 100 some values might overshoot 100 this is because of range approximation

    //  Touch Mapping 

    //  First-Touch  Second-Touch Value 

    //  left         top          PEN
    //  left         right        PENCIL
    //  left         bottom       BRUSH

    //  right        top          THIN
    //  right        left        MEDIUM
    //  right        bottom       THICK

    // 1st Left -> 0 and Right -> 1
    // 2nd top -> 0 and right -> 1 and bottom -> 2
    // We can store our possible values in a 2 X 3 Matrix
    // optionMatrix = [["PEN","PENCIL","BRUSH"],["THIN","MEDIUM","THICK"]];

    function reinitializeTouchPanel(screenIndex) {
        if (INTBTouchPanel) {
            INTBTouchPanel.destroy();
        }
        var touchMe = $("." + screenIndex + ' .interface-B-touch')[0];
        var firstTouchIndex, secondTouchIndex, Xdiff, Ydiff, ModdedYdiff;
        Touchy(touchMe, {
            one: function (hand, finger) {
                return;
            },
            // Only run when exactly two fingers on screen
            two: function (hand, finger1, finger2) {
                Xdiff = finger1.lastPoint.x - finger2.lastPoint.x;
                Ydiff = finger1.lastPoint.y - finger2.lastPoint.y;
                firstTouchIndex = finger1.lastPoint.x > 175 ? 1 : 0;
                //Take mod of both ranges 
                Xdiff = Xdiff > 0 ? Xdiff : (-1 * Xdiff);
                // Retain Ydiff polarity as is to find out top or bottom not needed for Xdiff as already get left or right using the first finger position
                ModdedYdiff = Ydiff > 0 ? Ydiff : (-1 * Ydiff);
                // Re calibrate onto a scale of 100 X(0,440) and Y(0,275)
                Xdiff = Math.round((Xdiff / 440) * 100);
                ModdedYdiff = Math.round((ModdedYdiff / 350) * 100);

                if (Xdiff > 20 && ModdedYdiff < 20) {
                    secondTouchIndex = 1
                } else if (Xdiff < 20 && ModdedYdiff > 20) {
                    secondTouchIndex = (Ydiff > 0) ? 0 : 2;
                }
                // Touch positions are ambiguous so pick the bigger value - Need to rewrite - there must be a more elegant way
                else {
                    if (Xdiff > ModdedYdiff) {
                        secondTouchIndex = 1
                    } else {
                        secondTouchIndex = (Ydiff > 0) ? 0 : 2;
                    }
                }
                useTouchPanelOutput(optionMatrix[firstTouchIndex][secondTouchIndex], screenIndex);
            }
        });
    }

    function useTouchPanelOutput(touchOutput, screenID) {

        if (mode == 'demo') {
            $("." + screenID + " .para-title").text(touchOutput);
        }

        if ((mode == 'training' || mode == 'INTB') && touchPause == false) {

            if (responseStore == touchOutput) {
                $("." + screenID + " .para-title").removeClass('red-border').addClass('green-border');
                stopTimer();
                showStimuliINTB(screenID);
                if (mode == 'INTB') {
                    TrialOutputStore.push(participantID + "," + mode + "," + TrialStoreIndex.join(",") + "," + countDown + "," + errorCount);
                }
                errorCount = 0;
            } else {
                if (mode == "INTB") {
                    errorCount++;
                }
                $("." + screenID + " .para-title").addClass('red-border').removeClass('green-border');
            }

        }
    }
});