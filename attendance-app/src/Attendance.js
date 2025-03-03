import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

const Attendance = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    // Fetch the CSV file from the public directory
    fetch('/attendance.csv')
      .then(response => response.text())
      .then(csvData => {
        parseCSV(csvData);
      })
      .catch(error => console.error('Error fetching attendance.csv:', error));
  }, []);

  const parseCSV = (csvData) => {
    Papa.parse(csvData, {
      complete: (result) => {
        const studentNames = result.data.map(row => row['Ime_studenta']?.trim()).filter(name => name);
        setStudents(studentNames);  // Set the students in state
      },
      header: true, // Assuming the first row is the header
    });
  };

  return (
    <div>
      <h1>UGRADBENI RAČUNALNI SUSTAVI</h1>
      <h2>FESB - Računarstvo</h2>
      <h3>Prisutni studenti</h3>
      <ul>
        {students.length > 0 ? (
          students.map((student, index) => (
            <li key={index}>
              {student} <span role="img" aria-label="check"> ✅</span>
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
