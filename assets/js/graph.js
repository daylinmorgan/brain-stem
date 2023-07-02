var searchIndex = d3.json("/index.json").then(function (data) {
  var nodes = data.index;
  var links = data.links;

  // Calculate the number of links for each node
  nodes.forEach(function (node) {
    node.linksCount = links.filter(function (link) {
      return link.source === node.id || link.target === node.id;
    }).length;
  });

  var width = 500;
  var height = 500;

  var svg = d3
    .select("#graph")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 " + width + " " + height);

  var container = svg.append("g");

  function forceAttractToCenter() {
    var strength = 0.05;

    function force(alpha) {
      nodes.forEach(function (d) {
        var dx = width / 2 - d.x;
        var dy = height / 2 - d.y;
        d.vx += dx * strength * alpha;
        d.vy += dy * strength * alpha;
      });
    }

    return force;
  }

  var simulation = d3

    .forceSimulation(nodes)
    .force("charge", d3.forceManyBody().strength(-50))
    .force("link", d3.forceLink(links).distance(30).strength(0.3))
    .force("center", d3.forceCenter(width / 2, height / 2).strength(1))
    .force("collision", d3.forceCollide().radius(8))
    .force("attractToCenter", forceAttractToCenter())
    .on("tick", tick);

  var link = container
    .selectAll(".link")
    .data(links)
    .enter()
    .append("line")
    .attr("class", "link");

  var node = container
    .selectAll("circle.node")
    .data(nodes)
    .enter()
    .append("circle")
    .attr("class", "node")
    .attr("r", 8)
    .attr("fill", function (d) {
      // Define the color scale based on the number of links
      var colorScale = d3
        .scaleLinear()
        .domain([
          0,
          d3.max(nodes, function (n) {
            return n.linksCount;
          }),
        ])
        .range(["#1e1e2e", "#f2cdcd"]);
      return colorScale(d.linksCount);
    })
    .attr("stroke", "#f2cdcd")
    .call(drag(simulation));

  function tick() {
    link
      .attr("x1", function (d) {
        return d.source.x;
      })
      .attr("y1", function (d) {
        return d.source.y;
      })
      .attr("x2", function (d) {
        return d.target.x;
      })
      .attr("y2", function (d) {
        return d.target.y;
      });

    node
      .attr("cx", function (d) {
        return d.x;
      })
      .attr("cy", function (d) {
        return d.y;
      });
  }

  function drag(simulation) {
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(1).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return d3
      .drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
    // .on("dblclick", dblclick);
  }

  var tooltip = d3.select("div.tooltip");
  node
    .on("mouseover", function (event, d) {
     tooltip
        .style("visibility", "visible")
        .transition()
        .duration(200)
        .style("opacity", 1);
        tooltip
        .html(d.title)
        .style("left", event.pageX + 25 + "px")
        .style("top", event.pageY - 25 + "px");
    })
    .on("mouseout", function () {
      tooltip
        .transition()
        .duration(500)
        .style("opacity", 0)
        .on("end", function () {
          div.style("visibility", "hidden");
        });
    });

  svg
    .call(
      d3.zoom().on("zoom", function (event) {
        container.attr("transform", event.transform);
      })
    )
    .on("dblclick.zoom", null)
    .on("dblclick", function () {
      console.log("Clicked");
      nodes.forEach(function (o, i) {
        o.x += (Math.random() - 0.5) * 500;
        o.y += (Math.random() - 0.5) * 500;
      });
      simulation.alpha(1).restart();
    });
});
