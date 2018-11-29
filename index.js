const allColors = ['#f2f0f7', '#e2deed', '#c5bddb', '#a99cc9', '#8c7ab8', 
    '#6f59a6', '#594785', '#433663', '#2c2442', '#161221']

const createMap = (education, us) => {
//variables
    const color = d3.scaleThreshold()
        .domain([0.06, 0.12, 0.18, 0.24, 0.30, 0.36, 0.42, 0.48, 0.54])
        .range(allColors)
    const width = 960
    const height = 600
    const path = d3.geoPath()

//legend
    const formatPercent = d3.format('.0%')
    const legendScale = d3.scaleLinear()
        .domain([0, 0.6])
        .range([0, 300])
    const legendAxis = d3.axisBottom(legendScale)
        .tickSize(13)
        .tickValues(color.domain())
        .tickFormat((d) => formatPercent(d))
    const g = d3.select('#legend-axis').call(legendAxis)
    g.select('.domain').remove()
    g.selectAll('rect')
        .data(color.range().map((clr) => {
            let d = color.invertExtent(clr)
            if (d[0] == undefined) {
                d[0] = legendScale.domain()[0]
            }
            if (d[1] == undefined) {
                d[1] = legendScale.domain()[1]
            }
            return d
        }))
        .enter()
        .insert('rect', '.tick')
        .attr('height', 8)
        .attr('x', (d) => legendScale(d[0]))
        .attr('width', (d) => legendScale(d[1]) - legendScale(d[0]))
        .style('fill', (d) => color(d[0]))

//tooltip
    const tooltip = d3.select('#map')
        .append('div')
        .attr('id', 'tooltip')
        .style('opacity', 0)

//map
    const svg = d3.select('#map')
        .append('svg')
        .attr('height', height)
        .attr('width', width)

        svg.append('g')
            .attr('class', 'counties')
            .selectAll('path')
            .data(topojson.feature(us, us.objects.counties).features)
            .enter()
            .append('path')
            .attr('class', 'county')
            .attr('fill', (d) => {
                let county = education.find((obj) => obj.fips === d.id)
                if (county) {
                    return color(county.bachelorsOrHigher / 100)
                }
                return color[0]
            })
            .attr('d', path)
            .on('mouseover', (d) => {
                tooltip.style('opacity', 0.8)
                tooltip.html(() => {
                    const county = education.find((obj) => obj.fips === d.id)
                    return `${county.area_name}, ${county.state}: ${county.bachelorsOrHigher}%`
                })
                    .style('left', (d3.event.pageX + 10) + 'px')
                    .style('top', (d3.event.pageY - 28) + 'px')
            })
            .on('mouseout', (d) => {
                tooltip.style('opacity', 0)
            })


        svg.append('path')
            .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
            .attr('class', 'states')
            .attr('d', path)
}


fetch('https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json')
    .then((res) => res.json())
    .then((educationData) => {
        fetch('https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json')
            .then((res) => res.json())
            .then((countiesData) => {
                createMap(educationData, countiesData)
            })
    })