var mapData = null;
var mapLoaded = false;

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

                svgPolygon.setAttribute("fill", mapData[plot]["usage"] == "occupied" ? "green" : (mapData[plot]["usage"] == "reserved" ? "blue" : "grey"));
                svgText.setAttribute("fill", "white");
                svgText.setAttribute("font-size", "30px");
                svgText.textContent = plot;
                svgLink.setAttribute("href", "#");
                svgLink.appendChild(svgPolygon);
                svgLink.appendChild(svgText);

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
        }

        $("#loadingScreen").fadeOut();
    });
});