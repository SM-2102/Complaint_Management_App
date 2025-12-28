import React from "react";
import { Container } from "@mui/material";
import ShowEmployees from "../components/ShowEmployees";
import { fetchStandardEmployees } from "../services/employeeShowStandardService";
import { useEffect, useState } from "react";

const ShowStandardEmployeesPage = () => {
  const [users, setEmployees] = useState([]);
  useEffect(() => {
    fetchStandardEmployees()
      .then(setEmployees)
      .catch(() => setEmployees([]));
  }, []);
  return (
    <Container maxWidth="md" sx={{ mt: 3, mb: 3 }}>
      <ShowEmployees users={users} />
    </Container>
  );
};

export default ShowStandardEmployeesPage;
