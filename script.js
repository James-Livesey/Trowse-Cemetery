var mapData = null;
var mapLoaded = false;

var userID = null;
var userFullName = null;

var dataUnsaved = false;
var dataEditable = false;

var modalPlotTarget = null;

function getURLParameter(name) {
    return decodeURIComponent((new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(location.search) || [null, ""])[1].replace(/\+/g, "%20")) || null;
}

function displayToast() {
    $(".toast").show();

    setTimeout(function() {
        $(".toast").fadeOut();
    }, 3000);
}

function hideToast() {
    $(".toast").fadeOut();
}

function showAddPlotModal() {
    $("#addPlotModal").modal("show");

    $("[data-content], [data-html]").popup();
}

function hideAddPlotModal() {
    setTimeout(function() {
        $("#addPlotModal input").val("");
        
        $("#addPlotModal .ui.approve.button").removeClass("loading");
    }, 500);

    $("#addPlotModal").modal("hide");
}

function addPlot() {
    if ($("#addPlotModal .ui.form").form("validate form")) {
        $("#addPlotModal .ui.approve.button").addClass("loading");

        firebase.database().ref("data/" + $("#addPlotModal [name='plotID']").val() + "/points")
            .set($("#addPlotModal [name='plotPoints']").val())
            .then(function() {
                hideAddPlotModal();

                displayToast();
            })
        ;
    }
}

function showRemoveOccupantModal(subject) {
    modalPlotTarget = $(subject).parent().parent().find("td").eq(0).text();

    $("#removeOccupantModal").modal("show");

    $("[data-content], [data-html]").popup();
}

function hideRemoveOccupantModal() {
    modalPlotTarget = null;

    $("#removeOccupantModal").modal("hide");
}

function removeOccupant() {
    var occupantKeys = ["occupantName", "occupantDeathDate", "occupantNotes", "usage"];

    for (var i = 0; i < occupantKeys.length; i++) {
        if (i == occupantKeys.length - 1) {
            firebase.database().ref("data/" + modalPlotTarget + "/" + occupantKeys[i]).set(null).then(function() {
                hideRemoveOccupantModal();

                displayToast();
            });
        } else {
            firebase.database().ref("data/" + modalPlotTarget + "/" + occupantKeys[i]).set(null);
        }
    }
}

function showDeletePlotModal(subject) {
    modalPlotTarget = $(subject).parent().parent().find("td").eq(0).text();

    $("#deletePlotModal").modal("show");

    $("[data-content], [data-html]").popup();
}

function hideDeletePlotModal() {
    modalPlotTarget = null;

    $("#deletePlotModal").modal("hide");
}

function deletePlot() {
    firebase.database().ref("data/" + modalPlotTarget).set(null).then(function() {
        hideDeletePlotModal();

        displayToast();
    });
}

function reservedButton(subject, state) {
    if (state) {
        $(subject).addClass("blue");
    } else {
        $(subject).removeClass("blue");
    }

    dataUnsaved = true;
}

