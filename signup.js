var signingUp = false;

function signUp() {
    $(".ui.form").form("validate form");

    if ($(".ui.form").form("is valid")) {
        $("#signUpButton").addClass("loading");

        firebase.auth().createUserWithEmailAndPassword($("[name='email']").val(), $("[name='password']").val()).then(function() {
            signingUp = true;
        }).catch(function(error) {
            $("#signUpButton").removeClass("loading");
            
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
        if (!signingUp) {
            if (user) {
                window.location.href = "index.html";
            }
        } else {
            firebase.database().ref("users/" + user.uid + "/name").set($("[name='name']").val()).then(function() {
                window.location.href = "index.html";
            });
        }
    });

    $(".ui.form").form({
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
});