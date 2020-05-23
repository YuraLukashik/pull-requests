// @ts-nocheck
import * as d3 from "d3"
import { useEffect, useRef } from "react"
import * as React from "react"

export type ChartData = {
  name: string
  description?: string
  value?: number
  children?: ChartData[]
  color?: string
}

function labelHtml(data: ChartData):string {
  const nameNode = `<tspan>${data.name}</tspan>`
  const descriptionNode = data.description ? `<tspan x='0' dy='2em'>${data.description}</tspan>` : ""
  return `${nameNode}${descriptionNode}`
}

function buildSVG(charData: ChartData) {
  const width = 800
  const height = 800
  const color = d3.scaleLinear()
    .domain([0, 5])
    .range(["hsl(0,0%,100%)", "hsl(270,2%,36%)"])
    .interpolate(d3.interpolateHcl)

  const pack = data => d3.pack()
    .size([width, height])
    .padding(3)
    (d3.hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value))

  const root = pack(charData);
  let focus = root;
  let view;

  const svg = d3.create("svg")
    .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
    .style("display", "block")
    .style("margin", "0 -14px")
    .style("background", color(0))
    .style("cursor", "pointer")
    .on("click", () => zoom(root));

  const node = svg.append("g")
    .selectAll("circle")
    .data(root.descendants().slice(1))
    .join("circle")
    .attr("fill", d => d.children ? color(d.depth) : d.data.color)
    .attr("pointer-events", d => !d.children ? "none" : null)
    .on("mouseover", function() { d3.select(this).attr("stroke", "#000"); })
    .on("mouseout", function() { d3.select(this).attr("stroke", null); })
    .on("click", d => focus !== d && (zoom(d), d3.event.stopPropagation()));

  const label = svg.append("g")
    .style("font", "10px sans-serif")
    .attr("pointer-events", "none")
    .attr("text-anchor", "middle")
    .attr("fill", "#1f2d3d")
    .selectAll("text")
    .data(root.descendants())
    .join("text")
    .style("fill-opacity", d => d.parent === root ? 1 : 0)
    .style("display", d => d.parent === root ? "inline" : "none")
    .style("font-weight", "bold")
    .style("font-family", "Roboto")
    .style("font-size", "0.8125rem")
    .html(d => labelHtml(d.data));

  zoomTo([root.x, root.y, root.r * 2]);

  function zoomTo(v) {
    const k = width / v[2];

    view = v;

    label.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
    node.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
    node.attr("r", d => d.r * k);
  }

  function zoom(d) {
    const focus0 = focus;

    focus = d;

    const transition = svg.transition()
      .duration(d3.event.altKey ? 7500 : 750)
      .tween("zoom", d => {
        const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
        return t => zoomTo(i(t));
      });

    label
      .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
      .transition(transition)
      .style("fill-opacity", d => d.parent === focus ? 1 : 0)
      .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
      .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
  }
  return svg
}


export function Chart(props: { chartData: ChartData }) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const svg = buildSVG(props.chartData)
    const chartContainer = chartContainerRef.current
    while (chartContainer.hasChildNodes()) {
      chartContainer.removeChild(chartContainer.lastChild)
    }
    chartContainer.append(svg.node())
  }, [props.chartData])
  return <div ref={chartContainerRef}/>
}
