// HexbinHeatmap.tsx
import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { hexbin as d3Hexbin } from "d3-hexbin";
import { Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Interface for data points including new information
interface DataPoint {
  x: number;
  y: number;
  severity: number;
  firstName: string;
  lastName: string;
  lastMeetingDate: string;
  lastServiceName: string;
}

// Interface for hexagons with a unique name
interface HexbinWithName {
  bin: DataPoint[];
  x: number;
  y: number;
  name: string;
}

const HexbinHeatmap: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Lists of first names and last names for random generation
    const firstNames = [
      "Emma", "Liam", "Olivia", "Noah", "Ava",
      "William", "Sophia", "James", "Isabella", "Oliver",
      "Mia", "Benjamin", "Charlotte", "Elijah", "Amelia",
      "Lucas", "Harper", "Mason", "Evelyn", "Logan"
    ];

    const lastNames = [
      "Smith", "Johnson", "Williams", "Brown", "Jones",
      "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
      "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
      "Thomas", "Taylor", "Moore", "Jackson", "Martin"
    ];

    // Service name options
    const serviceNames = [
      'Financial Services',
      'Academic Advising',
      'Mental Health Services'
    ];

    // Functions to get random first name, last name, and service name
    const getRandomFirstName = () => {
      return firstNames[Math.floor(Math.random() * firstNames.length)];
    };

    const getRandomLastName = () => {
      return lastNames[Math.floor(Math.random() * lastNames.length)];
    };

    const getRandomServiceName = () => {
      return serviceNames[Math.floor(Math.random() * serviceNames.length)];
    };

    // Retrieve userID from localStorage
    const storedUser = localStorage.getItem('userID');
    let userID: string | null = null;

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        userID = parsedUser.uid || storedUser;
      } catch (error) {
        userID = storedUser;
      }
    }

    if (!userID) {
      console.error('No userID found in localStorage');
      return;
    }

    // Define dimensions and margins
    const svgElement = svgRef.current;
    if (!svgElement) {
      console.error('SVG element not found');
      return;
    }

    const boundingRect = svgElement.getBoundingClientRect();
    const width = boundingRect.width || 700;
    const height = 450;
    const margin = { top: 20, right: 30, bottom: 70, left: 70 };

    // Clear existing content in SVG
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Make SVG responsive
    svg.attr("viewBox", `0 0 ${width} ${height}`)
       .attr("preserveAspectRatio", "xMidYMid meet");

    // Group for the chart with margins
    const chartGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Define scales
    const xScale = d3.scaleLinear().domain([0, 100]).range([0, chartWidth]);
    const yScale = d3.scaleLinear().domain([0, 100]).range([chartHeight, 0]);

    // Generate random data with new information
    const data: DataPoint[] = d3.range(1000).map(() => {
      const xValue = Math.random() * 100;
      const yValue = Math.random() * 100;
      const severity = Math.ceil((yValue / 100) * 5);
      const firstName = getRandomFirstName();
      const lastName = getRandomLastName();

      // Calculate the last meeting date
      const daysSinceLastMeeting = xValue;
      const lastMeetingDate = new Date();
      lastMeetingDate.setDate(lastMeetingDate.getDate() - Math.floor(daysSinceLastMeeting));
      const formattedLastMeetingDate = lastMeetingDate.toLocaleDateString();

      // Get a random service name
      const lastServiceName = getRandomServiceName();

      return {
        x: xValue,
        y: yValue,
        severity,
        firstName,
        lastName,
        lastMeetingDate: formattedLastMeetingDate,
        lastServiceName
      };
    });

    // Hexbin generator
    const hexRadius = 9;
    const hexbin = d3Hexbin<DataPoint>()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .radius(hexRadius)
      .extent([[0, 0], [chartWidth, chartHeight]]);

    // Generate hexbin data
    const hexbinData = hexbin(data);

    // Assign unique names to each hexagon
    const hexbinDataWithName: HexbinWithName[] = hexbinData.map(bin => ({
      bin,
      x: bin.x,
      y: bin.y,
      name: `${getRandomFirstName()} ${getRandomLastName()}`
    }));

    // Color scale based on severity
    const severityColors: { [key: number]: string } = {
      1: '#9CD5AD',
      2: '#80C092',
      3: '#E0AF48',
      4: '#F38C28',
      5: '#F1311B',
    };

    const colorScale = d3.scaleOrdinal<number, string>()
      .domain([1, 2, 3, 4, 5])
      .range([
        severityColors[1],
        severityColors[2],
        severityColors[3],
        severityColors[4],
        severityColors[5],
      ]);

    // Create a tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "#f9f9f9")
      .style("border", "1px solid #d3d3d3")
      .style("padding", "10px")
      .style("border-radius", "5px")
      .style("pointer-events", "none")
      .style("display", "none");

    // Draw hexagons
    chartGroup.append("g")
      .selectAll(".hexagon")
      .data(hexbinDataWithName)
      .enter()
      .append("path")
      .attr("class", "hexagon")
      .attr("d", hexbin.hexagon())
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .style("fill", d => {
        const meanSeverity = Math.round(d3.mean(d.bin, p => p.severity)!);
        return colorScale(meanSeverity);
      })
      .style("stroke", "white")
      .style("stroke-width", 0.5)
      // Event handlers for hover and click
      .on("mouseover", function(event, d) {
        // Calculate the mean y value for Risk Score
        const meanY = Math.round(d3.mean(d.bin, p => p.y)!);

        // Retrieve information from the first data point in the hexagon
        const lastMeetingDate = d.bin[0].lastMeetingDate;
        const lastServiceName = d.bin[0].lastServiceName;

        const nameHtml = `<strong>Name:</strong> ${d.name}`;

        tooltip
          .style("display", "block")
          .html(
            `${nameHtml}<br/>
             <strong>Risk Score:</strong> ${meanY}<br/>
             <strong>Last meeting:</strong> ${lastMeetingDate}<br/>
             <strong>Last service meet:</strong> ${lastServiceName}<br/>`
          )
          .style("left", `${event.pageX + 15}px`)
          .style("top", `${event.pageY}px`);

        d3.select(this).style("fill-opacity", 0.7);
      })
      .on("mousemove", function(event) {
        tooltip
          .style("left", `${event.pageX + 15}px`)
          .style("top", `${event.pageY}px`);
      })
      .on("mouseout", function() {
        tooltip.style("display", "none");
        d3.select(this).style("fill-opacity", 1);
      })
      .on("click", function(event, d) {
        if (userID) {
          navigate(`/dashboard/academic-advisor/student_profile/${userID}`, { state: { name: d.name } });
        } else {
          console.error('Cannot navigate: userID missing');
        }
      });

    // Add axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    chartGroup.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(xAxis);

    chartGroup.append("g")
      .call(yAxis);

    // X-axis label
    svg.append("text")
      .attr("x", margin.left + chartWidth / 2)
      .attr("y", height - 30)
      .attr("text-anchor", "middle")
      .style("fill", "#808080")
      .style("font-size", "14px")
      .text("Days since last meeting with Academic Advisor");

    // Y-axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", - (margin.top + chartHeight / 2))
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .style("fill", "#808080")
      .style("font-size", "14px")
      .text("Risk Score");

    // Cleanup function to remove the tooltip when the component unmounts
    return () => {
      tooltip.remove();
    };

  }, [navigate]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: "100%" }}>
      {/* Title */}
      <Typography
        variant="h6"
        style={{
          fontWeight: 'bold',
          color: '#011F5B',
          fontSize: '1.25rem',
          marginTop: '10px',
          marginLeft: '20px',
          marginBottom: '10px',
        }}
      >
        Student Care Alignment
      </Typography>

      {/* Chart container */}
      <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", padding: "20px", width: "100%" }}>
        <svg ref={svgRef} style={{ width: '100%', height: '450px' }}></svg>
      </div>
    </div>
  );
};

