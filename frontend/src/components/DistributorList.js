import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Button,
  TextField,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  InputAdornment,
  IconButton,
  LinearProgress,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

function DistributorList() {
  const { role, token } = useAuth();
  const [distributors, setDistributors] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [newDistributor, setNewDistributor] = useState({
    name: "",
  });
  console.log(newDistributor);
  const [editDistributor, setEditDistributor] = useState(null);
  const [searchText, setSearchText] = useState("");

  const fetchDistributors = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL_API}/distributor?page=${page}&keyword=${searchText}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (!data?.error) {
        setDistributors(data.data);
        setTotalItems(data.totalItems);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching distributors:", error);
    }
  };

  useEffect(() => {
    fetchDistributors();
  }, [token, page, searchText]);

  const columns = [
    { field: "id", headerName: "ID", width: 90, sortable: false },
    {
      field: "name",
      headerName: "Distributor Name",
      width: 700,
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

  const handleAddDistributor = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL_API}/distributor`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: newDistributor.name }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        fetchDistributors();
        setOpenAdd(false);
        setNewDistributor({
          name: "",
        });
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("An error occurred while adding the distributor.");
    }
  };

  const handleEdit = (distributor) => {
    setEditDistributor(distributor);
    setNewDistributor({
      name: distributor.name,
    });
    setOpenEdit(true);
  };

  const handleUpdateDistributor = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL_API}/distributor`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: editDistributor.id,
            name: newDistributor.name,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        fetchDistributors();
        setOpenEdit(false);
        setNewDistributor({
          name: "",
        });
        setEditDistributor(null);
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("An error occurred while updating the distributor.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this distributor?")) {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_URL_API}/distributor?id=${id}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();
        if (response.ok) {
          alert(data.message);
          fetchDistributors();
        } else {
          alert(data.message);
        }
      } catch (error) {
        alert("An error occurred while deleting the distributor.");
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
        <Typography variant="h5">Distributor List</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <TextField
            label="Search Distributors"
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
            Add Distributor
          </Button>
        </Box>
      </Box>
      <div style={{ height: 700, width: "100%" }}>
        <DataGrid
          rows={distributors}
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
        <DialogTitle>New Distributor</DialogTitle>
        <DialogContent>
          <TextField
            label="Distributor Name"
            fullWidth
            margin="normal"
            value={newDistributor.name}
            onChange={(e) =>
              setNewDistributor({ ...newDistributor, name: e.target.value })
            }
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button onClick={handleAddDistributor} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth>
        <DialogTitle>Edit Distributor</DialogTitle>
        <DialogContent>
          <TextField
            label="Distributor Name"
            fullWidth
            margin="normal"
            value={newDistributor.name}
            onChange={(e) =>
              setNewDistributor({ ...newDistributor, name: e.target.value })
            }
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button onClick={handleUpdateDistributor} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DistributorList;
