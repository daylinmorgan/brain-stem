d3.json("/index.json").then((data) => {
  const { index: nodes, links } = data;

  const width = 500;
  const height = 500;
  const radius = 8;
  const pad = 10;

  const STROKE = "#f2cdcd";
  const ACTIVE_STROKE = "#f9e2af";

  for (const n of nodes) n.linksCount = 0;
  for (const { source, target } of links) {
    nodes[source].linksCount++;
    nodes[target].linksCount++;
  }

  // Resolve the "active" node: explicit ?node= query param wins, else document.referrer.
  const normalize = (path) => {
    if (!path) return "";
    try {
      path = new URL(path, window.location.origin).pathname;
    } catch {}
    return path.replace(/^\/+|\/+$/g, "").toLowerCase();
  };
  const hintKey = normalize(
    new URLSearchParams(window.location.search).get("node") || document.referrer,
  );
  let activeNode = null;
  if (hintKey) {
    activeNode =
      nodes.find((n) => {
        const u = normalize(n.uri);
        return u && (u === hintKey || u.endsWith("/" + hintKey) || hintKey.endsWith("/" + u));
      }) ||
      nodes.find((n) => (n.title || "").toLowerCase() === hintKey);
  }
  if (activeNode) {
    activeNode.x = width / 2;
    activeNode.y = height / 2;
  }

  const colorScale = d3
    .scaleLinear()
    .domain([0, d3.max(nodes, (n) => n.linksCount)])
    .range(["#1e1e2e", "#f2cdcd"]);

  const svg = d3
    .select("#graph")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", `0 0 ${width} ${height}`);

  svg
    .append("defs")
    .append("filter")
    .attr("id", "active-glow")
    .attr("x", "-50%").attr("y", "-50%")
    .attr("width", "200%").attr("height", "200%")
    .append("feDropShadow")
    .attr("dx", 0).attr("dy", 0)
    .attr("stdDeviation", 3)
    .attr("flood-color", ACTIVE_STROKE)
    .attr("flood-opacity", 0.9);

  const container = svg.append("g");

  const centerStrength = (d) => (d === activeNode ? 0.6 : 0.05);

  const simulation = d3
    .forceSimulation(nodes)
    .force("charge", d3.forceManyBody().strength(-50))
    .force("link", d3.forceLink(links).distance(30).strength(0.3))
    .force("center", d3.forceCenter(width / 2, height / 2).strength(1))
    .force("collision", d3.forceCollide().radius(radius))
    .force("x", d3.forceX(width / 2).strength(centerStrength))
    .force("y", d3.forceY(height / 2).strength(centerStrength))
    .on("tick", tick);

  const drag = d3
    .drag()
    .on("start", (event, d) => {
      if (!event.active) simulation.alphaTarget(1).restart();
      d.fx = d.x;
      d.fy = d.y;
    })
    .on("drag", (event, d) => {
      d.fx = event.x;
      d.fy = event.y;
    })
    .on("end", (event, d) => {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    });

  const link = container
    .selectAll("line.link")
    .data(links)
    .join("line")
    .attr("class", "link");

  const node = container
    .selectAll("circle.node")
    .data(nodes)
    .join("circle")
    .attr("class", "node")
    .attr("r", radius)
    .attr("fill", (d) => colorScale(d.linksCount))
    .call(drag);

  const applyActiveStyle = () => {
    node
      .attr("stroke", (d) => (d === activeNode ? ACTIVE_STROKE : STROKE))
      .attr("stroke-width", (d) => (d === activeNode ? 3 : 1.5))
      .attr("filter", (d) => (d === activeNode ? "url(#active-glow)" : null));
  };
  applyActiveStyle();

  function tick() {
    for (const d of nodes) {
      d.x = Math.max(pad, Math.min(width - pad, d.x));
      d.y = Math.max(pad, Math.min(height - pad, d.y));
    }
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);
    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
  }

  const tooltip = d3.select("div.tooltip");
  const TT_MARGIN = 8;
  const TT_OFFSET = 4;

  node
    .on("dblclick", (event, d) => {
      event.stopPropagation();
      if (d.uri) window.location.href = d.uri;
    })
    .on("mouseover", function (_event, d) {
      tooltip.interrupt();
      tooltip
        .style("visibility", "visible")
        .html(d.title)
        .transition()
        .duration(200)
        .style("opacity", 1);
      const { offsetWidth: ttW, offsetHeight: ttH } = tooltip.node();
      const rect = this.getBoundingClientRect();
      let left = rect.right + window.scrollX + TT_OFFSET;
      let top = rect.top + window.scrollY - ttH - TT_OFFSET;
      if (left + ttW + TT_MARGIN > window.innerWidth + window.scrollX) {
        left = rect.left + window.scrollX - ttW - TT_OFFSET;
      }
      if (top < window.scrollY + TT_MARGIN) {
        top = rect.bottom + window.scrollY + TT_OFFSET;
      }
      tooltip.style("left", `${left}px`).style("top", `${top}px`);
    })
    .on("mouseout", () => {
      tooltip
        .transition()
        .duration(500)
        .style("opacity", 0)
        .on("end", () => tooltip.style("visibility", "hidden"));
    });

  const clearBtn = document.getElementById("clear-active");
  if (clearBtn) {
    clearBtn.hidden = !activeNode;
    clearBtn.addEventListener("click", () => {
      if (!activeNode) return;
      activeNode = null;
      applyActiveStyle();
      clearBtn.hidden = true;
      simulation.alpha(0.5).restart();
    });
  }

  svg
    .call(d3.zoom().on("zoom", (event) => container.attr("transform", event.transform)))
    .on("dblclick.zoom", null)
    .on("dblclick", () => {
      for (const o of nodes) {
        o.x += (Math.random() - 0.5) * 500;
        o.y += (Math.random() - 0.5) * 500;
      }
      simulation.alpha(1).restart();
    });
});