export default HexbinHeatmap;





/*
import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { hexbin as d3Hexbin } from "d3-hexbin";
import { Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Étendre l'interface DataPoint pour inclure les noms
interface DataPoint {
  x: number;
  y: number;
  severity: number;
  firstName: string;
  lastName: string;
}

// Définir un type pour les hexagones avec un nom unique
interface HexbinWithName {
  bin: DataPoint[];
  x: number;
  y: number;
  name: string;
}

const HexbinHeatmap: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Listes de prénoms et de noms pour la génération aléatoire
    const firstNames = [
      "Emma", "Liam", "Olivia", "Noah", "Ava",
      "William", "Sophia", "James", "Isabella", "Oliver",
      "Mia", "Benjamin", "Charlotte", "Elijah", "Amelia",
      "Lucas", "Harper", "Mason", "Evelyn", "Logan"
    ];

    const lastNames = [
      "Smith", "Johnson", "Williams", "Brown", "Jones",
      "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
      "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
      "Thomas", "Taylor", "Moore", "Jackson", "Martin"
    ];

    // Fonctions pour obtenir un prénom et un nom aléatoires
    const getRandomFirstName = () => {
      return firstNames[Math.floor(Math.random() * firstNames.length)];
    };

    const getRandomLastName = () => {
      return lastNames[Math.floor(Math.random() * lastNames.length)];
    };

    // Récupérer le userID depuis localStorage
    const storedUser = localStorage.getItem('userID');
    let userID: string | null = null;

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        userID = parsedUser.uid || storedUser; // Si c'est un objet avec uid, sinon utiliser la chaîne directement
      } catch (error) {
        // Si ce n'est pas un JSON valide, considérer que c'est directement l'uid
        userID = storedUser;
      }
    }

    if (!userID) {
      console.error('Aucun userID trouvé dans localStorage');
      // Vous pouvez choisir de gérer ce cas différemment, par exemple en affichant un message à l'utilisateur
      return;
    }

    // Définir les dimensions et marges
    const svgElement = svgRef.current;
    if (!svgElement) {
      console.error('Élément SVG non trouvé');
      return;
    }

    // Utiliser getBoundingClientRect pour obtenir la largeur actuelle de l'élément SVG
    const boundingRect = svgElement.getBoundingClientRect();
    const width = boundingRect.width || 700; // Utiliser 700 par défaut si la largeur est indéfinie
    const height = 450;
    const margin = { top: 20, right: 30, bottom: 70, left: 70 };

    // Supprimer tout contenu existant dans le SVG
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Définir la vue pour rendre le SVG responsive
    svg.attr("viewBox", `0 0 ${width} ${height}`)
       .attr("preserveAspectRatio", "xMidYMid meet");

    // Créer un groupe pour le graphique avec les marges
    const chartGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Définir les échelles
    const xScale = d3.scaleLinear().domain([0, 100]).range([0, chartWidth]);
    const yScale = d3.scaleLinear().domain([0, 100]).range([chartHeight, 0]);

    // Générer des données aléatoires avec noms et prénoms
    const data: DataPoint[] = d3.range(1000).map(() => {
      const xValue = Math.random() * 100;
      const yValue = Math.random() * 100;
      const severity = Math.ceil((yValue / 100) * 5);
      const firstName = getRandomFirstName();
      const lastName = getRandomLastName();
      return { x: xValue, y: yValue, severity, firstName, lastName };
    });

    // Générateur de hexagones
    const hexRadius = 9;
    const hexbin = d3Hexbin<DataPoint>()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .radius(hexRadius)
      .extent([[0, 0], [chartWidth, chartHeight]]);

    // Générer les données de hexagones
    const hexbinData = hexbin(data);

    // Générer des noms uniques pour chaque hexagone
    const hexbinDataWithName: HexbinWithName[] = hexbinData.map(bin => ({
      bin,
      x: bin.x,
      y: bin.y,
      name: `${getRandomFirstName()} ${getRandomLastName()}`
    }));

    // Échelle de couleurs
    const severityColors: { [key: number]: string } = {
      1: '#9CD5AD',
      2: '#80C092',
      3: '#E0AF48',
      4: '#F38C28',
      5: '#F1311B',
    };

    const colorScale = d3.scaleOrdinal<number, string>()
      .domain([1, 2, 3, 4, 5])
      .range([
        severityColors[1],
        severityColors[2],
        severityColors[3],
        severityColors[4],
        severityColors[5],
      ]);

    // Créer un tooltip
    const tooltip = d3.select("body").append("div")
      .style("position", "absolute")
      .style("background", "#f9f9f9")
      .style("border", "1px solid #d3d3d3")
      .style("padding", "10px")
      .style("border-radius", "5px")
      .style("pointer-events", "none")
      .style("display", "none");

    // Dessiner les hexagones
    chartGroup.append("g")
      .selectAll(".hexagon")
      .data(hexbinDataWithName)
      .enter()
      .append("path")
      .attr("class", "hexagon")
      .attr("d", hexbin.hexagon())
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .style("fill", d => {
        const meanSeverity = Math.round(d3.mean(d.bin, p => p.severity)!);
        return colorScale(meanSeverity);
      })
      .style("stroke", "white")
      .style("stroke-width", 0.5)
      // Gestionnaires d'événements pour le survol et le clic
      .on("mouseover", function(event, d) {
        const meanSeverity = Math.round(d3.mean(d.bin, p => p.severity)!);

        // Générer le HTML pour le nom
        const nameHtml = `<strong>Name:</strong> ${d.name}`;

        tooltip
          .style("display", "block")
          .html(
            `${nameHtml}<br/>
             <strong>Attrition rate:</strong> ${meanSeverity}<br/>
             <strong>Data Points:</strong> ${d.bin.length}`
          )
          .style("left", `${event.pageX + 15}px`)
          .style("top", `${event.pageY}px`);

        d3.select(this).style("fill-opacity", 0.7);
      })
      .on("mousemove", function(event) {
        tooltip
          .style("left", `${event.pageX + 15}px`)
          .style("top", `${event.pageY}px`);
      })
      .on("mouseout", function() {
        tooltip.style("display", "none");
        d3.select(this).style("fill-opacity", 1);
      })
      .on("click", function() {
        if (userID) {
          navigate(`/dashboard/academic-advisor/student_profile/${userID}`);
        } else {
          console.error('Impossible de naviguer : userID manquant');
        }
      });

    // Ajouter les axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    chartGroup.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(xAxis);

    chartGroup.append("g")
      .call(yAxis);

    // Label de l'axe X
    svg.append("text")
      .attr("x", margin.left + chartWidth / 2)
      .attr("y", height - 30)
      .attr("text-anchor", "middle")
      .style("fill", "#808080")
      .style("font-size", "14px")
      .text("Days since last meeting with Academic Advisor");

    // Label de l'axe Y
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", - (margin.top + chartHeight / 2))
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .style("fill", "#808080")
      .style("font-size", "14px")
      .text("Severity");

    // Fonction de nettoyage pour retirer le tooltip lors du démontage du composant
    return () => {
      tooltip.remove();
    };

  }, [navigate]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: "100%" }}>
      {/* Titre *
      <Typography
        variant="h6"
        style={{
          fontWeight: 'bold',
          color: '#011F5B',
          fontSize: '1.25rem',
          marginTop: '10px',
          marginLeft: '20px',
          marginBottom: '10px',
        }}
      >
        Student Care Alignment
      </Typography>

      {/* Conteneur du graphique *
      <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", padding: "20px", width: "100%" }}>
        <svg ref={svgRef} style={{ width: '100%', height: '450px' }}></svg>
      </div>
    </div>
  );
};

export default HexbinHeatmap;
*/