$(function () {

    var participantID = '';
    var countDown, timeWatch;
    var possibleDemoOptions = ["PEN", "PENCIL", "BRUSH", "NORMAL", "THIN", "THICK"];
    var INTAOptions = [
        ["PEN", "BRUSH", "NORMAL", "THIN", "THICK", "PENCIL", "NORMAL", "PEN", "THICK", "THIN"],
        ["THIN", "THICK", "PEN", "NORMAL", "PENCIL", "THICK", "THIN", "NORMAL", "BRUSH", "PEN"]
    ];
    var INTAIndex = [0, 0]; // Block,Trial
    var optionStore = '';
    var mode = 'demo'; // training or INTA or INTB or demo
    var mainOptionsTouch, subOptionsTouch;
    var INTAStore = [];

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

    function resetStudy() {
        INTAIndex = [0, 0];
        optionStore = '';
        INTAStore = [];
        $(".screen-5" + " h1.para-title").text('INTERFACE A -BLOCK 1');
    }

    function saveData(name,dataArray){
        var csvContent = "data:text/csv;charset=utf-8,"+dataArray.join("\n");
        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", name+".csv");
        link.click(); 
    }
    ////////////////////////////////////

    function showStimuli(screenID) {
        window.setTimeout(function () {
            if (screenID == 'screen-4') {
                optionStore = possibleDemoOptions[Math.floor(Math.random() * 6)];
                $("." + screenID + ' .interface-A-stimuli').removeClass('red-border').removeClass('green-border').text(optionStore).removeClass('hidden');
                startTimer();
            } else {
                if (INTAIndex[1] < 10) {
                    optionStore = INTAOptions[INTAIndex[0]][INTAIndex[1]];
                    INTAIndex[1] = INTAIndex[1] + 1; // increment trial value
                    $("." + screenID + ' .interface-A-stimuli').removeClass('red-border').removeClass('green-border').text(optionStore).removeClass('hidden');
                    startTimer();
                } else if (INTAIndex[0] == 0 && INTAIndex[1] == 10) {
                    INTAIndex[0] = INTAIndex[0] + 1; // increment block value
                    INTAIndex[1] = 0; // reset trial value
                    $("." + screenID + " .start-stimuli-interface-A").removeClass('hidden');
                    $("." + screenID + " .interface-A-stimuli").addClass("hidden");
                    $("." + screenID + " div.main-options").addClass("hidden");
                    $("." + screenID + " h1.para-title").text('INTERFACE A - BLOCK 2');
                } else {
                    console.log(INTAStore);
                    saveData(participantID+"-"+"INTA",INTAStore);
                    alert("STUDY COMPLETE");
                    resetStudy();
                    showScreen('screen-2');
                }
            }
        }, 1000);
    }

    $(".start-stimuli-interface-A").click(function (event) {
        var screenID = mode == 'INTA' ? 'screen-5' : 'screen-4';
        $("." + screenID + " .start-stimuli-interface-A").addClass('hidden');
        $("." + screenID + " div.main-options").removeClass("hidden");
        showStimuli(screenID);
    });


    $("#pid-form").click(function () {
        participantID = $("#participantid").val();
        if (participantID) {
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
            $("." + screenID + " div.main-options").addClass("hidden");
        }

        if (screenID == 'screen-5') {
            mode = 'INTA';
            reinitialize(screenID);
            // show start stimuli button and hide any existing stimuli
            $("." + screenID + " .start-stimuli-interface-A").removeClass("hidden");
            $("." + screenID + " .interface-A-stimuli").addClass("hidden");
            $("." + screenID + " div.main-options").addClass("hidden");
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
            if (event.target && event.target.id && (event.target.id == 'method' || event.target.id == 'thickness') ) {
                $("." + screenIndex + " .sub-options").addClass("hidden");
                $("." + screenIndex + " #sub-options-" + event.target.id).removeClass('hidden');
            }
        });

        subOptionsTouch = Hammer($("." + screenIndex + ' .interface-A-touch .sub-options-container')[0]).on("tap", function (event) {
            if (event.target && event.target.id && (event.target.id.indexOf("interfaceA-") >= 0)) {
                $("." + screenIndex + " .sub-options").addClass("hidden");
                var selectedValue = event.target.id.split("interfaceA-")[1];
                if (mode == 'demo') {
                    $("." + screenIndex + ' #interfaceA-selected-option').text("SELECTED OPTION - " + selectedValue);
                }
                if (mode == 'training') {
                    if (optionStore == selectedValue) {
                        $("." + screenIndex + ' .interface-A-stimuli').removeClass('red-border').addClass('green-border');
                        stopTimer();
                        showStimuli(screenIndex);
                    } else {
                        $("." + screenIndex + ' .interface-A-stimuli').addClass('red-border').removeClass('green-border');
                    }
                }

                if (mode == 'INTA') {
                    if (optionStore == selectedValue) {
                        $("." + screenIndex + ' .interface-A-stimuli').removeClass('red-border').addClass('green-border');
                        INTAStore.push(participantID + "," + "INTA" + "," + INTAIndex.join(",") + "," +countDown);
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