//Define data
let data = [
  { name: 'Rainne'    , rating: 8 },
  { name: 'Buddy'    , rating: 7 },
  { name: 'Paddy'   , rating: 3 },
  { name: 'Sticky', rating: 9 },
  { name: 'Midnight'  , rating: 5 },
  { name: 'Leo'  , rating: 6 }
];

let 
  width = 600,
  height = 400;

let margin = {
  top: 50,
  bottom: 50,
  left: 50,
  right: 50
}

let svg = d3.select('body')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('background', 'lightyellow')

//Define the scale
let yscale = d3.scaleLinear()
              .domain([0,10])
              .range([height - margin.bottom, margin.top])

let xscale = d3.scaleBand()
              .domain(data.map(d => d.name))
              .range([margin.left, width - margin.right])   
              .padding(0.5)           

//Draw the scale
let yaxis = svg.append('g')
              .call(d3.axisLeft().scale(yscale))
              .attr('transform', `translate(${margin.left} , 0)`)
              
let xaxis = svg.append('g')
              .call(d3.axisBottom().scale(xscale))
              .attr('transform', `translate(0,${height - margin.bottom})`)

//Draw the circles
let circles = svg.selectAll('circle')
                .data(data)
                .enter()
                .append('circle')
                .attr('r', 8)
                .attr('cx', d=> xscale(d.name) + xscale.bandwidth()/2)
                .attr('cy', d=> yscale(d.rating))

//Draw the labels
svg.append('text')
  .text('Name')
  .attr('x', width/2)
  .attr('y', height - 15)

svg.append('text')
  .text('Rating')
  .attr('x', 0-height/2)
  .attr('y', 25)
  .attr('transform', 'rotate(-90)')