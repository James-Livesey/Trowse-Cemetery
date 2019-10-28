function signIn() {
    $(".ui.form").form("validate form");

    if ($(".ui.form").form("is valid")) {
        firebase.auth().signInWithEmailAndPassword($("[name='email']").val(), $("[name='password']").val()).catch(function(error) {
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
                        type: "length[3]",
                        prompt: "Your password must be at least 3 characters long."
                    }
                ]
            }
        }
    });
});