$(function() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            firebase.database().ref("users/" + user.uid + "/name").on("value", function(snapshot) {
                userID = user.uid;
                userFullName = snapshot.val();
    
                $("#accountArea").html("").append(
                    $("<a class='ui pointing dropdown'>").append([
                        $("<div class='text'>").text(userFullName),
                        $("<i class='dropdown icon'>"),
                        $("<div class='menu'>").append([
                            $("<a class='item'>").attr("href", "settings.html").append([
                                $("<i class='settings icon'>"),
                                $("<span>").text("Settings")
                            ]),
                            $("<a href='javascript:firebase.auth().signOut();' class='item'>").append([
                                $("<i class='user icon'>"),
                                $("<span>").text("Sign out")
                            ])
                        ])
                    ])
                );
    
                $(".ui.dropdown").dropdown();
            });
    
            firebase.database().ref("whitelistedUsers").on("value", function(snapshot) {
                if (snapshot.val() != null) {
                    dataEditable = user.uid in snapshot.val();
                } else {
                    dataEditable = false;
                }
            });

            $(".signedIn").show();
            $(".notSignedIn").hide();
        } else {
            userID = null;
            userFullName = null;
    
            $("#accountArea").html("").append(
                $("<a href='signin.html' class='ui primary button'>").text("Sign in")
            );
    
            dataEditable = false;

            $(".signedIn").hide();
            $(".notSignedIn").show();
        }
    });

    firebase.database().ref("data").on("value", function(snapshot) {
        mapData = snapshot.val();
        mapLoaded = true;

        if ($("#map").length > 0) {
            $("#map *").remove();

            for (var plot in mapData) {
                var svgPolygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
                var svgText = document.createElementNS("http://www.w3.org/2000/svg", "text");
                var svgLink = document.createElementNS("http://www.w3.org/2000/svg", "a");

                svgPolygon.setAttribute("fill", mapData[plot]["usage"] == "occupied" ? "#ffdc96" : (mapData[plot]["usage"] == "reserved" ? "#96c5ff" : "#f0f0f0"));
                svgPolygon.setAttribute("stroke", mapData[plot]["usage"] == "occupied" ? "#ffc247" : (mapData[plot]["usage"] == "reserved" ? "#59a3ff" : "#d1d1d1"));
                svgText.setAttribute("fill", "black");
                svgText.setAttribute("font-size", "30px");
                svgText.textContent = plot;
                svgLink.setAttribute("href", "data.html?selectedPlot=" + encodeURIComponent(plot));
                svgLink.appendChild(svgPolygon);
                svgLink.appendChild(svgText);

                if (mapData[plot]["occupantName"] != null) {
                    svgPolygon.setAttribute("data-content", mapData[plot]["occupantName"]);
                    $(svgPolygon).popup({supports: "svg"});
                }

                if (getURLParameter("selectedPlot") == plot) {
                    svgPolygon.classList.add("selected");
                }

                $("#map").append(svgLink);

                var points = mapData[plot]["points"].split(" ");

                svgText.setAttribute("x", Number(points[0].split(",")[0]) + 10);
                svgText.setAttribute("y", Number(points[0].split(",")[1]) + 30);

                for (var point of points) {
                    var svgPoint = $("#map")[0].createSVGPoint();

                    svgPoint.x = point.split(",")[0];
                    svgPoint.y = point.split(",")[1];

                    svgPolygon.points.appendItem(svgPoint);
                }
            }
        } else if ($("#database").length > 0) {
            $("#database tbody").html("");
            
            for (var plot in mapData) {
                var tableRow = "<tr>";
                var reservedButton = "<button class='ui icon button'>";
                var reservedButtonFunction = "reservedButton(this, true);";

                if (plot == getURLParameter("selectedPlot")) {
                    tableRow = "<tr class='active'>";
                }

                if (getURLParameter("search") != null && (
                    plot.toLowerCase().includes(getURLParameter("search").toLowerCase()) ||
                    (mapData[plot]["occupantName"] || "").toLowerCase().includes(getURLParameter("search").toLowerCase()) ||
                    (new Date(mapData[plot]["occupantDeathDate"]).toLocaleDateString("en-GB", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    }) || "").toLowerCase().includes(getURLParameter("search").toLowerCase()) ||
                    (mapData[plot]["occupantNotes"] || "").toLowerCase().includes(getURLParameter("search").toLowerCase()) ||
                    (mapData[plot]["points"] || "").toLowerCase().includes(getURLParameter("search").toLowerCase()) ||
                    (getURLParameter("search").toLowerCase().includes("reserved") && mapData[plot]["usage"] == "reserved") ||
                    (getURLParameter("search").toLowerCase().includes("occupied") && (
                        !getURLParameter("search").toLowerCase().includes("unoccupied")||
                        getURLParameter("search").toLowerCase().includes(" occupied") ||
                        getURLParameter("search").toLowerCase().includes("occupied ")
                    ) && mapData[plot]["usage"] == "occupied") ||
                    (getURLParameter("search").toLowerCase().includes("unoccupied") && mapData[plot]["usage"] == null)
                )) {
                    tableRow = "<tr class='active'>";
                }

                if (mapData[plot]["usage"] == "reserved") {
                    reservedButton = "<button class='ui icon blue button'>";
                    reservedButtonFunction = "reservedButton(this, false);";
                }

                $("#database tbody").append(
                    $(tableRow).append([
                        $("<td>").append(
                            $("<a>")
                                .text(plot)
                                .attr("href", "index.html?selectedPlot=" + encodeURIComponent(plot))
                        ),
                        $("<td>").append(
                            $("<div class='ui input'>").append(
                                $("<input placeholder='(Unoccupied)' onchange='dataUnsaved = true;'>").val(mapData[plot]["occupantName"])
                            )
                        ),
                        $("<td>").append(
                            $("<div class='ui input calendar basic calendarPart'>").append(
                                $("<input onchange='dataUnsaved = true;'>").val(mapData[plot]["occupantDeathDate"])
                            )
                        ),
                        $("<td>").append(
                            $("<div class='ui input'>").append(
                                $("<input onchange='dataUnsaved = true;'>").val(mapData[plot]["occupantNotes"] || "")
                            )
                        ),
                        $("<td>").append(
                            $("<div class='ui input'>").append(
                                $("<input onchange='dataUnsaved = true;'>").val(mapData[plot]["points"])
                            )
                        ),
                        $("<td>").append([
                            $(reservedButton).attr("onclick", reservedButtonFunction).append(
                                $("<i aria-label='Toggle Reservation' class='tag icon'>")
                            ),
                            $("<button class='ui icon button'>").attr("onclick", "showRemoveOccupantModal(this);").append(
                                $("<i aria-label='Remove Occupant' class='delete icon'>")
                            ),
                            $("<button class='ui negative icon button'>").attr("onclick", "showDeletePlotModal(this);").append(
                                $("<i aria-label='Delete Plot' class='trash icon'>")
                            )
                        ])
                    ])
                );

                $(".calendarPart").last().calendar({
                    type: "date",
                    startMode: "year",
                    onChange: function() {
                        dataUnsaved = true;
                    }
                });

                if (mapData[plot]["occupantDeathDate"] != null) {
                    $(".calendarPart").last().calendar("set date", new Date(mapData[plot]["occupantDeathDate"]));
                }

                $("tr.active").animate({left: 0, duration: "slow", complete: function() {
                    $("tr.active").find("> td").eq(1).find("input").focus();                    
                }});

                dataUnsaved = false;
            }
        }

        $("#loadingScreen").fadeOut();
    });

    setInterval(function() {
        $(".popuppable").popup({
            hoverable: true
        });
    });

    setInterval(function() {
        if (dataUnsaved && !$(document.activeElement).is("input")) {
            $("#database > tbody > tr").each(function() {
                var key = $(this).find("> td").eq(0).text();
                var dataStructure = {
                    occupantName: $(this).find("> td").eq(1).find("input").val(),
                    occupantDeathDate: $(this).find("td > .calendarPart").eq(0).calendar("get date") == null ? null : $(this).find("td > .calendarPart").eq(0).calendar("get date").getTime(),
                    occupantNotes: $(this).find("> td").eq(3).find("input").val(),
                    points: $(this).find("> td").eq(4).find("input").val(),
                    usage: (
                        (
                            $(this).find("> td").eq(1).find("input").val() != "" && $(this).find("> td").eq(1).find("input").val() != null
                        ) ? (
                            $(this).find("> td").eq(5).find("button").eq(0).is(".blue") ? "reserved" : "occupied"
                        ) : (
                            $(this).find("> td").eq(5).find("button").eq(0).is(".blue") ? "reserved" : null
                        )
                    )
                };

                if (mapData[key] != dataStructure) {
                    firebase.database().ref("data/" + key).set(dataStructure).then(displayToast);
                }
            });

            dataUnsaved = false;
        }
    }, 2000);

    setInterval(function() {
        if (dataEditable) {
            $("table input, table button").removeAttr("disabled");

            $(".dataEditable").show();
            $(".dataUneditable").hide();
        } else {
            $("table input, table button").attr("disabled", "");

            $(".dataEditable").hide();
            $(".dataUneditable").show();
        }
    });

    $("#search").keypress(function(event) {
        if (event.keyCode == 13) { // Enter key
            window.location.href = "data.html?search=" + encodeURIComponent($("#search").val());            
        }
    });

    $("[data-content], [data-html]").popup();

    $("#addPlotModal").modal({
        onApprove: function() {
            addPlot();

            return false;
        }
    });

    $("#addPlotModal .ui.form").form({
        fields: {
            plotID: {
                identifier: "plotID",

                rules: [
                    {
                        type: "empty",
                        prompt: "Please enter the plot ID."
                    }
                ]
            },

            plotPoints: {
                identifier: "plotPoints",

                rules: [
                    {
                        type: "empty",
                        prompt: "Please enter the plot points."
                    }
                ]
            }
        }
    });

    $("#removeOccupantModal").modal({
        onApprove: function() {
            removeOccupant();

            return false;
        }
    });

    $("#deletePlotModal").modal({
        onApprove: function() {
            deletePlot();

            return false;
        }
    });
});