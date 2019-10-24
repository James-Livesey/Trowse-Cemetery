var mapData = null;
var mapLoaded = false;
var userID = null;
var userFullName = null;
var dataUnsaved = false;

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

function reservedButton(subject, state) {
    var plot = $(subject).parent().parent().find("td").eq(0).text();
    var firstField = $(subject).parent().parent().find("td").eq(1).find("input").val();

    if (state) {
        firebase.database().ref("data/" + plot + "/usage").set("reserved").then(displayToast);
    } else {
        if (firstField == "") {
            firebase.database().ref("data/" + plot + "/usage").set(null).then(displayToast);
        } else {
            firebase.database().ref("data/" + plot + "/usage").set("occupied").then(displayToast);
        }
    }
}

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        firebase.database().ref("users/" + user.uid + "/name").on(function(snapshot) {
            userID = user.uid;
            userFullName = snapshot.val();

            $("#accountArea").html("").append(
                $("<a class='ui right labeled icon button'>").append([
                    $("<span>").text(userFullName),
                    $("<i class='down arrow icon'>")
                ])
            );
        });
    } else {
        userID = null;
        userFullName = null;
    }
});

$(function() {
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
                            $("<button class='ui icon button'>").append(
                                $("<i aria-label='Remove Occupant' class='delete icon'>")
                            ),
                            $("<button class='ui negative icon button'>").append(
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
                    occupantDeathDate: $(this).find("> td").eq(2).find(".calendarPart").calendar("get date") == null ? null : $(this).find("td > .calendarPart").eq(0).calendar("get date").getTime(),
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

    $("[data-content], [data-html]").popup();
});