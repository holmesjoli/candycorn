//Title Unique Array
//Description the unique value of a variable from the data
//Return array
function unique_array(data, variable) {

    const u = [];

    data.forEach(function(d) {
        if (u.indexOf(d[variable]) === -1) {
            u.push(d[variable]);
        }
    });
    return u;
};

// Title Y Label
// Description updates the label depending on the attribute
function yLabel(svg, height, margin, attr) {

    d3.select("#yAxisLabel").remove();

    svg.append("text")
        .attr("class","axisLabel")
        .attr("id", "yAxisLabel")
        .attr("x", -(height-margin.bottom)/2)
        .attr("y", 30)
        .attr("text-anchor","middle")
        .attr("transform","rotate(-90)")
        .text(attr.yLab);
}

// title Title
// description Adds a title to each of the plots
function title(svg, width, margin, attr) {

    d3.select("#chart-title").remove();

    svg
        .append("text")
        .attr("id", "chart-title")
        .attr("x", (width - margin.left)/2)
        .attr("y", 50)
        .attr("font-size", 20)
        .text(attr.title)
        .attr("text-anchor", "middle");
};

// title Bar Transition
// description Transitions the bars between two different variables and updates corresponding labels and title
function barTransition(svg, bars, yAxis, yScale, xScale, data, height, width, margin, tooltip, attr) {

    d3.select(attr.button_id).on("click", function() {

        let yVar = attr.yVar;

        let minMax = {
            max: d3.max(data, function(d) {return +d[yVar];}),
            min: d3.min(data, function(d) {return +d[yVar];})
        };

        yScale.domain([0, minMax.max]);

        bars.transition()
            .duration(1500)
            .attr("y", function(d) { return yScale(d[yVar]); })
            .attr("height", function(d) { return height - margin.bottom - yScale(d[yVar]); });

        yAxis.transition()
            .duration(500)
            .call(d3.axisLeft().scale(yScale));

        yLabel(svg, height, margin, attr);
        title(svg, width, margin, attr);
        tt(bars, xScale, tooltip, attr);

        document.getElementById(attr.other_button_id).classList.remove("active");
        d3.select(attr.button_id).attr("class", "active");
    });
};

//Title tooltip
function tt(bars, xScale, tooltip, attr) {

    bars.on("mouseover", function(e, d) {

        let t = d3.select(this);
        let x = +t.attr("x") - xScale.bandwidth()/2;
        let y = +t.attr("y") - 30;

        tooltip.style("visibility","visible") 
            .style("left", `${x}px`)         
            .style("top", `${y}px`)
            .html(`${Math.round(d[attr.yVar], 1)} ${attr.tooltip}`);

        bars.attr("opacity", 0.2);
        t.attr("opacity", 1);

    }).on("mouseout", function() {
        tooltip.style("visibility","hidden");   
        bars.attr("opacity", 1);
    });
}

