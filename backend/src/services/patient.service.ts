import { patients } from "../data/patient.data.js";
import { Patient } from "../models/patient.js";

export function findAllPatients(): Patient[] {
  return patients;
}
