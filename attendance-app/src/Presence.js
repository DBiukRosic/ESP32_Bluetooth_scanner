import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

const Presence = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    // Load attendance data from 'attendance.csv'
    fetch('/attendance.csv')
      .then(response => response.text())
      .then(csvData => {
        parseAttendanceCSV(csvData);
      })
      .catch(error => console.error('Error fetching attendance.csv:', error));

    // Load presence data from 'presence.csv'
    fetch('/presence.csv')
      .then(response => response.text())
      .then(csvData => {
        parsePresenceCSV(csvData);
      })
      .catch(error => console.error('Error fetching presence.csv:', error));
  }, []);

  const parseAttendanceCSV = (csvData) => {
    Papa.parse(csvData, {
      complete: (result) => {
        const studentsList = result.data.map(row => row['Ime_studenta']?.trim()).filter(name => name);
        setStudents(studentsList);  // Set student names
      },
      header: true,
    });
  };

  const parsePresenceCSV = (csvData) => {
    Papa.parse(csvData, {
      complete: (result) => {
        const data = result.data.map(row => ({
          name: row[0].trim(), // Student name
          attendance: row[1].trim() // Attendance information (e.g., "12/13")
        }));
        setAttendanceData(data);
      },
      header: false,
    });
  };

  const getStudentAttendance = (name) => {
    const student = attendanceData.find(student => student.name === name);
    return student ? student.attendance : 'N/A';
  };

  return (
    <div>
      <h1>Prisutnost studenata</h1>
      <h2>FESB - Računarstvo</h2>
      <h3>Broj prisutnosti po studentu</h3>
      <ul>
        {students.length > 0 ? (
          students.map((student, index) => (
            <li key={index}>
              {student}: {getStudentAttendance(student)}
            </li>
          ))
        ) : (
          <p>No students found.</p>
        )}
      </ul>
    </div>
  );
};

export default Presence;
