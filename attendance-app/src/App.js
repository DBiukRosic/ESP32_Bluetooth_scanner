import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import './App.css';
import './style.css';

const Attendance = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null); // Track selected student

  useEffect(() => {
    // Fetch the CSV file from the public directory
    fetch('/attendance.csv')
      .then(response => response.text())
      .then(csvData => {
        parseCSV(csvData);
      })
      .catch(error => console.error('Error fetching CSV:', error));
  }, []);

  const parseCSV = (csvData) => {
    Papa.parse(csvData, {
      complete: (result) => {
        console.log("Parsed CSV:", result);  // Log parsed CSV to verify the data
        
        // Map student names to timestamps
        const studentsWithTimestamps = result.data.map(row => ({
          name: row['Ime_studenta']?.trim(),
          timestamp: row['Timestamp']
        })).filter(student => student.name && student.timestamp);

        console.log("Students with Timestamps:", studentsWithTimestamps);
        setStudents(studentsWithTimestamps); // Set the students with timestamps
      },
      header: true, // Assuming the first row is the header
    });
  };

  const handleStudentClick = (student) => {
    // Toggle dropdown visibility for the selected student
    if (selectedStudent && selectedStudent.name === student.name) {
      setSelectedStudent(null); // Close dropdown if the same student is clicked
    } else {
      setSelectedStudent(student); // Show dropdown for the clicked student
    }
  };

  return (
    <div>
      <h1>UGRADBENI RAČUNALNI SUSTAVI</h1>
      <h2>FESB - Računarstvo</h2>
      <h3>Prisutni studenti</h3>
      <ul>
        {students.length > 0 ? (
          students.map((student, index) => (
            <li key={index} onClick={() => handleStudentClick(student)}>
              {student.name} <span role="img" aria-label="check"> ✅</span>

              {/* Dropdown content */}
              {selectedStudent && selectedStudent.name === student.name && (
                <div className="dropdown-content">
                  <p><strong>Logged:</strong> {student.timestamp}</p>
                </div>
              )}
            </li>
          ))
        ) : (
          <p>No students found.</p>
        )}
      </ul>
    </div>
  );
};

export default Attendance;
