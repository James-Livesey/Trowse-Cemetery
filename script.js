var mapData = null;
var mapLoaded = false;
var userID = null;
var userFullName = null;

function getURLParameter(name) {
    return decodeURIComponent((new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(location.search) || [null, ""])[1].replace(/\+/g, "%20")) || null;
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

                svgPolygon.setAttribute("fill", mapData[plot]["usage"] == "occupied" ? "#ffdc96" : (mapData[plot]["usage"] == "reserved" ? "#59a3ff" : "#f0f0f0"));
                svgPolygon.setAttribute("stroke", mapData[plot]["usage"] == "occupied" ? "#ffc247" : (mapData[plot]["usage"] == "reserved" ? "#96c5ff" : "#d1d1d1"));
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

                if (plot == getURLParameter("selectedPlot")) {
                    tableRow = "<tr class='active'>";
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
                                $("<input placeholder='(Unoccupied)'>").val(mapData[plot]["occupantName"])
                            )
                        ),
                        $("<td>").append(
                            $("<div class='ui input calendar'>").append(
                                $("<input>").val(mapData[plot]["occupantDeathDate"])
                            )
                        ),
                        $("<td>").append(
                            $("<div class='ui input'>").append(
                                $("<input>").val(mapData[plot]["occupantNotes"] || "")
                            )
                        ),
                        $("<td>").append(
                            $("<div class='ui input'>").append(
                                $("<input>").val(mapData[plot]["points"])
                            )
                        ),
                        $("<td>").append([
                            $("<a class='ui icon button'>").append(
                                $("<i class='tag icon'>")
                            ),
                            $("<a class='ui icon button'>").append(
                                $("<i class='delete icon'>")
                            ),
                            $("<a class='ui negative icon button'>").append(
                                $("<i class='trash icon'>")
                            )
                        ])
                    ])
                );
            }
        }

        $("#loadingScreen").fadeOut();
    });

    setInterval(function() {
        $(".popuppable").popup({
            hoverable: true
        });
    });
});