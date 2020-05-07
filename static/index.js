/*Slider SVG*/
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
                .width(width)
                .tickFormat(d3.timeFormat('%b'))
                .tickValues(tick_vals)
                .default(startDate)
                .on('onchange', val => {
                  d3.select('p#value-time').text(d3.timeFormat('%b %d %Y')(val));
                });

var gTime = d3
            .select('div#slider-time')
            .append('svg')
            .attr('width', width)
            .attr('height', 80)
            .append('g')
            .attr('transform', 'translate(30,30)');

gTime.call(sliderTime);

d3.select('p#value-time').text(d3.timeFormat('%b %d %Y')(sliderTime.value()));