// Title Bar chart
// Param pound_attr object. Object of attributes for pound bar graph.
// Param pound_per_pop_attr. Object of attributes for pound per pop graph.
// Param yVar string. Name of the y-variable
// Return object
function barChart(data, pound_attr, pound_per_pop_attr) {

        const height = window.innerHeight;
        const width = height*1.5;
        const margin = {top: 100, left: 100, right: 200, bottom: 125};

        const lb = {
            max: d3.max(data, function(d) {return +d.pounds;}),
            min: d3.min(data, function(d) {return +d.pounds;})
        };

        const geo = d3.map(data, function(d) {return d.name;})
        const regions = d3.map(data, function(d) {return d.region_name;})
        const fillColors = ["#1B9E77", "#FF761E", "#7570B3", "#F7CD1E"];
        const strokeColors = ["#333333", "#9cb6dd"];

        const regions_unique = unique_array(data, "region_name");
        const high_per_pop_unique = unique_array(data, "high_per_pop");

        const legend_data = [];
        regions_unique.forEach(function(d, i) {
            legend_data.push({regions: d, color: fillColors[i]});
        });

        // Scales
        let yScale = d3.scaleLinear()
                    .domain([0, lb.max])
                    .range([height-margin.bottom, margin.top]);

        let xScale = d3.scaleBand()
                    .domain(geo)
                    .range([margin.left, width-margin.right])
                    .padding(0.1);

        let fillScale = d3.scaleOrdinal()
                    .domain(regions)
                    .range(fillColors);

        let strokeScale = d3.scaleOrdinal()
                    .domain(high_per_pop_unique)
                    .range(strokeColors);

        let svg = d3.select("#chart")
                    .append("svg")
                    .attr("height", height)
                    .attr("width", width);

        //Axes
        const xAxis = svg.append("g")
                    .attr("transform",`translate(0,${height-margin.bottom})`)              
                    .call(d3.axisBottom().scale(xScale))
                    .selectAll("text")	
                    .style("text-anchor", "end")
                    .attr("dx", "-.8em")
                    .attr("dy", ".15em")
                    .attr("transform", "rotate(-65)");

        const yAxis = svg.append("g")
                    .attr("transform",`translate(${margin.left},0)`)
                    .call(d3.axisLeft().scale(yScale));

        svg.append("text")
                    .attr("class","axisLabel")
                    .attr("x", margin.left + (width-margin.left-margin.right)/2)
                    .attr("y", height - 5)
                    .attr("text-anchor","middle")
                    .text("State");

        yLabel(svg, height, margin, pound_attr);
        title(svg, width, margin, pound_attr);

        // Bars
        let bars = svg.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
                .attr("x", function(d) { return xScale(d.name); })
                .attr("y", function(d) { return yScale(d.pounds); })
                .attr("fill", function(d) {return fillScale(d.region_name);})
                .attr("stroke", function(d) {return strokeScale(d.high_per_pop);})
                .attr("stroke-width", 4)
                .attr("width", xScale.bandwidth())
                .attr("height", function(d) { return height - margin.bottom - yScale(d.pounds); });

        // Region legend
        const legendx = width - margin.right;
        const legend_margin = 10;

        svg.selectAll("region-legend")
            .data(legend_data)
            .enter()
            .append("rect")
                .attr("width", 20)
                .attr("height", 20)
                .attr("x", legendx + legend_margin)
                .attr("y", function(d, i) {return 30*i + margin.top + 20;})
                .attr("fill", function(d) {return d.color});

        svg.selectAll("region-legend")
                .data(legend_data)
                .enter()
                .append("text")
                    .attr("x", legendx + 35)
                    .attr("y", function(d, i) {return 30*i + margin.top + 35;})
                    .text(function(d) {return d.regions});

        svg
            .append("text")
            .attr("x", legendx + legend_margin)
            .attr("y", margin.top + 5)
            .text("Region")
            .style("font-weight", "bold");

        // Stroke legend
        svg
            .append("rect")
            .attr("width", 20)
            .attr("height", 20)
            .attr("x", legendx + legend_margin)
            .attr("y", margin.top +180)
            .attr("fill", "#333333")
            .attr("stroke", "#9cb6dd")
            .attr("stroke-width", 4);

        svg
            .append("text")
            .attr("x", legendx + legend_margin + 25)
            .attr("y", margin.top + 190)
            .text("High consumption");

        svg
            .append("text")
            .attr("x", legendx + legend_margin + 25)
            .attr("y", margin.top + 205)
            .text("per capita threshold");

        const tooltip = d3.select("#chart")
            .append("div")
            .attr("class","tooltip");

        tt(bars, xScale, tooltip, pound_attr);

        barTransition(svg, bars, yAxis, yScale, xScale, data, height, width, margin, tooltip, pound_attr);
        barTransition(svg, bars, yAxis, yScale, xScale, data, height, width, margin, tooltip, pound_per_pop_attr);
};

let chart1_attr = {
    yVar: "pounds",
    yLab: "Candy corn purchased (lbs)",
    title: "Pounds of Candy Corn Purchased during the 2021 Halloween Season",
    button_id: "#pounds",
    other_button_id: "pound_per_pop_100",
    tooltip: "pounds",};

let chart2_attr = {
    yVar: "pound_per_pop_100",
    yLab: "Pounds purchased per 100 people",
    title: "Pounds of Candy Corn Purchased per 100 people during the 2021 Halloween Season",
    button_id: "#pound_per_pop_100",
    other_button_id: "pounds",
    tooltip: "lb(s) per 100 people"};

d3.csv("./data/candycorn.csv").then(function(data) {
    barChart(data, pound_attr = chart1_attr, pound_per_pop_attr = chart2_attr);
});
