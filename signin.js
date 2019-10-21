$(function() {
    $(".ui.form").form({
        fields: {
            email: {
                identifier: "email",

                rules: [
                    {
                        type: "empty",
                        prompt: "Please enter your email address to sign in."
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
                        prompt: "Please enter your password to sign in."
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