import { Patient } from "../../../types";

interface PatientTableProps {
  patients: Patient[];
}

export function PatientTable({ patients }: PatientTableProps) {
  if (patients.length === 0) {
    return <div>No patients found.</div>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Gender</th>
          <th>Phone</th>
        </tr>
      </thead>
      <tbody>
        {patients.map((patient) => (
          <tr key={patient.id}>
            <td>
              {patient.firstName} {patient.lastName}
            </td>
            <td>{patient.gender}</td>
            <td>{patient.phone}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
