function saveName() {}

function showChangeEmailModal() {
    $("#changeEmailModal").modal("show");

    $("[data-content], [data-html]").popup();    
}

function hideChangeEmailModal() {
    setTimeout(function() {
        $("#changeEmailModal input").val("");
        
        $("#changeEmailModal .ui.positive.button").removeClass("loading");
    }, 500);

    $("#changeEmailModal").modal("hide");
}

function changeEmail() {
    if ($("#changeEmailModal .ui.form").form("validate form")) {
        $("#changeEmailModal .ui.positive.button").addClass("loading");

        firebase.auth().signInWithEmailAndPassword($("#changeEmailModal [name='changeEmailCurrentEmail']").val(), $("#changeEmailModal [name='changeEmailCurrentPassword']").val())
            .then(function(credentials) {
                credentials.user.updateEmail($("#changeEmailModal [name='changeEmailNewEmail']").val()).then(function() {
                    hideChangeEmailModal();
                }).catch(function(error) {
                    $("#changeEmailModal .ui.positive.button").removeClass("loading");
            
                    $("#changeEmailModal .ui.error.message").html("").append(
                        $("<ul class='list'>").append(
                            $("<li>").text(error.message)
                        )
                    ).show();
                });
            }).catch(function(error) {
                $("#changeEmailModal .ui.positive.button").removeClass("loading");
            
                $("#changeEmailModal .ui.error.message").html("").append(
                    $("<ul class='list'>").append(
                        $("<li>").text(error.message)
                    )
                ).show();
            })
        ;
    }
}

function showChangePasswordModal() {
    $("#changePasswordModal").modal("show");

    $("[data-content], [data-html]").popup();
}

function hideChangePasswordModal() {
    setTimeout(function() {
        $("#changePasswordModal input").val("");
        
        $("#changePasswordModal .ui.positive.button").removeClass("loading");
    }, 500);

    $("#changePasswordModal").modal("hide");
}

function changePassword() {
    if ($("#changePasswordModal .ui.form").form("validate form")) {
        $("#changePasswordModal .ui.positive.button").addClass("loading");

        firebase.auth().signInWithEmailAndPassword($("#changePasswordModal [name='changePasswordCurrentEmail']").val(), $("#changePasswordModal [name='changePasswordCurrentPassword']").val())
            .then(function(credentials) {
                credentials.user.updatePassword($("#changePasswordModal [name='changePasswordNewPassword']").val()).then(function() {
                    hideChangePasswordModal();
                }).catch(function(error) {
                    $("#changePasswordModal .ui.positive.button").removeClass("loading");
            
                    $("#changePasswordModal .ui.error.message").html("").append(
                        $("<ul class='list'>").append(
                            $("<li>").text(error.message)
                        )
                    ).show();
                });
            }).catch(function(error) {
                $("#changePasswordModal .ui.positive.button").removeClass("loading");
            
                $("#changePasswordModal .ui.error.message").html("").append(
                    $("<ul class='list'>").append(
                        $("<li>").text(error.message)
                    )
                ).show();
            })
        ;
    }
}

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

    $("[data-content], [data-html]").popup();

    $(".name").keypress(function(event) {
        if (event.keyCode == 13) {
            saveName();
        }
    });

    $("#changeEmailModal").modal({
        onApprove: function() {
            changeEmail();

            return false;
        }
    });

    $("#changeEmailModal .ui.form").form({
        keyboardShortcuts: false,

        fields: {
            currentEmail: {
                identifier: "changeEmailCurrentEmail",

                rules: [
                    {
                        type: "empty",
                        prompt: "Please enter your current email address."
                    },
                    {
                        type: "email",
                        prompt: "Please enter a valid email address for your current email address."
                    }
                ]
            },

            currentPassword: {
                identifier: "changeEmailCurrentPassword",

                rules: [
                    {
                        type: "empty",
                        prompt: "Please enter your current password."
                    },
                    {
                        type: "length[6]",
                        prompt: "Your current password must be at least 6 characters long."
                    }
                ]
            },

            newEmail: {
                identifier: "changeEmailNewEmail",

                rules: [
                    {
                        type: "empty",
                        prompt: "Please enter your new email address."
                    },
                    {
                        type: "email",
                        prompt: "Please enter a valid email address for your new email address."
                    }
                ]
            }
        }
    });

    $("#changePasswordModal").modal({
        onApprove: function() {
            changePassword();

            return false;
        }
    });

    $("#changePasswordModal .ui.form").form({
        keyboardShortcuts: false,

        fields: {
            currentEmail: {
                identifier: "changePasswordCurrentEmail",

                rules: [
                    {
                        type: "empty",
                        prompt: "Please enter your current email address."
                    },
                    {
                        type: "email",
                        prompt: "Please enter a valid email address for your current email address."
                    }
                ]
            },

            currentPassword: {
                identifier: "changePasswordCurrentPassword",

                rules: [
                    {
                        type: "empty",
                        prompt: "Please enter your current password."
                    },
                    {
                        type: "length[6]",
                        prompt: "Your current password must be at least 6 characters long."
                    }
                ]
            },

            newEmail: {
                identifier: "changePasswordNewPassword",

                rules: [
                    {
                        type: "empty",
                        prompt: "Please enter your new password."
                    },
                    {
                        type: "length[6]",
                        prompt: "Your new password must be at least 6 characters long."
                    }
                ]
            }
        }
    });
});