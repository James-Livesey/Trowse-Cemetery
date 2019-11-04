function saveName() {}

$(function() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            saveName = function() {
                $(".nameButton").addClass("loading");

                firebase.database().ref("users/" + user.uid + "/name").set($(".name").val()).then(function() {
                    $(".nameButton").removeClass("loading");
                });
            }

            firebase.database().ref("users/" + user.uid + "/name").on("value", function(snapshot) {
                $(".name").val(snapshot.val());
            });
        }
    });

    $(".name").keypress(function(event) {
        if (event.keyCode == 13) {
            saveName();
        }
    });
});