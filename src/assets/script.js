$(function () {

    var participantID = '';

    $(".goto-button").click(function () {
        var screenID = event.target.id.split("goto-")[1];
        showScreen(screenID);
    });


    $("#pid-form").click(function () {
        participantID = $("#participantid").val();
        console.log("Participant ID -"+participantID);
        showScreen('screen-3');
    });


    function showScreen(screenID) {
        $("body>.screen").addClass('hidden');
        $("body>." + screenID).removeClass('hidden');
    }
});