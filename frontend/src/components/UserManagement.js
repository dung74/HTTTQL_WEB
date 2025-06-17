import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  CircularProgress,
  TextField,
  Autocomplete,
} from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";

function UserManagement() {
  const { role, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [openEdit, setOpenEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    role: "",
    team_id: "",
    fullname: "",
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL_API}/auth/getAll`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      setUsers(data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, [role, token]);

  const [teamInput, setTeamInput] = useState("");
  const [teamOptions, setTeamOptions] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (teamInput) {
        setLoadingTeams(true);

        fetch(
          `${process.env.REACT_APP_SERVER_URL_API}/team?keyword=${teamInput}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        )
          .then((res) => {
            if (!res.ok) throw new Error("Network error");
            return res.json();
          })
          .then((data) => {
            setTeamOptions(Array.isArray(data.data) ? data.data : []);
          })
          .catch((err) => console.error(err))
          .finally(() => setLoadingTeams(false));
      } else {
        setTeamOptions([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [teamInput]);

  const columns = [
    { field: "id", headerName: "ID", width: 90, sortable: false },
    { field: "username", headerName: "Username", width: 150, sortable: false },
    { field: "fullname", headerName: "Full Name", width: 200, sortable: false },
    { field: "role", headerName: "Role", width: 120, sortable: false },
    {
      field: "team",
      headerName: "Team",
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          {params.value ? params.value.name || params.value : "Chưa có team"}
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => handleEdit(params.row)}>
            <EditIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  const handleEdit = (user) => {
    setSelectedUser(user);
    setNewUser({
      role: user.role,
      team_id: user.team_id,
      fullname: user.fullname,
    });
    setOpenEdit(true);
  };

  const handleUpdateUser = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL_API}/auth/${selectedUser.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            role: newUser.role,
            team_id: newUser.team_id,
            fullname: newUser.fullname,
          }),
        }
      );

      if (response.ok) {
        fetchUsers();
        setOpenEdit(false);
        setSelectedUser(null);
        setNewUser({
          role: "",
          team_id: "",
          fullname: "",
        });
      } else {
        alert("Failed to update role.");
      }
    } catch (error) {
      alert("An error occurred while updating the role.");
    }
  };

  return (
    <Box>
      <Box sx={{ pb: 2, height: 2 }}>
        {loading && <LinearProgress sx={{}} />}
      </Box>
      <Typography variant="h5" gutterBottom>
        User Management
      </Typography>
      <div style={{ height: 700, width: "100%" }}>
        <DataGrid
          rows={users}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          disableSelectionOnClick
          disableColumnMenu
        />
      </div>

      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth>
        <DialogTitle>Edit User Role</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Editing role for: {selectedUser?.username}
          </Typography>
          <TextField
            label="Full Name"
            fullWidth
            margin="normal"
            value={newUser.fullname}
            onChange={(e) =>
              setNewUser({ ...newUser, fullname: e.target.value })
            }
            required
          />
          <TextField
            label="Role"
            fullWidth
            margin="normal"
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            required
          />
          <Autocomplete
            loading={loadingTeams}
            options={teamOptions}
            getOptionLabel={(option) => option.name || ""} // hoặc `option` nếu là string
            onInputChange={(event, newInputValue) => {
              setTeamInput(newInputValue);
            }}
            onChange={(event, newValue) => {
              setNewUser({
                ...newUser,
                team_id: newValue.id,
                fullname: newValue.fullname,
                role: newValue.role,
              });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Team"
                fullWidth
                margin="normal"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingTeams ? <CircularProgress size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
          {/* <FormControl fullWidth margin="normal">
            <InputLabel sx={{ backgroundColor: "white" }}>Role</InputLabel>
            <Select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl> */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button onClick={handleUpdateUser} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UserManagement;
