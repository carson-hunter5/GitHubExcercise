// Load the data
const socialMedia = d3.csv("socialMedia.csv");

// Once the data is loaded, proceed with plotting
socialMedia.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.Likes = +d.Likes;
    });

    // Define the dimensions and margins for the SVG
    let margin = {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
    };
  
    let width = 600,
        height = 400;

    // Create the SVG container
    let svg = d3.select('body')
                .append('svg')
                .attr('width', width)
                .attr('height', height)
                .style('background', 'lightyellow');

    // Set up scales for x and y axes
    let yscale = d3.scaleLinear()
        .domain([d3.min(data, d => d.Likes), d3.max(data, d => d.Likes)])
        .range([height - margin.bottom, margin.top]);

    let xscale = d3.scaleBand()
        .domain([...new Set(data.map(d => d.Platform))])
        .range([margin.left, width - margin.right])
        .padding(0.5);

    // Add scales
    let yaxis = svg.append('g')
                  .call(d3.axisLeft().scale(yscale))
                  .attr('transform', `translate(${margin.left} , 0)`);
              
    let xaxis = svg.append('g')
                  .call(d3.axisBottom().scale(xscale))
                  .attr('transform', `translate(0,${height - margin.bottom})`);

    // Add x-axis label
    svg.append('text')
        .text('Platform')
        .attr('x', width / 2)
        .attr('y', height - 15);

    // Add y-axis label
    svg.append('text')
        .text('Likes')
        .attr('x', 0 - height / 2)
        .attr('y', 25)
        .attr('transform', 'rotate(-90)');

    // Compute box plot statistics
    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.Likes).sort(d3.ascending);
        return {
            min: d3.min(values),
            q1: d3.quantile(values, 0.25),
            median: d3.median(values),
            q3: d3.quantile(values, 0.75),
            max: d3.max(values)
        };
    };

    const quantilesByGroups = d3.rollup(data, rollupFunction, d => d.Platform);

    quantilesByGroups.forEach((quantiles, platform) => {
        const x = xscale(platform);
        const boxWidth = xscale.bandwidth();

        // Draw vertical lines (whiskers)
        svg.append('line')
            .attr('x1', x + boxWidth / 2)
            .attr('x2', x + boxWidth / 2)
            .attr('y1', yscale(quantiles.min))
            .attr('y2', yscale(quantiles.max))
            .attr('stroke', 'black');

        // Draw box
        svg.append('rect')
            .attr('x', x)
            .attr('y', yscale(quantiles.q3))
            .attr('width', boxWidth)
            .attr('height', yscale(quantiles.q1) - yscale(quantiles.q3))
            .attr('fill', 'steelblue');

        // Draw median line
        svg.append('line')
            .attr('x1', x)
            .attr('x2', x + boxWidth)
            .attr('y1', yscale(quantiles.median))
            .attr('y2', yscale(quantiles.median))
            .attr('stroke', 'black')
            .attr('stroke-width', 2);
    });
});


// Prepare you data and load the data again. 
// This data should contains three columns, platform, post type and average number of likes. 
// Load the data
const socialMediaAvg = d3.csv("socialMediaAvg.csv");

socialMediaAvg.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.Likes = +d.Likes;
    });

    // Define the dimensions and margins for the SVG
    let margin = { top: 50, bottom: 50, left: 50, right: 50 };
    let width = 600, height = 400;

    // Create the SVG container
    let svg = d3.select('body')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('background', 'lightblue');

    // Define four scales
    // Scale x0 is for the platform, which divide the whole x scale into 4 parts
    // Scale x1 is for the post type, which divide each bandwidth of the previous x0 scale into three part for each post type
    // Recommend to add more spaces for the y scale for the legend
    // Also need a color scale for the post type

    const x0scale = d3.scaleBand()
        .domain([...new Set(data.map(d => d.Platform))])
        .range([margin.left, width - margin.right])
        .padding(0.5);

    const x1scale = d3.scaleBand()
        .domain([...new Set(data.map(d => d.PostType))])
        .range([0, x0scale.bandwidth()])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Likes) * 1.1])
        .range([height - margin.bottom, margin.top+30]);

    const color = d3.scaleOrdinal()
        .domain([...new Set(data.map(d => d.PostType))])
        .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);

    // Add scales x0 and y 
    let y = svg.append('g')
        .call(d3.axisLeft().scale(yScale))
        .attr('transform', `translate(${margin.left}, 0)`);

    let x0 = svg.append('g')
        .call(d3.axisBottom().scale(x0scale))
        .attr('transform', `translate(0,${height - margin.bottom})`);

    // Add x-axis label
    svg.append('text')
        .text('Platform')
        .attr('x', width / 2)
        .attr('y', height - 15);

    // Add y-axis label
    svg.append('text')
        .text('Likes')
        .attr('x', 0 - height / 2)
        .attr('y', 20)
        .attr('transform', 'rotate(-90)');

    // Group container for bars
    const barGroups = svg.selectAll("bar")
        .data(data)
        .enter()
        .append("g")
        .attr("transform", d => `translate(${x0scale(d.Platform)},0)`);

    // Draw bars
    barGroups.append("rect")
        .attr('x', d => x1scale(d.PostType))
        .attr('y', d => yScale(d.Likes))
        .attr('width', x1scale.bandwidth())
        .attr('height', d => height - margin.bottom - yScale(d.Likes))
        .attr('fill', d => color(d.PostType));

    // Add the legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 150}, ${margin.top})`);

    const types = [...new Set(data.map(d => d.PostType))];

    types.forEach((type, i) => {
        // Already have the text information for the legend. 
        // Now add a small square/rect bar next to the text with corresponding color.
        legend.append("rect")
            .attr("x", 0)
            .attr("y", i * 20)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", color(type));

        legend.append("text")
            .attr("x", 20)
            .attr("y", i * 20 + 12)
            .text(type)
            .attr("alignment-baseline", "middle");
    });
});

// Prepare you data and load the data again. 
// This data should contains two columns, date (3/1-3/7) and average number of likes. 

const socialMediaTime = d3.csv("socialMediaTime.csv");

socialMediaTime.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
      d.Likes = +d.Likes;
  });

    // Define the dimensions and margins for the SVG
    

    // Create the SVG container
    

    // Set up scales for x and y axes  


    // Draw the axis, you can rotate the text in the x-axis here


    // Add x-axis label
    

    // Add y-axis label


    // Draw the line and path. Remember to use curveNatural. 

});
