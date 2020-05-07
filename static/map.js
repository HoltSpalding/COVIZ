//Makes GET requests from Flack server and returns response
$.extend({ getFlaskVars: function(url) {
                            var response = null;
                            $.ajax({
                            url: url,
                            type: 'GET',
                            dataType: 'json',
                            contentType: 'application/json; charset=utf-8',
                            async: false,
                            success: function(data) {
                               /* console.log(data)
                                console.log(JSON.stringify(data))*/
                                response = data;
                                console.log(data)
                                /*ready(response)*/
                            }});
                            return response;}});

//Makes POST request to Flack server and returns response
$.extend({ postFlaskVars: function(url,json_data) {
                            var response = null;
                            $.ajax({
                            url: url,
                            type: 'POST',
                            data: JSON.stringify(json_data),
                            dataType: 'json',
                            contentType: 'application/json; charset=utf-8',
                            async: false,
                            success: function(data) {
                                console.log(data)
                                response = data;
                            }});
                            return response;}});


//US Map dimensions
map_dims = document.getElementById('USMap').getBoundingClientRect()
map_width = map_dims.width.toString()
map_height = map_dims.height.toString()
//controls actively on-hover object
active = d3.select(null);

var map_svg = d3.select("div#USMap")
                .append("svg")
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("viewBox", "0 0 " + map_width + " " + map_height)
                .classed("svg-content", true);


map_svg.append('rect')
       .attr('class', 'background center-container')
       .attr('height', map_height)
       .attr('width', map_width)
       .on('click', clicked);
   
var projection = d3.geoAlbersUsa()
                   .scale(map_width*1.35)
                   .translate([map_width / 2, map_height / 2]);
        
var path = d3.geoPath()
             .projection(projection);



d3.queue()
  .defer(d3.json, "static/counties-10m.json")
  .await(ready);

var g = map_svg.append("g")
               .attr('class', 'center-container center-items us-state')
           

//Represents current translation, scale, and date on load
current_transform = null
current_scale = null
default_date = "4/28/20"


var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
                console.log(d.properties)
              return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>" + "<strong>Population: </strong><span class='details'>" + "</span>";
            })
map_svg.call(tip)


function ready(error, us) {
/*            response = $.postFlaskVars("/get_map_data",{"date": default_date});

            county_colorings = response["county"]
            state_colorings = response["state"]
*/
        
/*        console.log("asdfasdfasdf")
        console.log(us)*/
            if (error) throw error;

            g.append("g")
             .attr("id", "counties")
             .selectAll("path")
             .data(topojson.feature(us, us.objects.counties).features)
             .enter().append("path")
/*             .style("fill",function(d) {
                return county_colorings[d.id] })*/
             .attr("d", path)
             .attr("class", "county-boundary")
             .on("click", reset).on('mouseover', tip.show);

            g.append("g")
             .attr("id", "states")
             .selectAll("path")
             .data(topojson.feature(us, us.objects.states).features)
             .enter().append("path")
             .attr("d", path)
             .attr("class", "state")
/*             .style("fill",function(d) {
                console.log(d.properties.name)
                return state_colorings[d.id]
             })*/
             .on("click", clicked).on('mouseover', tip.show)



            g.append("path")
             .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
             .attr("id", "state-borders")
             .attr("d", path); }

function clicked(d) {
            if (d3.select('.background').node() === this) return reset();

            if (active.node() === this) return reset();

            active.classed("active", false);
            active = d3.select(this).classed("active", true);

            var bounds = path.bounds(d),
                dx = bounds[1][0] - bounds[0][0],
                dy = bounds[1][1] - bounds[0][1],
                x = (bounds[0][0] + bounds[1][0]) / 2,
                y = (bounds[0][1] + bounds[1][1]) / 2,
                scale = .9 / Math.max(dx / map_width, dy / map_height),
                translate = [map_width / 2 - scale * x, map_height / 2 - scale * y];
                current_scale = scale
                current_transform = translate

            g.transition()
                .duration(750)
                .style("stroke-width", 1.5 / scale + "px")
                .attr("transform", "translate(" + translate + ")scale(" + scale + ")");}


