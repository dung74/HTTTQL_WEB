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

function ProductList() {
  const { role, token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    klass: "",
    stock: "",
    price: "",
  });
  const [editProduct, setEditProduct] = useState(null);
  const [searchText, setSearchText] = useState("");

  const fetchProducts = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL_API}/product?page=${page}&keyword=${searchText}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      setTotalItems(data.totalItem);
      setProducts(data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [token, page, searchText]);

  const columns = [
    {
      field: "id",
      headerName: "ID",
      width: 90,
      sortable: false,
    },
    { field: "name", headerName: "Product Name", width: 200, sortable: false },
    {
      field: "class",
      headerName: "Product Class",
      width: 150,
      sortable: false,
    },
    {
      field: "stock",
      headerName: "Stock Quantity",
      width: 150,
      sortable: false,
    },
    {
      field: "price",
      headerName: "Price",
      width: 110,
      sortable: false,
      // valueFormatter: ({ value }) =>
      //   value != null && !isNaN(value) ? Number(value).toLocaleString() : "N/A",
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

  // const filteredProducts = products.filter(
  //   (product) =>
  //     product.name.toLowerCase().includes(searchText.toLowerCase()) ||
  //     product.class.toLowerCase().includes(searchText.toLowerCase())
  // );

  const handleAddProduct = async () => {
    const price = newProduct.price ? Number(newProduct.price) : 0;
    const quantity = newProduct.quantity ? Number(newProduct.quantity) : 0;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL_API}/product`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...newProduct, price, quantity }),
        }
      );

      if (response.ok) {
        alert("Product added successfully.");
        fetchProducts();
        setOpenAdd(false);
        setNewProduct({ name: "", klass: "", stock: "", price: "" });
      } else {
        alert("Failed to add product.");
      }
    } catch (error) {
      alert("An error occurred while adding the product.");
    }
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setNewProduct({
      name: product.name,
      class: product.class,
      stock: product.stock,
      price: product.price,
    });
    setOpenEdit(true);
  };

  const handleUpdateProduct = async () => {
    const price = newProduct.price ? Number(newProduct.price) : 0;
    const quantity = newProduct.quantity ? Number(newProduct.quantity) : 0;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL_API}/product?id=${editProduct.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...newProduct, price, quantity }),
        }
      );

      if (response.ok) {
        fetchProducts();
        alert("Product updated successfully.");
        setOpenEdit(false);
        setNewProduct({ name: "", class: "", quantity: "", price: "" });
        setEditProduct(null);
      } else {
        alert("Failed to update product.");
      }
    } catch (error) {
      alert("An error occurred while updating the product.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_URL_API}/product?id=${id}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          alert("Product deleted successfully.");
          fetchProducts();
        } else {
          alert("Failed to delete product.");
        }
      } catch (error) {
        alert("An error occurred while deleting the product.");
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
        <Typography variant="h5">Product List</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <TextField
            label="Search Products"
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
          {
            <Button variant="contained" onClick={() => setOpenAdd(true)}>
              Add Product
            </Button>
          }
        </Box>
      </Box>
      <div style={{ height: 700, width: "100%" }}>
        <DataGrid
          rows={products}
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

      <Dialog open={openAdd} onClose={() => setOpenAdd(false)}>
        <DialogTitle>Add New Product</DialogTitle>
        <DialogContent>
          <TextField
            label="Product Name"
            fullWidth
            margin="normal"
            value={newProduct.name}
            onChange={(e) =>
              setNewProduct({ ...newProduct, name: e.target.value })
            }
            required
          />
          <TextField
            label="Product Class"
            fullWidth
            margin="normal"
            value={newProduct.class}
            onChange={(e) =>
              setNewProduct({ ...newProduct, class: e.target.value })
            }
            required
          />
          <TextField
            label="Stock Quantity"
            type="number"
            fullWidth
            margin="normal"
            value={newProduct.quantity}
            onChange={(e) =>
              setNewProduct({ ...newProduct, stock: e.target.value })
            }
            required
            inputProps={{ min: 0 }}
          />
          <TextField
            label="Price"
            type="number"
            fullWidth
            margin="normal"
            value={newProduct.price}
            onChange={(e) =>
              setNewProduct({ ...newProduct, price: e.target.value })
            }
            required
            inputProps={{ min: 0 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button onClick={handleAddProduct} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent>
          <TextField
            label="Product Name"
            fullWidth
            margin="normal"
            value={newProduct.name}
            onChange={(e) =>
              setNewProduct({ ...newProduct, name: e.target.value })
            }
            required
          />
          <TextField
            label="Product Class"
            fullWidth
            margin="normal"
            value={newProduct.class}
            onChange={(e) =>
              setNewProduct({ ...newProduct, class: e.target.value })
            }
            required
          />
          <TextField
            label="Stock Quantity"
            type="number"
            fullWidth
            margin="normal"
            value={newProduct.stock}
            onChange={(e) =>
              setNewProduct({ ...newProduct, stock: e.target.value })
            }
            required
            inputProps={{ min: 0 }}
          />
          <TextField
            label="Price"
            type="number"
            fullWidth
            margin="normal"
            value={newProduct.price}
            onChange={(e) =>
              setNewProduct({ ...newProduct, price: e.target.value })
            }
            required
            inputProps={{ min: 0 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button onClick={handleUpdateProduct} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ProductList;
