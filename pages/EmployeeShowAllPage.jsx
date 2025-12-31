import React from "react";
import { Container } from "@mui/material";
import ShowEmployees from "../components/ShowEmployees";
import { fetchAllEmployees } from "../services/employeeShowAllService";

import { useEffect, useState } from "react";

const ShowAllEmployeesPage = () => {
  const [users, setEmployees] = useState([]);
  useEffect(() => {
    fetchAllEmployees()
      .then(setEmployees)
      .catch(() => setEmployees([]));
  }, []);
  return (
    <Container maxWidth="md" sx={{ mt: 3, mb: 3 }}>
      <ShowEmployees users={users} />
    </Container>
  );
};

export default ShowAllEmployeesPage;
