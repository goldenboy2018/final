var Client = {};
Client.BaseURL = "http://localhost:52950/";

//Variables
var userInfoLoaded = false;

var user = {
    username: "",
    password: "",
    email: "",
    gpa: "4.0"
};

Client.Elements = {};
Client.ClearMessages = function() {
    $("#ExistingUsernameError").removeAttr("style");
    $("#ExistingPasswordError").removeAttr("style");
    $("#CAUsernameError").removeAttr("style");
    $("#CAPasswordError").removeAttr("style");
    $("#CAEmailError").removeAttr("style");
    $("#CAEmail2Error").removeAttr("style");
    $("#CASuccess").removeAttr("style");
    $("#ErrorMessageArea").removeAttr("style");
};
Client.ClearValues = function() {
    $("#CAUsername").val("");
    $("#CAPassword").val("");
    $("#CAEmail").val("");
    $("#CAEmail2").val("");
};
Client.AnimateLogin = function() {
    $("#LoginMainDiv").animate({
        opacity: 0.5,
        left: "-=550",
        height: "toggle"
    }, 500, function() {
        // Animation complete.
        $("#AIMainDiv").show("slow", function() {
            $("#AIMainDiv").animate({
                left: "-=520"
                // Animation complete.
            }, 500);
            // Animation complete.
        });
    });
};
Client.CallLogin = function() {
    Client.ClearMessages();

    var usernameInput = $("#ExistingUsername").val();
    var passwordInput = $("#ExistingPassword").val();

    $.ajax
    ({
        url: Client.BaseURL + "/Home/Login",
        data:
        {
            Username: usernameInput,
            Password: passwordInput
        },
        success: function(result) {
            var resultString = JSON.parse(result);

            if (resultString.Message === "Success") {
                userInfoLoaded = true;
                Client.CallGetAccountInformation(usernameInput);

                Client.AnimateLogin();
            } else {
                if (resultString.Username === "Invalid") {
                    $("#ExistingUsernameError").css("visibility", "visible");
                } else {
                    $("#ExistingPasswordError").css("visibility", "visible");
                }
            }
        }
    });
};
Client.CallCreateAccount = function() {
    Client.ClearMessages();

    var usernameInput = $("#CAUsername").val();
    var passwordInput = $("#CAPassword").val();
    var emailInput = $("#CAEmail").val();
    var emailInput2 = $("#CAEmail2").val();

    $.ajax
    ({
        url: Client.BaseURL + "/Home/CreateAccount",
        data:
        {
            Username: usernameInput,
            Password: passwordInput,
            EmailAdd: emailInput,
            EmailCon: emailInput2
        },
        success: function(result) {
            var resultString = JSON.parse(result);

            if (resultString.Message === "Success") {
                Client.ClearValues();

                $("#CASuccess").css("visibility", "visible");
            } else {
                if (resultString.Username === "Invalid") {
                    $("#CAUsernameError").text("Username must have at least 6 characters.");
                    $("#CAUsernameError").css("visibility", "visible");
                } else if (resultString.Username === "Exists") {
                    $("#CAUsernameError").text("Username is already taken.");
                    $("#CAUsernameError").css("visibility", "visible");
                } else if (resultString.Password === "Invalid") {
                    $("#CAPasswordError").css("visibility", "visible");
                } else if (resultString.EmailAdd === "Invalid") {
                    $("#CAEmailError").css("visibility", "visible");
                } else {
                    $("#CAEmail2Error").css("visibility", "visible");
                }
            }
        }
    });
};
Client.WriteElements = function() {
    var elementHtml = "";

    $.each(Object.keys(Client.Elements), function(index, element) {
        //Create HTML for each element and append to placeholder
        elementHtml += "<div>";
        elementHtml += "    <div id='" + element + "Label' elementName='" + element + "' class='InlineBlock LineHeight SmallPadding BiggerText ExtraWidth'>" + element + "</div>";
        elementHtml += "    <div id='" + element + "InputArea' elementName='" + element + "' class='InlineBlock LineHeight SmallPadding MobileNoHeight'>";
        elementHtml += "        <input type='text' id='" + element + "TextBox' elementName='" + element + "' class='TextBox MobileFloatNone MobileTextBoxStretch'>";
        elementHtml += "        <button type='button' id='" + element + "Button' elementName='" + element + "' class='SubmitButton MobileButtonAI' purpose='update'>Update</button>";
        elementHtml += "    </div>";
        elementHtml += "</div>";
    });

    $('#PlaceHolderDiv').html(elementHtml);

    $.each(Object.keys(Client.Elements), function(index, elementKey) {
        $('#' + elementKey + 'TextBox').val(Client.Elements[elementKey]);
    });

    $(".MobileButtonAI").click(function(sender, args) {
        Client.CallAddOrUpdateElement(user.username, $('#' + sender.toElement.id));
    });
};
Client.CallGetAccountInformation = function(usernameInput) {
    $.ajax
    ({
        url: Client.BaseURL + "/Home/GetAccountInformation",
        data:
        {
            Username: usernameInput
        },
        success: function(result) {
            var resultString = JSON.parse(result);

            if (resultString.Message === "Success") {
                var payload = JSON.parse(resultString.Payload);

                user.username = payload.account.username;
                user.password = payload.account.password;

                $("#AccountNameLabel").text(user.username);

                $.each(Object.keys(payload.account), function(index, elementKey) {
                    if (elementKey !== "username" && elementKey !== "password") {
                        Client.Elements[elementKey] = payload.account[elementKey];
                    }
                });
                Client.WriteElements();
            } else {
                alert("Error retrieving account info.");
            }
        }
    });
};
Client.CallAddOrUpdateElement = function(username, sender) {
    Client.ClearMessages();

    var updatedElementName;
    var updatedElementValue;

    if (sender.attr("purpose") === "add") {
        //read element name from name box
        updatedElementName = $("#ElementNameTextBox").val().toLowerCase();
        //read element value from value box
        updatedElementValue = $("#ElementValueTextBox").val().toLowerCase();

    } else {
        //read element name from update button attr (sender)
        updatedElementName = sender.attr("elementName");
        //retrieve element value by reading the value of the associated textbox
        updatedElementValue = $("#" + updatedElementName + "TextBox").val().toLowerCase();
    }

    if (updatedElementName !== "" && updatedElementValue !== "") {
        $.ajax
        ({
            url: Client.BaseURL + "/Home/AddOrUpdateElement",
            data:
            {
                Username: username,
                ElementName: updatedElementName,
                ElementValue: updatedElementValue
            },
            success: function(result) {
                var resultString = JSON.parse(result);

                if (resultString.Message === "Success") {

                    Client.Elements[updatedElementName] = updatedElementValue;
                    Client.WriteElements();
                } else {
                    $("#ErrorMessageArea").text(resultString.Error);
                    $("#ErrorMessageArea").css("visibility", "visible");
                }
            }
        });
    } else {
        $("#ErrorMessageArea").text("Values must be filled out in order to add or update.");
        $("#ErrorMessageArea").css("visibility", "visible");
    }
};
$(document).ready(function() {
    $("#LoginButtonDiv").click(Client.CallLogin);
    $("#CAButtonDiv").click(Client.CallCreateAccount);

    $(".MobileButtonAI").click(function(sender, args) {
        Client.CallAddOrUpdateElement(user.username, $('#' + sender.toElement.id));
    });
});