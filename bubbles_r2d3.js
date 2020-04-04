// Based on https://bl.ocks.org/mbostock/4063269

// Initialization
svg.attr("font-family", "sans-serif")
  .attr("font-size", "14")
  .attr("text-anchor", "middle")
  .attr("style", "");
    
var svgSize = 1000;
var pack = d3.pack()
  .size([svgSize, svgSize])
  .padding(1.5);
    
var format = d3.format(",d");
var color = d3.scaleOrdinal(d3.schemeCategory20c);
var group = svg.append("g");
var defs = svg.append("defs");

// Resize
r2d3.onResize(function(width, height) {
  var minSize = Math.min(width, height);
  var scale = minSize / svgSize;
  
  group.attr("transform", function(d) {
    return "" +
      "translate(" + (width - minSize) / 2 + "," + (height - minSize) / 2 + ")," +
      "scale(" + scale + "," + scale + ")";
  });
});

// Rendering
r2d3.onRender(function(data, svg, width, height, options) {
  group.selectAll(".node").remove();
  
  var root = d3.hierarchy({children: data})
    .sum(function(d) { return d.value; })
    .each(function(d) {
      if (id = d.data.id) {
        var id, i = id.lastIndexOf("|"), j = id.lastIndexOf("$");
        d.id = id.slice(i + 1, j);
        d.shorten = (id.slice(i + 1, j).length - id.slice(i + 1, Math.min(j, 30)).length) >  0 ? id.slice(i + 1, Math.min(j, 30)) + "..." : id.slice(i + 1, j) ;
        d.post_id = id.slice(0, i);
        d.url = id.slice(j + 1);
        d.class = id.slice(i + 1, i + 2);
      }
    });

  defs.selectAll(".food-pattern")
    .data(pack(root).leaves())
    .enter().append("pattern")
    .attr("id", function(d) { return d.post_id })
    .attr("height", "100%")
    .attr("width", "100%")
    .attr("patternContentUnits", "objectBoundingBox")
    .append("image")
    .attr("heigh", 1)
    .attr("width", 1)
    .attr("preserveAspectRatio", "none")
    .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
    .attr("xlink:href", function(d) { return "thumbnail/" + d.post_id + ".png" }); 
    
  var node = group.selectAll(".node")
    .data(pack(root).leaves())
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      .append("a")
        .attr("xlink:href", function(d) {
            return "https://www.reddit.com" + d.url;
            })
        .attr("target", "_blank");
  
  node.append("circle")
    .attr("id", function(d) { return d.id; })
    .attr("r", function(d) { return d.r; })
    .attr("post_id", function(d) { return d.post_id; })
    .attr("url", function(d) { return d.url; })
    //.style("fill", function(d) { return color(d.class); })
    .attr("fill", function(d) { return "url(#" + d.post_id + ")" })
    .attr("fill-opacity", 0.95)
    .style("stroke", "black")
    .attr("stroke-width", 1)
    .on('mouseover', function(){
        d3.select(this)
          .style("stroke", function(d) { return color(d.class); })
          .attr("stroke-width", 3)
          .attr("fill-opacity", 0.2);
        d3.select(this.parentNode).selectAll("tspan")
          .attr("fill-opacity", 1)
          .attr("fill", "white");
      })
    .on('mouseout', function(){
        d3.select(this)
          .style('stroke', 'black')
          .attr("fill-opacity", 0.9)
          .attr("stroke-width", 1);
        d3.select(this.parentNode).selectAll("tspan")
            .attr("fill-opacity", 0)
            .attr("fill", "black");
      });

  node.append("clipPath")
      .attr("id", function(d) { return "clip-" + d.id; })
    .append("use")
      .attr("xlink:href", function(d) { return "#" + d.id; });

  node.append("text")
      .attr("clip-path", function(d) { return "url(#clip-" + d.id + ")"; })
    .selectAll("tspan")
    .data(function(d) { return d.shorten.split(/\s/g); }) 
    // /(?<!\s\S{1,3})\s/g lookbehind not supported in other browsers except chrome
    .enter().append("tspan")
      .attr("id", function(d) { return d.id; })
      .attr("x", 0)
      .attr("y", function(d, i, nodes) { return 20 + (i - nodes.length / 2 - 0.5) * 15; })
      .attr("fill", "black")
      .attr("fill-opacity", 0)
      .text(function(d) { return d; })
      .on('mouseover', function(){
        d3.select(this.parentNode.parentNode).selectAll("circle")
          .style("stroke", function(d) { return color(d.class); })
          .attr("stroke-width", 3)
          .attr("fill-opacity", 0.2);
        d3.select(this.parentNode).selectAll("tspan")
          .attr("fill-opacity", 1)
          .attr("fill", "white");
        })
      .on('mouseout', function(){
        d3.select(this.parentNode.parentNode).selectAll("circle")
          .style('stroke', 'black')
          .attr("stroke-width", 1)
          .attr("fill-opacity", 0.9);
        d3.select(this.parentNode).selectAll("tspan")
            .attr("fill-opacity", 0)
            .attr("fill", "black");
        });

  node.append("title")
      .text(function(d) { return d.id + "\n" + format(d.value) + " upvotes"; });
  
  r2d3.resize(width, height);
});