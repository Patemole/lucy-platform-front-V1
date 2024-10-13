import React from 'react';
import ReactFlow, { Background, Node, Edge, Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import CourseRectangle from './CourseRectangle'; // Import the CourseRectangle component

// Interface for the course data
interface Course {
  id: string;
  title: string;
  semester: string;
  credit: number;
  work: number;
  quality: number;
  difficulty: number;
  prerequisites?: string[];
}

// Component to display a course with CourseRectangle inside a React Flow node
const CourseNode: React.FC<{ data: Course }> = ({ data }) => {
  return (
    <div
      style={{
        textAlign: 'center',
        position: 'relative',
      }}
    >
      {/* CourseRectangle component for each node */}
      <CourseRectangle
        title={data.title}
        semester={data.semester}
        credit={data.credit}
        prerequisites={data.prerequisites}
        work={data.work}
        quality={data.quality}
        difficulty={data.difficulty}
      />
      {/* Handles to connect nodes in ReactFlow */}
      <Handle type="source" position={Position.Right} style={{ background: '#25C35E' }} />
      <Handle type="target" position={Position.Left} style={{ background: '#25C35E' }} />
    </div>
  );
};

// Main component to display courses in React Flow with additional spacing and margins
const CourseProgression: React.FC = () => {
  const coursesData: Course[] = [
    {
      id: '1',
      title: 'CIS 101 - Introduction to Programming',
      semester: 'Fall',
      credit: 1,
      work: 2.5,
      quality: 3.5,
      difficulty: 2.0,
    },
    {
      id: '2',
      title: 'CIS 121 - Data Structures and Algorithms',
      semester: 'Fall',
      credit: 1,
      work: 3.0,
      quality: 4.0,
      difficulty: 3.5,
      prerequisites: ['CIS 101'],
    },
    {
      id: '3',
      title: 'MATH 1000 - Discrete Mathematics',
      semester: 'Fall',
      credit: 1,
      work: 3.0,
      quality: 3.0,
      difficulty: 2.5,
    },
    {
      id: '4',
      title: 'MATH 101 - Calculus I',
      semester: 'Fall',
      credit: 1,
      work: 4.0,
      quality: 4.5,
      difficulty: 4.0,
    },
    {
      id: '5',
      title: 'CIS 3451 - Applied Machine Learning',
      semester: 'Spring',
      credit: 1,
      work: 2.9,
      quality: 3.8,
      difficulty: 2.8,
      prerequisites: ['MATH 3210', 'CIS 3210'],
    },
    {
      id: '6',
      title: 'MATH 2100 - Advanced Calculus',
      semester: 'Spring',
      credit: 1,
      work: 4.0,
      quality: 4.5,
      difficulty: 4.2,
      prerequisites: ['MATH 1000', 'MATH 101'],
    },
    {
      id: '7',
      title: 'CIS 201 - Computer Architecture',
      semester: 'Spring',
      credit: 1,
      work: 3.5,
      quality: 4.0,
      difficulty: 3.5,
    },
    {
      id: '8',
      title: 'CIS 301 - Operating Systems',
      semester: 'Fall/Spring',
      credit: 1,
      work: 3.8,
      quality: 4.5,
      difficulty: 4.0,
      prerequisites: ['CIS 201'],
    },
    {
      id: '9',
      title: 'CIS 400 - Capstone Project',
      semester: 'Fall/Spring',
      credit: 1,
      work: 4.5,
      quality: 5.0,
      difficulty: 4.8,
      prerequisites: ['CIS 301'],
    },
  ];

  // Creating nodes based on the semester
  const nodes: Node[] = [];
  let yPosBySemester: { [key: string]: number } = {
    'Fall': 100,
    'Spring': 100,
    'Fall/Spring': 100,
  };

  coursesData.forEach((course, index) => {
    const xPos = course.semester === 'Fall' ? 100 :
                 course.semester === 'Spring' ? 500 :
                 900; // Adjusting X position based on the semester

    nodes.push({
      id: course.id,
      type: 'courseNode',
      position: { x: xPos, y: yPosBySemester[course.semester] },
      data: course,
    });

    yPosBySemester[course.semester] += 200; // Add margin between nodes in the same semester
  });

  // Creating edges based on prerequisites
  const edges: Edge[] = [];
  coursesData.forEach((course) => {
    if (course.prerequisites) {
      course.prerequisites.forEach((prereq) => {
        const prereqCourse = coursesData.find((c) => c.title.includes(prereq));
        if (prereqCourse) {
          edges.push({
            id: `e-${course.id}-${prereqCourse.id}`,
            source: prereqCourse.id,
            target: course.id,
            animated: true,
            style: { stroke: '#A0A0A0' }, // Adding grey edges
          });
        }
      });
    }
  });

  const nodeTypes = { courseNode: CourseNode }; // Define custom node type

  return (
    <div style={{ height: '800px', width: '100%', overflowX: 'auto', backgroundColor: '#FFFFFF' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        style={{ backgroundColor: '#FFFFFF' }}
        // Target the watermark to hide it or make it small
        defaultEdgeOptions={{ labelStyle: { display: 'none' } }}
      >
        {/* Style the watermark to be very small */}
        <style>
          {`
            .react-flow__attribution {
              font-size: 0.01rem;
              opacity: 0.1;
            }
          `}
        </style>
        <Background />
      </ReactFlow>
    </div>
  );
};

export default CourseProgression;





















/*
import React from 'react';
import ReactFlow, { Background, Controls, Node, Edge, Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';

// Définir l'interface des données d'un cours
interface Course {
  id: string;
  title: string;
  semester: string;
  credit: number;
  work: number;
  quality: number;
  difficulty: number;
  prerequisites?: string[];
}

// Composant pour afficher un cours avec ses données dans un nœud React Flow
const CourseNode: React.FC<{ data: Course }> = ({ data }) => {
  return (
    <div
      style={{
        backgroundColor: '#FCFCFC',
        border: '1px solid #BCBCBC',
        padding: '16px',
        borderRadius: '8px',
        width: '260px',
        textAlign: 'center',
        position: 'relative',
      }}
    >
      <p style={{ fontWeight: 'bold', fontSize: '1rem', color: '#011F5B', marginBottom: '12px' }}>
        {data.title}
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '0.75rem', backgroundColor: '#FFD9BF', color: '#F97315', padding: '4px', borderRadius: '4px' }}>
          {data.semester}
        </span>
        <span style={{ fontSize: '0.75rem', backgroundColor: '#D6EAF7', color: '#011F5B', padding: '4px', borderRadius: '4px' }}>
          {data.credit} CU
        </span>
      </div>

      {/* Cercles de données *
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ textAlign: 'center', width: '60px' }}>
          <div style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Work</div>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#3155CC' }}>{data.work}</div>
        </div>
        <div style={{ textAlign: 'center', width: '60px' }}>
          <div style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Quality</div>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#3155CC' }}>{data.quality}</div>
        </div>
        <div style={{ textAlign: 'center', width: '60px' }}>
          <div style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Difficulty</div>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#3155CC' }}>{data.difficulty}</div>
        </div>
      </div>

      {data.prerequisites && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
          {data.prerequisites.map((prereq, index) => (
            <span key={index} style={{ fontSize: '0.75rem', backgroundColor: '#FEEAEA', color: '#EF4361', padding: '4px', borderRadius: '4px' }}>
              {prereq}
            </span>
          ))}
        </div>
      )}

      {/* Handles pour connecter les nœuds *
      <Handle type="source" position={Position.Right} style={{ background: '#25C35E' }} />
      <Handle type="target" position={Position.Left} style={{ background: '#25C35E' }} />
    </div>
  );
};

// Composant principal pour afficher les cours dans React Flow
const CourseProgression: React.FC = () => {
  const coursesData: Course[] = [
    {
      id: '1',
      title: 'CIS 101 - Introduction to Programming',
      semester: 'Fall',
      credit: 1,
      work: 2.5,
      quality: 3.5,
      difficulty: 2.0,
    },
    {
      id: '2',
      title: 'CIS 121 - Data Structures and Algorithms',
      semester: 'Spring',
      credit: 1,
      work: 3.0,
      quality: 4.0,
      difficulty: 3.5,
      prerequisites: ['CIS 101'],
    },
    {
      id: '3',
      title: 'CIS 3451 - Applied Machine Learning',
      semester: 'Fall',
      credit: 1,
      work: 2.9,
      quality: 3.8,
      difficulty: 2.8,
      prerequisites: ['MATH 3210', 'CIS 3210'],
    },
    {
      id: '4',
      title: 'MATH 2100 - Advanced Calculus',
      semester: 'Spring',
      credit: 1,
      work: 4.0,
      quality: 4.5,
      difficulty: 4.2,
      prerequisites: ['MATH 1000'],
    },
  ];

  // Convertir les données en nœuds pour React Flow avec un positionnement fixe
  const nodes: Node[] = [
    {
      id: '1',
      type: 'courseNode',
      position: { x: 100, y: 100 },
      data: coursesData[0],
    },
    {
      id: '2',
      type: 'courseNode',
      position: { x: 400, y: 100 },
      data: coursesData[1],
    },
    {
      id: '3',
      type: 'courseNode',
      position: { x: 700, y: 100 },
      data: coursesData[2],
    },
    {
      id: '4',
      type: 'courseNode',
      position: { x: 1000, y: 100 },
      data: coursesData[3],
    },
  ];

  // Créer des arêtes basées sur les prérequis
  const edges: Edge[] = [];
  coursesData.forEach((course) => {
    if (course.prerequisites) {
      course.prerequisites.forEach((prereq) => {
        const prereqCourse = coursesData.find((c) => c.title.includes(prereq));
        if (prereqCourse) {
          edges.push({
            id: `e-${course.id}-${prereqCourse.id}`,
            source: prereqCourse.id,
            target: course.id,
            animated: true,
            style: { stroke: '#25C35E' },
          });
        }
      });
    }
  });

  const nodeTypes = { courseNode: CourseNode };

  return (
    <div style={{ height: '600px', width: '100%', overflowX: 'auto' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        style={{ backgroundColor: '#f0f0f0' }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default CourseProgression;
*/
















/*
import React from 'react';
import { Box, Typography } from '@mui/material';
import logo_greg from '../student_face.png'; // Adjust the path as necessary

const CourseMap = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        height: '600px', // Define the height for the component
        width: '600px', // Define the width for the component
        backgroundColor: '#FFFFFF', // Optional background color
      }}
    >
      {/* Central Avatar *
      <Box
        sx={{
          position: 'absolute',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          backgroundImage: `url(${logo_greg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 10,
        }}
      />

      {/* First Circle (inner, smaller and closer) *
      <Box
        sx={{
          position: 'absolute',
          borderRadius: '50%',
          width: '280px',
          height: '280px',
          border: '1px dashed #25C35E', // Updated border color
          zIndex: 1,
        }}
      />

      {/* Second Circle (middle) *
      <Box
        sx={{
          position: 'absolute',
          borderRadius: '50%',
          width: '420px',
          height: '420px',
          border: '1px dashed #000', // Black dashed border
          zIndex: 0,
        }}
      />

      {/* Third Circle (outer, lighter and bigger) *
      <Box
        sx={{
          position: 'absolute',
          borderRadius: '50%',
          width: '620px',
          height: '620px',
          border: '1px dashed #D3D3D3', // Light grey dashed border
          zIndex: 0,
        }}
      />

      {/* First Circle (Courses) *
      <Box sx={{ position: 'absolute', top: '5%', left: '50%' }}>
        <Box sx={{ backgroundColor: '#F3F4F6', border: '1px solid #25C35E', padding: '8px', borderRadius: '6px' }}>
          <Typography variant="body2" color="#25C35E">CIS 1230</Typography>
        </Box>
      </Box>
      <Box sx={{ position: 'absolute', top: '45%', left: '30%' }}>
        <Box sx={{ backgroundColor: '#F3F4F6', border: '1px solid #25C35E', padding: '8px', borderRadius: '6px' }}>
          <Typography variant="body2" color="#25C35E">MATH 2100</Typography>
        </Box>
      </Box>
      <Box sx={{ position: 'absolute', top: '50%', left: '70%' }}>
        <Box sx={{ backgroundColor: '#F3F4F6', border: '1px solid #25C35E', padding: '8px', borderRadius: '6px' }}>
          <Typography variant="body2" color="#25C35E">CIS 2330</Typography>
        </Box>
      </Box>
      <Box sx={{ position: 'absolute', top: '65%', left: '50%' }}>
        <Box sx={{ backgroundColor: '#F3F4F6', border: '1px solid #25C35E', padding: '8px', borderRadius: '6px' }}>
          <Typography variant="body2" color="#25C35E">CIS 1010</Typography>
        </Box>
      </Box>
      <Box sx={{ position: 'absolute', top: '75%', left: '30%' }}>
        <Box sx={{ backgroundColor: '#F3F4F6', border: '1px solid #25C35E', padding: '8px', borderRadius: '6px' }}>
          <Typography variant="body2" color="#25C35E">CIS 1951</Typography>
        </Box>
      </Box>

      {/* Second Circle Courses *
      <Box sx={{ position: 'absolute', top: '20%', left: '5%' }}>
        <Box sx={{ backgroundColor: '#F3F4F6', border: '1px solid #1E88E5', padding: '8px', borderRadius: '6px' }}>
          <Typography variant="body2" color="#1E88E5">CIS 1951</Typography>
        </Box>
      </Box>
      <Box sx={{ position: 'absolute', top: '60%', left: '75%' }}>
        <Box sx={{ backgroundColor: '#F3F4F6', border: '1px solid #1E88E5', padding: '8px', borderRadius: '6px' }}>
          <Typography variant="body2" color="#1E88E5">CIS 2330</Typography>
        </Box>
      </Box>

      {/* Legend *
      <Box
        sx={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Validated *
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <Box sx={{ width: '20px', height: '20px', backgroundColor: '#25C35E', mr: 1 }} />
          <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Validated</Typography>
        </Box>

        {/* Planning *
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <Box sx={{ width: '20px', height: '20px', backgroundColor: '#1E88E5', mr: 1 }} />
          <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Planning</Typography>
        </Box>

        {/* Recommendation *
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: '20px', height: '20px', backgroundColor: '#757575', mr: 1 }} />
          <Typography variant="body2" sx={{ fontWeight: '500', fontSize: '0.875rem' }}>Recommendation</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default CourseMap;
*/


