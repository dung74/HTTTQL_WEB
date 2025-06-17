import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  LinearProgress,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

function TeamList() {
  const { role, token } = useAuth();
  const [teams, setTeams] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newTeam, setNewTeam] = useState({
    name: "",
    manager_id: "",
  });
  const [editTeam, setEditTeam] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL_API}/team?page=${page}&keyword=${searchText}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      setTeams(data.data);
      setPage(data.currentPage);
      setTotalItems(data.totalTeams);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };
  useEffect(() => {
    fetchTeams();
  }, [page, searchText]);

  const columns = [
    { field: "id", headerName: "ID", width: 90, sortable: false },
    { field: "name", headerName: "Sales Team", width: 250, sortable: false },
    { field: "manager", headerName: "Manager", width: 250, sortable: false },
    {
      field: "username",
      headerName: "Manager Username",
      width: 150,
      sortable: false,
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
          <IconButton onClick={() => handleDelete(params.row.id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  const [userInput, setUserInput] = useState("");
  const [userOptions, setUserOptions] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (userInput) {
        setLoadingUsers(true);

        fetch(
          `${process.env.REACT_APP_SERVER_URL_API}/auth/getAll?keyword=${userInput}`,
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
            setUserOptions(Array.isArray(data.data) ? data.data : []);
          })
          .catch((err) => console.error(err))
          .finally(() => setLoadingUsers(false));
      } else {
        setUserOptions([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [userInput]);

  const handleCreateTeam = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL_API}/team`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: newTeam.name,
            manager_id: newTeam.manager_id,
          }),
        }
      );

      if (response.ok) {
        fetchTeams();
        setOpenAdd(false);
        setNewTeam({ name: "", manager_id: "" });
      } else {
        alert("Failed to create team.");
      }
    } catch (error) {
      alert("An error occurred while creating the team.");
    }
  };

  const handleEdit = (team) => {
    setEditTeam(team);
    setNewTeam({
      name: team.name,
      manager_id: team.manager_id,
    });
    setOpenEdit(true);
  };

  const handleUpdateTeam = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL_API}/team/${editTeam.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: newTeam.name,
            manager_id: newTeam.manager_id,
          }),
        }
      );

      if (response.ok) {
        fetchTeams();
        setOpenEdit(false);
        setNewTeam({ name: "", manager_id: "" });
        setEditTeam(null);
      } else {
        alert("Failed to update team.");
      }
    } catch (error) {
      alert("An error occurred while updating the team.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this sales team?")) {
      try {
        const response = await fetch(`http://your-backend-api/teams/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          setTeams(teams.filter((team) => team.id !== id));
        } else {
          alert("Failed to delete team.");
        }
      } catch (error) {
        alert("An error occurred while deleting the team.");
      }
    }
  };

  return (
    <Box>
      <Box sx={{ pb: 2, height: 2 }}>
        {loading && <LinearProgress sx={{}} />}
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
          alignItems: "center",
        }}
      >
        <Typography variant="h5">Sales Team List</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <TextField
            label="Search Sales Teams"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            size="small"
          />
          <Button variant="contained" onClick={() => setOpenAdd(true)}>
            Create Sales Team
          </Button>
        </Box>
      </Box>
      <div style={{ height: 700, width: "100%" }}>
        <DataGrid
          rows={teams}
          columns={columns}
          paginationMode="server"
          rowCount={totalItems}
          initialState={{
            pagination: {
              rowCount: totalItems,
              paginationModel: {
                page: page - 1,
                pageSize: 10,
              },
            },
          }}
          disableColumnMenu
          onPaginationModelChange={(newModel) => {
            setLoading(true);
            setPage(newModel.page + 1); // cập nhật lại page
            // nếu muốn, cũng có thể xử lý pageSize tại đây
          }}
          pageSizeOptions={[10]}
          disableRowSelectionOnClick
        />
      </div>

      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} fullWidth>
        <DialogTitle>Create New Sales Team</DialogTitle>
        <DialogContent>
          <TextField
            label="Sales Team Name"
            fullWidth
            margin="normal"
            value={newTeam.name}
            onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
            required
          />
          <Autocomplete
            loading={loadingUsers}
            options={userOptions}
            getOptionLabel={(option) => option.fullname || ""} // hoặc `option` nếu là string
            onInputChange={(event, newInputValue) => {
              setUserInput(newInputValue);
            }}
            onChange={(event, newValue) => {
              setNewTeam({ ...newTeam, manager_id: newValue?.id || "" });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="User Name"
                fullWidth
                margin="normal"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingUsers ? <CircularProgress size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button onClick={handleCreateTeam} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth>
        <DialogTitle>Edit Sales Team</DialogTitle>
        <DialogContent>
          <TextField
            label="Sales Team Name"
            fullWidth
            margin="normal"
            value={newTeam.name}
            onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
            required
          />
          <Autocomplete
            loading={loadingUsers}
            options={userOptions}
            getOptionLabel={(option) => option.fullname || ""} // hoặc `option` nếu là string
            onInputChange={(event, newInputValue) => {
              setUserInput(newInputValue);
            }}
            onChange={(event, newValue) => {
              setNewTeam({ ...newTeam, manager_id: newValue?.id || "" });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="User Name"
                fullWidth
                margin="normal"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingUsers ? <CircularProgress size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button onClick={handleUpdateTeam} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TeamList;
