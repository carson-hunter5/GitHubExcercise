// Load the data
const socialMedia = d3.csv("socialMedia.csv");

// Set dimensions and margins
const width = 600, height = 400;
const margin = { top: 50, bottom: 50, left: 50, right: 50 };

// Create an SVG container for the box plot
const svgBoxPlot = d3.select("#boxplot")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background", "lightyellow");

// Process and visualize box plot data
socialMedia.then(data => {
    data.forEach(d => d.Likes = +d.Likes);

    const xScale = d3.scaleBand()
        .domain([...new Set(data.map(d => d.Platform))])
        .range([margin.left, width - margin.right])
        .padding(0.5);
    
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Likes)])
        .range([height - margin.bottom, margin.top]);

    svgBoxPlot.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));
    
    svgBoxPlot.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale));

    // Compute box plot stats
    const boxData = Array.from(d3.group(data, d => d.Platform), ([key, values]) => {
        const sorted = values.map(d => d.Likes).sort(d3.ascending);
        return {
            Platform: key,
            min: d3.min(sorted),
            q1: d3.quantile(sorted, 0.25),
            median: d3.median(sorted),
            q3: d3.quantile(sorted, 0.75),
            max: d3.max(sorted)
        };
    });

    // Draw box plot elements
    svgBoxPlot.selectAll(".box")
        .data(boxData)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.Platform))
        .attr("y", d => yScale(d.q3))
        .attr("width", xScale.bandwidth())
        .attr("height", d => yScale(d.q1) - yScale(d.q3))
        .attr("fill", "steelblue");

    svgBoxPlot.selectAll(".median-line")
        .data(boxData)
        .enter()
        .append("line")
        .attr("x1", d => xScale(d.Platform))
        .attr("x2", d => xScale(d.Platform) + xScale.bandwidth())
        .attr("y1", d => yScale(d.median))
        .attr("y2", d => yScale(d.median))
        .attr("stroke", "black")
        .attr("stroke-width", 2);
});

// Load the time-series data
const socialMediaTime = d3.csv("socialMediaTime.csv");

// Create an SVG container for the line plot
const svgLinePlot = d3.select("#lineplot")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Process and visualize line plot data
socialMediaTime.then(data => {
    data.forEach(d => {
        d.AvgLikes = +d.AvgLikes;
        d.Date = d3.timeParse("%m/%d")(d.Date);
    });

    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.Date))
        .range([margin.left, width - margin.right]);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.AvgLikes)])
        .range([height - margin.bottom, margin.top]);
    
    svgLinePlot.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%m/%d")));
    
    svgLinePlot.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(y));
    
    // Draw the line
    const line = d3.line()
        .x(d => x(d.Date))
        .y(d => y(d.AvgLikes))
        .curve(d3.curveNatural);
    
    svgLinePlot.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "green")
        .attr("stroke-width", 2)
        .attr("d", line);

    // Add points to the line plot
    svgLinePlot.selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.Date))
        .attr("cy", d => y(d.AvgLikes))
        .attr("r", 4)
        .attr("fill", "red");
});
