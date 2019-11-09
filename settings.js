var dataEditable = false;

function saveName() {}

function showChangeEmailModal() {
    $("#changeEmailModal").modal("show");

    $("[data-content], [data-html]").popup();    
}

function hideChangeEmailModal() {
    setTimeout(function() {
        $("#changeEmailModal input").val("");
        
        $("#changeEmailModal .ui.approve.button").removeClass("loading");
    }, 500);

    $("#changeEmailModal").modal("hide");
}

function changeEmail() {
    if ($("#changeEmailModal .ui.form").form("validate form")) {
        $("#changeEmailModal .ui.approve.button").addClass("loading");

        firebase.auth().signInWithEmailAndPassword($("#changeEmailModal [name='changeEmailCurrentEmail']").val(), $("#changeEmailModal [name='changeEmailCurrentPassword']").val())
            .then(function(credentials) {
                credentials.user.updateEmail($("#changeEmailModal [name='changeEmailNewEmail']").val()).then(function() {
                    firebase.database().ref("users/" + credentials.user.uid + "/email").set($("#changeEmailModal [name='changeEmailNewEmail']").val()).then(function() {
                        hideChangeEmailModal();
                    }).catch(function(error) {
                        $("#changeEmailModal .ui.approve.button").removeClass("loading");
                
                        $("#changeEmailModal .ui.error.message").html("").append(
                            $("<ul class='list'>").append(
                                $("<li>").text(error.message)
                            )
                        ).show();
                    });
                }).catch(function(error) {
                    $("#changeEmailModal .ui.approve.button").removeClass("loading");
            
                    $("#changeEmailModal .ui.error.message").html("").append(
                        $("<ul class='list'>").append(
                            $("<li>").text(error.message)
                        )
                    ).show();
                });
            }).catch(function(error) {
                $("#changeEmailModal .ui.approve.button").removeClass("loading");
            
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
        
        $("#changePasswordModal .ui.approve.button").removeClass("loading");
    }, 500);

    $("#changePasswordModal").modal("hide");
}

function changePassword() {
    if ($("#changePasswordModal .ui.form").form("validate form")) {
        $("#changePasswordModal .ui.approve.button").addClass("loading");

        firebase.auth().signInWithEmailAndPassword($("#changePasswordModal [name='changePasswordCurrentEmail']").val(), $("#changePasswordModal [name='changePasswordCurrentPassword']").val())
            .then(function(credentials) {
                credentials.user.updatePassword($("#changePasswordModal [name='changePasswordNewPassword']").val()).then(function() {
                    hideChangePasswordModal();
                }).catch(function(error) {
                    $("#changePasswordModal .ui.approve.button").removeClass("loading");
            
                    $("#changePasswordModal .ui.error.message").html("").append(
                        $("<ul class='list'>").append(
                            $("<li>").text(error.message)
                        )
                    ).show();
                });
            }).catch(function(error) {
                $("#changePasswordModal .ui.approve.button").removeClass("loading");
            
                $("#changePasswordModal .ui.error.message").html("").append(
                    $("<ul class='list'>").append(
                        $("<li>").text(error.message)
                    )
                ).show();
            })
        ;
    }
}

function showDeleteAccountModal() {
    $("#deleteAccountModal").modal("show");

    $("[data-content], [data-html]").popup();
}

function hideDeleteAccountModal() {
    setTimeout(function() {
        $("#deleteAccountModal input").val("");
        
        $("#deleteAccountModal .ui.negative.button").removeClass("loading");
    }, 500);

    $("#deleteAccountModal").modal("hide");
}

function deleteAccount() {
    if ($("#deleteAccountModal .ui.form").form("validate form")) {
        $("#deleteAccountModal .ui.negative.button").addClass("loading");

        firebase.auth().signInWithEmailAndPassword($("#deleteAccountModal [name='deleteAccountCurrentEmail']").val(), $("#deleteAccountModal [name='deleteAccountCurrentPassword']").val())
            .then(function(credentials) {
                firebase.database().ref("users/" + credentials.user.uid).set({}).then(function() {
                    credentials.user.delete().then(function() {
                        hideDeleteAccountModal();
    
                        window.location.href = "index.html";
                    }).catch(function(error) {
                        $("#deleteAccountModal .ui.negative.button").removeClass("loading");
                
                        $("#deleteAccountModal .ui.error.message").html("").append(
                            $("<ul class='list'>").append(
                                $("<li>").text(error.message)
                            )
                        ).show();
                    });
                }).catch(function(error) {
                    $("#deleteAccountModal .ui.negative.button").removeClass("loading");
            
                    $("#deleteAccountModal .ui.error.message").html("").append(
                        $("<ul class='list'>").append(
                            $("<li>").text(error.message)
                        )
                    ).show();
                });
            }).catch(function(error) {
                $("#deleteAccountModal .ui.negative.button").removeClass("loading");
            
                $("#deleteAccountModal .ui.error.message").html("").append(
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
                if ($(".name").val().trim() != "") {
                    $(".nameButton").addClass("loading");

                    firebase.database().ref("users/" + user.uid + "/name").set($(".name").val()).then(function() {
                        $(".nameButton").removeClass("loading");
                    });
                }
            }

            firebase.database().ref("users/" + user.uid + "/name").on("value", function(snapshot) {
                $(".name").val(snapshot.val());
            });
        }
    });

    firebase.database().ref("whitelistedUsers").on("value", function(snapshot) {
        var whitelistedUsers = snapshot.val();

        firebase.database().ref("users").on("value", function(childSnapshot) {
            var users = childSnapshot.val();
            
            setTimeout(function() {
                $("#permissions tbody").html("");

                for (var user in users) {
                    (function(user) {
                        $("#permissions tbody").append(
                            $("<tr>").append([
                                $("<td>").text(users[user].name || "(Unknown name)"),
                                $("<td>").text(users[user].email || "(Unknown email address)"),
                                $("<td>").append(
                                    $("<div class='ui toggle checkbox'>").change(function() {
                                        firebase.database().ref("whitelistedUsers/" + user).set($(this).checkbox("is checked"));
                                    }).append(
                                        $("<input type='checkbox'>").prop("checked", whitelistedUsers[user] == true)
                                    )
                                )
                            ])
                        );
    
                        $(".ui.toggle.checkbox").checkbox();
                    })(user);
                } 
            }, 500);
        });
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

            newPassword: {
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

    $("#deleteAccountModal").modal({
        onDeny: function() {
            deleteAccount();

            return false;
        }
    });

    $("#deleteAccountModal .ui.form").form({
        keyboardShortcuts: false,

        fields: {
            currentEmail: {
                identifier: "deleteAccountCurrentEmail",

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

            currentPassword: {
                identifier: "deleteAccountCurrentPassword",

                rules: [
                    {
                        type: "empty",
                        prompt: "Please enter your current password."
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