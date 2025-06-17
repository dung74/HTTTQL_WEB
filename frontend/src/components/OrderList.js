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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { format, set } from "date-fns";
import { useAuth } from "../context/AuthContext";

function OrderList() {
  const { role, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]); // Danh sách khách hàng để chọn
  const [totalItems, setTotalItems] = useState(0); // Tổng số đơn hàng
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1); // Trang hiện tại
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const [newOrder, setNewOrder] = useState({
    product_id: "",
    distributor_id: "",
    quantity: "",
    customer_id: "",
    newCustomer: {
      name: "",
      city: "",
      channel: "",
      sub_channel: "",
      country: "",
      latitude: "",
      longitude: "",
    },
  });
  const [editOrder, setEditOrder] = useState(null);
  const [searchText, setSearchText] = useState("");
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL_API}/order?page=${page}&keyword=${searchText}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      setTotalItems(data.totalItem);
      setOrders(data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };
  const fetchCustomers = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL_API}/customer`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      setCustomers(data.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };
  // search distributor
  const [distributorInput, setDistributorInput] = useState("");
  const [distributorOptions, setDistributorOptions] = useState([]);
  const [loadingDistributors, setLoadingDistributors] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (distributorInput) {
        setLoadingDistributors(true);

        fetch(
          `${process.env.REACT_APP_SERVER_URL_API}/distributor?keyword=${distributorInput}`,
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
            setDistributorOptions(Array.isArray(data.data) ? data.data : []);
          })
          .catch((err) => console.error(err))
          .finally(() => setLoadingDistributors(false));
      } else {
        setDistributorOptions([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [distributorInput]);

  //search product
  const [productOptions, setProductOptions] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productInput, setProductInput] = useState("");
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (productInput) {
        setLoadingProducts(true);

        fetch(
          `${process.env.REACT_APP_SERVER_URL_API}/product?keyword=${productInput}`,
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
            setProductOptions(Array.isArray(data.data) ? data.data : []);
          })
          .catch((err) => console.error(err))
          .finally(() => setLoadingProducts(false));
      } else {
        setProductOptions([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [productInput]);

  // Lấy danh sách đơn hàng và khách hàng từ backend
  useEffect(() => {
    fetchOrders();
    fetchCustomers();
  }, [token, page, searchText]);

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "product", headerName: "Product", width: 250 },
    { field: "distributor", headerName: "Distributor", width: 250 },
    { field: "quantity", headerName: "Quantity", width: 100 },
    { field: "customer", headerName: "Customer", width: 200 },
    { field: "createdAt", headerName: "Created At", width: 200 },
    // {
    //   field: "actions",
    //   headerName: "Actions",
    //   width: 150,
    //   renderCell: (params) => (
    //     <Box>
    //       <IconButton onClick={() => handleEdit(params.row)}>
    //         <EditIcon />
    //       </IconButton>
    //       <IconButton onClick={() => handleDelete(params.row.id)}>
    //         <DeleteIcon />
    //       </IconButton>
    //     </Box>
    //   ),
    // },
  ];

  const handleCreateOrder = async () => {
    const orderData = {
      product_id: newOrder.product_id,
      distributor_id: newOrder.distributor_id,
      quantity: Number(newOrder.quantity),
    };

    if (newOrder.customer_id) {
      orderData.customer_id = newOrder.customer_id;
    } else {
      orderData.newCustomer = newOrder.newCustomer;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL_API}/order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        fetchOrders();
        setOpenAdd(false);
        setNewOrder({
          product: "",
          distributor: "",
          quantity: "",
          customer_id: "",
          newCustomer: {
            name: "",
            city: "",
            channel: "",
            sub_channel: "",
            country: "",
            latitude: "",
            longitude: "",
          },
        });
      } else {
        alert("Failed to create order.");
      }
    } catch (error) {
      alert("An error occurred while creating the order.");
    }
  };

  // const handleEdit = (order) => {
  //   setEditOrder(order);
  //   setNewOrder({
  //     ...order,
  //     createdAt: new Date(order.createdAt),
  //     customer_id: order.customer_id || "",
  //   });
  //   setOpenEdit(true);
  // };

  // const handleUpdateOrder = async () => {
  //   const orderData = {
  //     product_id: newOrder.product,
  //     distributor_id: newOrder.distributor_id,
  //     quantity: Number(newOrder.quantity),
  //   };

  //   if (newOrder.customer_id) {
  //     orderData.customer_id = newOrder.customer_id;
  //   } else {
  //     orderData.newCustomer = newOrder.newCustomer;
  //   }

  //   try {
  //     const response = await fetch(
  //       `http://your-backend-api/orders/${editOrder.id}`,
  //       {
  //         method: "PUT",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //         body: JSON.stringify(orderData),
  //       }
  //     );

  //     if (response.ok) {
  //       setOrders(
  //         orders.map((ord) =>
  //           ord.id === editOrder.id ? { ...ord, ...orderData } : ord
  //         )
  //       );
  //       setOpenEdit(false);
  //       setNewOrder({
  //         product: "",
  //         distributor: "",
  //         quantity: "",
  //         customer_id: "",
  //         status: "Processing",
  //         createdAt: new Date(),
  //         newCustomer: {
  //           name: "",
  //           city: "",
  //           channel: "",
  //           sub_channel: "",
  //           country: "",
  //           latitude: "",
  //           longitude: "",
  //         },
  //       });
  //       setEditOrder(null);
  //     } else {
  //       alert("Failed to update order.");
  //     }
  //   } catch (error) {
  //     alert("An error occurred while updating the order.");
  //   }
  // };

  // const handleDelete = async (id) => {
  //   if (window.confirm("Are you sure you want to delete this order?")) {
  //     try {
  //       const response = await fetch(`http://your-backend-api/orders/${id}`, {
  //         method: "DELETE",
  //         headers: { Authorization: `Bearer ${token}` },
  //       });

  //       if (response.ok) {
  //         setOrders(orders.filter((order) => order.id !== id));
  //       } else {
  //         alert("Failed to delete order.");
  //       }
  //     } catch (error) {
  //       alert("An error occurred while deleting the order.");
  //     }
  //   }
  // };

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
        <Typography variant="h5">Order List</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <TextField
            label="Search Orders"
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
            Create Order
          </Button>
        </Box>
      </Box>
      <div style={{ height: 700, width: "100%" }}>
        <DataGrid
          rows={orders}
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

      {/* Dialog Create Order */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)}>
        <DialogTitle>Create New Order</DialogTitle>
        <DialogContent>
          <Autocomplete
            loading={loadingProducts}
            options={productOptions}
            getOptionLabel={(option) => option.name || ""} // hoặc `option` nếu là string
            onInputChange={(event, newInputValue) => {
              setProductInput(newInputValue);
            }}
            onChange={(event, newValue) => {
              setNewOrder({ ...newOrder, product_id: newValue?.id || "" });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Product Name"
                fullWidth
                margin="normal"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingProducts ? <CircularProgress size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
          <Autocomplete
            loading={loadingDistributors}
            options={distributorOptions}
            getOptionLabel={(option) => option.name || ""}
            onInputChange={(event, newInputValue) => {
              setDistributorInput(newInputValue);
            }}
            onChange={(event, newValue) => {
              setNewOrder({ ...newOrder, distributor_id: newValue?.id || "" });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Distributor"
                fullWidth
                margin="normal"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingDistributors ? (
                        <CircularProgress size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          <TextField
            label="Quantity"
            type="number"
            fullWidth
            margin="normal"
            value={newOrder.quantity}
            onChange={(e) =>
              setNewOrder({ ...newOrder, quantity: e.target.value })
            }
          />
          <FormControl fullWidth margin="normal">
            <InputLabel sx={{ backgroundColor: "white" }}>
              Customer (if existing)
            </InputLabel>
            <Select
              value={newOrder.customer_id}
              onChange={(e) =>
                setNewOrder({ ...newOrder, customer_id: e.target.value })
              }
            >
              <MenuItem value="">None</MenuItem>
              {customers?.map((customer) => (
                <MenuItem key={customer.id} value={customer.id}>
                  {customer.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {!newOrder.customer_id && (
            <>
              <Typography variant="h6" sx={{ mt: 2 }}>
                New Customer Information
              </Typography>
              <TextField
                label="Customer Name"
                fullWidth
                margin="normal"
                value={newOrder.newCustomer.name}
                onChange={(e) =>
                  setNewOrder({
                    ...newOrder,
                    newCustomer: {
                      ...newOrder.newCustomer,
                      name: e.target.value,
                    },
                  })
                }
              />
              <TextField
                label="City"
                fullWidth
                margin="normal"
                value={newOrder.newCustomer.city}
                onChange={(e) =>
                  setNewOrder({
                    ...newOrder,
                    newCustomer: {
                      ...newOrder.newCustomer,
                      city: e.target.value,
                    },
                  })
                }
              />
              <TextField
                label="Channel"
                fullWidth
                margin="normal"
                value={newOrder.newCustomer.channel}
                onChange={(e) =>
                  setNewOrder({
                    ...newOrder,
                    newCustomer: {
                      ...newOrder.newCustomer,
                      channel: e.target.value,
                    },
                  })
                }
              />
              <TextField
                label="Sub-channel"
                fullWidth
                margin="normal"
                value={newOrder.newCustomer.sub_channel}
                onChange={(e) =>
                  setNewOrder({
                    ...newOrder,
                    newCustomer: {
                      ...newOrder.newCustomer,
                      sub_channel: e.target.value,
                    },
                  })
                }
              />
              <TextField
                label="Country"
                fullWidth
                margin="normal"
                value={newOrder.newCustomer.country}
                onChange={(e) =>
                  setNewOrder({
                    ...newOrder,
                    newCustomer: {
                      ...newOrder.newCustomer,
                      country: e.target.value,
                    },
                  })
                }
              />
              <TextField
                label="Latitude"
                fullWidth
                margin="normal"
                value={newOrder.newCustomer.latitude}
                onChange={(e) =>
                  setNewOrder({
                    ...newOrder,
                    newCustomer: {
                      ...newOrder.newCustomer,
                      latitude: e.target.value,
                    },
                  })
                }
              />
              <TextField
                label="Longitude"
                fullWidth
                margin="normal"
                value={newOrder.newCustomer.longitude}
                onChange={(e) =>
                  setNewOrder({
                    ...newOrder,
                    newCustomer: {
                      ...newOrder.newCustomer,
                      longitude: e.target.value,
                    },
                  })
                }
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button onClick={handleCreateOrder} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Edit Order */}
      {/* <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
        <DialogTitle>Edit Order</DialogTitle>
        <DialogContent>
          <TextField
            label="Product Name"
            fullWidth
            margin="normal"
            value={newOrder.product}
            onChange={(e) =>
              setNewOrder({ ...newOrder, product: e.target.value })
            }
          />
          <TextField
            label="Distributor"
            fullWidth
            margin="normal"
            value={newOrder.distributor}
            onChange={(e) =>
              setNewOrder({ ...newOrder, distributor: e.target.value })
            }
          />
          <TextField
            label="Quantity"
            type="number"
            fullWidth
            margin="normal"
            value={newOrder.quantity}
            onChange={(e) =>
              setNewOrder({ ...newOrder, quantity: e.target.value })
            }
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Customer (if existing)</InputLabel>
            <Select
              value={newOrder.customer_id}
              onChange={(e) =>
                setNewOrder({ ...newOrder, customer_id: e.target.value })
              }
            >
              <MenuItem value="">None</MenuItem>
              {customers?.map((customer) => (
                <MenuItem key={customer.id} value={customer.id}>
                  {customer.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={newOrder.status}
              onChange={(e) =>
                setNewOrder({ ...newOrder, status: e.target.value })
              }
            >
              <MenuItem value="Processing">Processing</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Created At"
              value={newOrder.createdAt}
              onChange={(newValue) =>
                setNewOrder({ ...newOrder, createdAt: newValue })
              }
              renderInput={(params) => (
                <TextField {...params} fullWidth margin="normal" />
              )}
            />
          </LocalizationProvider>

          {!newOrder.customer_id && (
            <>
              <Typography variant="h6" sx={{ mt: 2 }}>
                New Customer Information
              </Typography>
              <TextField
                label="Customer Name"
                fullWidth
                margin="normal"
                value={newOrder.newCustomer.name}
                onChange={(e) =>
                  setNewOrder({
                    ...newOrder,
                    newCustomer: {
                      ...newOrder.newCustomer,
                      name: e.target.value,
                    },
                  })
                }
              />
              <TextField
                label="City"
                fullWidth
                margin="normal"
                value={newOrder.newCustomer.city}
                onChange={(e) =>
                  setNewOrder({
                    ...newOrder,
                    newCustomer: {
                      ...newOrder.newCustomer,
                      city: e.target.value,
                    },
                  })
                }
              />
              <TextField
                label="Channel"
                fullWidth
                margin="normal"
                value={newOrder.newCustomer.channel}
                onChange={(e) =>
                  setNewOrder({
                    ...newOrder,
                    newCustomer: {
                      ...newOrder.newCustomer,
                      channel: e.target.value,
                    },
                  })
                }
              />
              <TextField
                label="Sub-channel"
                fullWidth
                margin="normal"
                value={newOrder.newCustomer.sub_channel}
                onChange={(e) =>
                  setNewOrder({
                    ...newOrder,
                    newCustomer: {
                      ...newOrder.newCustomer,
                      sub_channel: e.target.value,
                    },
                  })
                }
              />
              <TextField
                label="Country"
                fullWidth
                margin="normal"
                value={newOrder.newCustomer.country}
                onChange={(e) =>
                  setNewOrder({
                    ...newOrder,
                    newCustomer: {
                      ...newOrder.newCustomer,
                      country: e.target.value,
                    },
                  })
                }
              />
              <TextField
                label="Latitude"
                fullWidth
                margin="normal"
                value={newOrder.newCustomer.latitude}
                onChange={(e) =>
                  setNewOrder({
                    ...newOrder,
                    newCustomer: {
                      ...newOrder.newCustomer,
                      latitude: e.target.value,
                    },
                  })
                }
              />
              <TextField
                label="Longitude"
                fullWidth
                margin="normal"
                value={newOrder.newCustomer.longitude}
                onChange={(e) =>
                  setNewOrder({
                    ...newOrder,
                    newCustomer: {
                      ...newOrder.newCustomer,
                      longitude: e.target.value,
                    },
                  })
                }
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button onClick={handleUpdateOrder} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog> */}
    </Box>
  );
}

export default OrderList;
