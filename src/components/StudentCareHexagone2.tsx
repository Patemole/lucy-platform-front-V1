import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { hexbin as d3Hexbin } from "d3-hexbin";
import { Typography } from '@mui/material';

interface DataPoint {
  x: number;
  y: number;
  severity: number;
}

const HexbinHeatmap: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Set dimensions and margins dynamically based on parent width
    const svgElement = svgRef.current;
    const width = svgElement ? svgElement.clientWidth : 700; // Dynamic width based on the parent
    const height = 500;
    const margin = { top: 20, right: 30, bottom: 70, left: 70 }; // Adjusted for axis labels

    // Remove any existing content
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Set SVG dimensions to 100% width and specific height
    svg.attr("width", "100%").attr("height", height);

    // Create chart group with margins
    const chartGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Define scales
    const xScale = d3.scaleLinear().domain([0, 100]).range([0, chartWidth]);
    const yScale = d3.scaleLinear().domain([0, 100]).range([chartHeight, 0]);

    // Generate random data
    const data: DataPoint[] = d3.range(1000).map(() => {
      const xValue = Math.random() * 100;
      const yValue = Math.random() * 100;
      const severity = Math.ceil((yValue / 100) * 5);
      return { x: xValue, y: yValue, severity };
    });

    // Hexbin generator
    const hexRadius = 9;
    const hexbin = d3Hexbin<DataPoint>()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y))
      .radius(hexRadius)
      .extent([[0, 0], [chartWidth, chartHeight]]);

    // Color scale
    const severityColors = {
      1: '#9CD5AD',
      2: '#80C092',
      3: '#E0AF48',
      4: '#F38C28',
      5: '#F1311B',
    };

    const colorScale = d3
      .scaleOrdinal<number, string>()
      .domain([1, 2, 3, 4, 5])
      .range([
        severityColors[1],
        severityColors[2],
        severityColors[3],
        severityColors[4],
        severityColors[5],
      ]);

    // Generate hexbin data
    const hexbinData = hexbin(data);

    // Create tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "#f9f9f9")
      .style("border", "1px solid #d3d3d3")
      .style("padding", "10px")
      .style("border-radius", "5px")
      .style("pointer-events", "none")
      .style("display", "none"); // Initially hidden

    // Draw hexagons
    chartGroup
      .append("g")
      .selectAll(".hexagon")
      .data(hexbinData)
      .enter()
      .append("path")
      .attr("class", "hexagon")
      .attr("d", hexbin.hexagon())
      .attr("transform", (d) => `translate(${d.x},${d.y})`)
      .style("fill", (d) => {
        const meanSeverity = Math.round(d3.mean(d, (p) => p.severity)!);
        return colorScale(meanSeverity);
      })
      .style("stroke", "white")
      .style("stroke-width", 0.5)
      // Event handlers for hover and click
      .on("mouseover", function (event, d) {
        const meanSeverity = Math.round(d3.mean(d, (p) => p.severity)!);

        // Show tooltip
        tooltip
          .style("display", "block")
          .html(
            `<strong>Attrition rate:</strong> ${meanSeverity}<br/>
             <strong>Data Points:</strong> ${d.length}`
          )
          .style("left", `${event.pageX + 15}px`)
          .style("top", `${event.pageY}px`);

        d3.select(this).style("fill-opacity", 0.7); // Highlight hexagon
      })
      .on("mousemove", function (event) {
        // Move tooltip with mouse
        tooltip
          .style("left", `${event.pageX + 15}px`)
          .style("top", `${event.pageY}px`);
      })
      .on("mouseout", function () {
        // Hide tooltip and reset hexagon style
        tooltip.style("display", "none");
        d3.select(this).style("fill-opacity", 1);
      })
      .on("click", function (event, d) {
        // Handle click event - You can log or trigger a more complex interaction here
        console.log("Hexagon clicked", d);
        alert(`You clicked on a hexagon with ${d.length} data points.`);
      });

    // Add axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    chartGroup.append("g").attr("transform", `translate(0,${chartHeight})`).call(xAxis);
    chartGroup.append("g").call(yAxis);

    // X-axis label
    svg
      .append("text")
      .attr("transform", `translate(${(chartWidth + margin.left + margin.right) / 2},${height - 30})`)
      .style("text-anchor", "middle")
      .style("fill", "#808080") // Grey color for text
      .style("font-size", "14px") // Smaller font size
      .text("Days since last meeting with Academic Advisor");

    // Y-axis label
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 15)
      .attr("x", -(height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("fill", "#808080") // Grey color for text
      .style("font-size", "14px") // Smaller font size
      .text("Severity");
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: "100%" }}>
      {/* Title */}
      <Typography
        variant="h6"
        style={{
          fontWeight: 'bold',
          color: '#011F5B',
          fontSize: '1.25rem',
          marginLeft: '20px',
          marginBottom: '10px', // Ajout de la marge en bas
        }}
      >
        Student Care Alignment
      </Typography>

      {/* Graph container */}
      <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", padding: "20px", width: "100%" }}>
        <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
      </div>
    </div>
  );
};

export default HexbinHeatmap;