function signIn() {
    $(".ui.form").form("validate form");

    if ($(".ui.form").form("is valid")) {
        $("#signInButton").addClass("loading");

        firebase.auth().signInWithEmailAndPassword($("[name='email']").val(), $("[name='password']").val()).catch(function(error) {
            $("#signInButton").removeClass("loading");
            
            $(".ui.error.message").html("").append(
                $("<ul class='list'>").append(
                    $("<li>").text(error.message)
                )
            ).show();
        })
    }
}

$(function() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            window.location.href = "index.html";
        }
    });

    $(".ui.form").form({
        keyboardShortcuts: false,

        fields: {
            email: {
                identifier: "email",

                rules: [
                    {
                        type: "empty",
                        prompt: "Please enter your email address."
                    },
                    {
                        type: "email",
                        prompt: "Please enter a valid email address."
                    }
                ]
            },

            password: {
                identifier: "password",
                
                rules: [
                    {
                        type: "empty",
                        prompt: "Please enter your password."
                    },
                    {
                        type: "length[6]",
                        prompt: "Your password must be at least 6 characters long."
                    }
                ]
            }
        }
    });

    $("[name='password']").keypress(function(event) {
        if (event.keyCode == 13) { // Enter
            signIn();
        }
    });
});