test = d3.select('.sex')
test = d3.select('.sex').node()
test = d3.select('.sex').size()

d3.select('.breed').text('Unknown')

d3.select('tr:nth-child(3) .breed').text('Domestic Longhair')

d3.selectAll('.rate').text('5')

d3.selectAll('tr:nth-child(5)').remove()