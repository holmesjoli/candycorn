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

// Title Generates a y-axis label
// Param yVar string. Name of the y-variable
// Return string.
function yLab(yVar) {
    if (yVar == "pounds") {
        return "Candy corn purchased (lbs)";
    } else {
        return "Pounds purchased per 100 people"
    }
};

// Title Bar
// Param id string. HTML ID
// Param yVar string. Name of the y-variable
// Return object
function bar(id, yVar) {

    // Data originally from https://www.candystore.com/blog/halloween-candy-data-2021/
    // Data have been combined and filtered
    d3.csv("./data/candycorn.csv").then(function(data) {

        const width = 1000;
        const height = window.innerHeight;
        const margin = {top: 25, left: 100, right: 200, bottom: 125};
        
        let svg = d3.select(id)
                    .append("svg")
                    .attr("height", height)
                    .attr("width", width);

        const lb = {
            max: d3.max(data, function(d) {return +d[yVar];}),
            min: d3.min(data, function(d) {return +d[yVar];})
        };

        console.log(lb);

        const states = d3.map(data, function(d) {return d.name;})
        const regions = d3.map(data, function(d) {return d.region_name;})
        const fillColors = ["#1B9E77", "#D95F02", "#7570B3", "#E7298A"];
        const strokeColors = ["black", "white"];

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
                    .domain(states)
                    .range([margin.left, width-margin.right])
                    .padding(0.1);

        let fillScale = d3.scaleOrdinal()
                    .domain(regions)
                    .range(fillColors);

        let strokeScale = d3.scaleOrdinal()
                    .domain(high_per_pop_unique)
                    .range(strokeColors);

        //Bars
        svg.selectAll("rect")
                    .data(data)
                    .enter()
                    .append("rect")
                    .attr("x", function(d) {return xScale(d.name);})
                    .attr("y", function(d) {return yScale(d[yVar]);})
                    .attr("fill", function(d) {return fillScale(d.region_name);})
                    .attr("stroke", function(d) {return strokeScale(d.high_per_pop);})
                    .attr("stroke-width", 2)
                    .attr("width", xScale.bandwidth())
                    .attr("height", function(d) {return height - margin.bottom - yScale(d.pounds);});

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

        svg.append("text")
                    .attr("class","axisLabel")
                    .attr("x", -(height-margin.bottom)/2)
                    .attr("y", 30)
                    .attr("text-anchor","middle")
                    .attr("transform","rotate(-90)")
                    .text(yLab(yVar));

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
            .attr("y", 30)
            .text("Region")
            .style("font-weight", "bold");

        // Stroke legend

        svg
            .append("rect")
            .attr("width", 20)
            .attr("height", 20)
            .attr("x", legendx + legend_margin)
            .attr("y", 200)
            .attr("fill", "black")
            .attr("stroke", "white")
            .attr("stroke-width", 2);

        svg
            .append("text")
            .attr("x", legendx + legend_margin + 25)
            .attr("y", 215)
            .text("High consumption");

        svg
            .append("text")
            .attr("x", legendx + legend_margin + 25)
            .attr("y", 230)
            .text("per capita");
    });
};

bar("#chart-1", yVar = "pounds");
bar("#chart-2", yVar = "pound_per_pop_100");
