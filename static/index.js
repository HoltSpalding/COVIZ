/*Slider SVG*/
default_date = new Date("2020-01-23")
current_date = default_date
function redraw_slider(curr_date) {
    // Get dates
    Date.prototype.addDays = function(days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
    }
    var startDate = new Date("2020-01-23");
    var endDate = new Date("2020-04-30");
    var slider_dims = document.getElementById('slidercard').getBoundingClientRect()
    var width = slider_dims.width
    console.log(width)

    //Get tick values
    var tick_vals = [startDate]
    var curr_month = startDate.getMonth()
    var dataTime = d3.range(0, 99).map(function(d) {
        if (d == 0) { return startDate } 
        else { 
            date = startDate.addDays(d)
            if (date.getMonth() != curr_month) {
                curr_month = date.getMonth() 
                tick_vals.push(date)
            } return date }});
    tick_vals.push(endDate)

    var sliderTime = d3
                    .sliderBottom()
                    .min(d3.min(dataTime))
                    .max(d3.max(dataTime))
                    .width(width*0.8)
                    .tickFormat(d3.timeFormat('%b'))
                    .tickValues(tick_vals)
                    .default(curr_date)
                    .on('onchange', val => {
                      d3.select('p#value-time').text(d3.timeFormat('%b %d %Y')(val));
                      current_date = val
                    });

    var gTime = d3
                .select('div#slider-time')
                .append('svg')
                .attr('id','slider-svg')
                .attr('width', width*1.02)
                .attr('height', 80)
                .append('g')
                .attr('transform', 'translate(30,30)');

    gTime.call(sliderTime);

    d3.select('p#value-time').text(d3.timeFormat('%b %d %Y')(sliderTime.value()));
}
//update slider width on resize
redraw_slider(default_date)
window.addEventListener('resize', function(event){
    function re(callback) {
        d3.select("#slider-svg").remove()
        callback(current_date)
    }
    re(redraw_slider)});


// Slider done ********************************************

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


