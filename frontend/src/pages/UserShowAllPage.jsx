import React from "react";
import { Container } from "@mui/material";
import ShowUsers from "../components/ShowUsers";
import { fetchAllUsers } from "../services/userShowAllService";

import { useEffect, useState } from "react";

const ShowAllUsersPage = () => {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    fetchAllUsers()
      .then(setUsers)
      .catch(() => setUsers([]));
  }, []);
  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 3 }}>
      <ShowUsers users={users} />
    </Container>
  );
};

export default ShowAllUsersPage;