function reset() {
            active.classed("active", false);
            active = d3.select(null);
            g.transition()
             .delay(100)
             .duration(750)
             .style("stroke-width", "1.5px")
             .attr("transform", "translate(" - current_transform + ")scale(" - current_scale + ")");}




//slider
slider_dims = document.getElementById('slider1card').getBoundingClientRect()
slider_width = (slider_dims.width).toString()
slider_height = (slider_dims.height+100).toString()

var formatDateIntoMonth = d3.timeFormat("%b");
var formatDate = d3.timeFormat("%b %d %Y");
var parseDate = d3.timeParse("%m/%d/%y");

var startDate = new Date("2020-01-23"),
    endDate = new Date("2020-04-30");
/*var margin = {top:100, right:50, bottom:0, left:50},
    slider_width = slider_width - margin.left - margin.right,
    slider_height = slider_height - margin.top - margin.bottom;
*/
var svg = d3.select("#slider1")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
     .attr("viewBox", "0 0 " + slider_width + " " + slider_height)
/*     .classed("svg-content", true)
*/


/*                .attr("viewBox", "0 0 " + slider_width + " " + slider_height)
*//*                .classed("svg-content", true)*/
/*                .attr("height", slider_height + 1)
*//*.attr("preserveAspectRatio", "xMinYMin meet")
                .attr("viewBox", "0 0 " + slider_width + " " + slider_height)
                .classed("svg-content", true)*/
/*    .attr("width", slider_width)
    .attr("height", slider_height);  
*/

    var moving = false;
var currentValue = 0;
var targetValue = slider_width*0.9;

    
var x = d3.scaleTime()
    .domain([startDate, endDate])
    .range([0, targetValue])
    .clamp(true);

var slider = svg.append("g")
    .attr("class", "slider")

    .attr("transform", "translate(" + 50 + "," + slider_height/2 + ")");

slider.append("line")
    .attr("class", "track")
    .attr("x1", x.range()[0])
    .attr("x2", x.range()[1])
  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-inset")
  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-overlay")
    .call(d3.drag()
        .on("start.interrupt", function() { slider.interrupt(); })
        .on("start drag", function() {
          currentValue = d3.event.x;
          update(x.invert(currentValue)); 
        })
    );

slider.insert("g", ".track-overlay")
    .attr("class", "ticks")
    .attr("transform", "translate(0," + 18 + ")")
  .selectAll("text")
    .data(x.ticks(4))
    .enter()
    .append("text")
    .attr("x", x)
    .attr("y", 4)
    .attr("text-anchor", "middle")
    .text(function(d) { return formatDateIntoMonth(d); });

var handle = slider.insert("circle", ".track-overlay")
    .attr("class", "handle")
    .attr("r", 9);

var label = slider.append("text")  
    .attr("class", "label")
    .attr("text-anchor", "middle")
    .text(formatDate(startDate))
    .attr("transform", "translate(0," + (-25) + ")")

 
////////// plot //////////


function update(h) {
  // update position and text of label according to slider scale



  handle.attr("cx", x(h));
  label
    .attr("x", x(h))
    .text(formatDate(h));
  console.log(formatDate(h))
  console.log(h)
  var formatDate2 = d3.timeFormat("%m %d %Y");

  date = formatDate2(h).split(" ")
  date = date[0].replace(/\b0+/g, '')+ "/" + date[1].replace(/\b0+/g, '') + "/20"
  console.log(date)
/*  console.log(date)
  date = "2/28/20"*/
  response = $.postFlaskVars("/get_map_data",{"date": date});
  county_colorings = response["county"]
    state_colorings = response["state"]
  console.log(state_colorings)

d3.selectAll(".state").style("fill",function(d) {
                return  state_colorings[d.id]
             })
/*d3.selectAll(".counties").style("fill",function(d) {
                return county_colorings[d.id] })
d3.selectAll("")
}*/
}