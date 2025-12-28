import React from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
} from "@mui/material";

const roleLabels = {
  ADMIN: "Administrator",
  USER: "Standard User",
  TECHNICIAN: "Technician",
};

const ShowEmployees = ({
  users = [],
  title = "List of Registered Employees",
}) => {
  return (
    <Paper
      elevation={5}
      sx={{
        p: 3,
        borderRadius: 4,
        background: "#f8fafc",
        maxWidth: 500,
        mx: "auto",
      }}
    >
      <Typography
        variant="h5"
        fontWeight={700}
        mb={2}
        align="center"
        color="primary.dark"
      >
        {title}
      </Typography>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="subtitle1" color="text.secondary">
          Total Employees: <b>{users.length}</b>
        </Typography>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: "#e3eafc" }}>
              <TableCell sx={{ fontWeight: 700, fontSize: 16 }}>Name</TableCell>

              {/* Centered Header */}
              <TableCell
                sx={{ fontWeight: 700, fontSize: 16, textAlign: "center" }}
              >
                Role
              </TableCell>

              {/* Centered Header */}
              <TableCell
                sx={{ fontWeight: 700, fontSize: 16, textAlign: "center" }}
              >
                Phone Number
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {users.map((u, idx) => (
              <TableRow
                key={u.username}
                sx={{ background: idx % 2 === 0 ? "#f4f8ff" : "#fff" }}
              >
                <TableCell sx={{ fontWeight: 600 }}>{u.name}</TableCell>

                {/* Role aligned normally */}
                <TableCell sx={{ textAlign: "center" }}>
                  {roleLabels[u.role] || u.role}
                </TableCell>
                {/* Phone Number centered */}
                <TableCell sx={{ textAlign: "center" }}>
                  {u.phone_number}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ShowEmployees;
