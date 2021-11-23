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
function labs(yVar, xVar) {

    if (yVar == "pounds") {
        return {ylab: "Candy corn purchased (lbs)",
                xlab: "State",
                title: "Pounds of Candy Corn Purchased during the 2021 Halloween Season"};
    } else {
        return {ylab:"Pounds purchased per 100 people",
                xlab: "State",
                title: "Pounds of Candy Corn Purchased per 100 people during the 2021 Halloween Season"}
    }
};

// Title Bar
// Param id string. HTML ID
// Param yVar string. Name of the y-variable
// Return object
function bar(id, yVar, xVar, pth) {

    // Data originally from https://www.candystore.com/blog/halloween-candy-data-2021/
    // Data have been combined and filtered
    d3.csv(pth).then(function(data) {

        console.log("data", data);

        const width = 1000;
        const height = window.innerHeight;
        const margin = {top: 100, left: 100, right: 200, bottom: 125};
        
        let svg = d3.select(id)
                    .append("svg")
                    .attr("height", height)
                    .attr("width", width);

        const lb = {
            max: d3.max(data, function(d) {return +d[yVar];}),
            min: d3.min(data, function(d) {return +d[yVar];})
        };

        const geo = d3.map(data, function(d) {return d[xVar];})
        const regions = d3.map(data, function(d) {return d.region_name;})
        const fillColors = ["#1B9E77", "#FF761E", "#7570B3", "#F7CD1E"];
        const strokeColors = ["#333333", "white"];

        const regions_unique = unique_array(data, "region_name");
        const high_per_pop_unique = unique_array(data, "high_per_pop");

        const legend_data = [];
        regions_unique.forEach(function(d, i) {
            legend_data.push({regions: d, color: fillColors[i]});
        });

        let labels = labs(yVar, xVar);

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

        //Bars
        svg.selectAll("rect")
                    .data(data)
                    .enter()
                    .append("rect")
                    .attr("x", function(d) {return xScale(d[xVar]);})
                    .attr("y", function(d) {return yScale(d[yVar]);})
                    .attr("fill", function(d) {return fillScale(d.region_name);})
                    .attr("stroke", function(d) {return strokeScale(d.high_per_pop);})
                    .attr("stroke-width", 2)
                    .attr("width", xScale.bandwidth())
                    .attr("height", function(d) {return height - margin.bottom - yScale(d[yVar]);});

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
                    .text(labels.ylab);

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
            .attr("stroke", "white")
            .attr("stroke-width", 2);

        svg
            .append("text")
            .attr("x", legendx + legend_margin + 25)
            .attr("y", margin.top + 190)
            .text("High consumption");

        svg
            .append("text")
            .attr("x", legendx + legend_margin + 25)
            .attr("y", margin.top + 205)
            .text("per capita");

        //Title
        svg
            .append("text")
            .attr("class", "chart-title")
            .attr("x", (width - margin.left)/2)
            .attr("y", 50)
            .attr("font-size", 20)
            .text(labels.title)
            .attr("text-anchor", "middle");
    });
};

bar("#chart-1", yVar = "pounds", xVar = "name", pth = "./data/candycorn.csv");
bar("#chart-2", yVar = "pound_per_pop_100", xVar = "name", pth = "./data/candycorn.csv");

