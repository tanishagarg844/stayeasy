import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Hotel, Search, Calendar, Users, AlertCircle } from "lucide-react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Popper,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Alert,
  FormHelperText,
} from "@mui/material";
import { OccupancyEditor } from "../common/OccupancyEditor";
import useDebounced from "../../utils/hooks";
import { fetchDestinations, setSelectedDestination } from "../../redux/destinationSlice";

export function SearchForm({ compact = false, initial, onSubmit }) {
  const dispatch = useDispatch();
  const destState = useSelector((s) => s.destinations);
  const selectedDestination = useSelector((s) => s.destinations.selected);

  const [destination, setDestination] = useState(initial?.destination || "");
  const [from, setFrom] = useState(initial?.from || "");
  const [to, setTo] = useState(initial?.to || "");
  const [occ, setOcc] = useState(
    initial?.occ || [{ rooms: 1, adults: 2, children: 0, paxes: [] }]
  );
  const [openSuggest, setOpenSuggest] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const debouncedDest = useDebounced(destination);

  useEffect(() => {
    if (debouncedDest !== null) {
      dispatch(fetchDestinations({ query: debouncedDest || null }));
    }
  }, [debouncedDest, dispatch]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!destination.trim()) {
      newErrors.destination = "Destination is required";
    }
    
    if (!from) {
      newErrors.from = "Check-in date is required";
    }
    
    if (!to) {
      newErrors.to = "Check-out date is required";
    }
    
    if (from && to && new Date(from) >= new Date(to)) {
      newErrors.to = "Check-out date must be after check-in date";
    }
    
    if (from && new Date(from) < new Date().toISOString().split('T')[0]) {
      newErrors.from = "Check-in date cannot be in the past";
    }
    
    if (occ.length === 0) {
      newErrors.occupancy = "At least one room configuration is required";
    } else {
      occ.forEach((room, index) => {
        if (room.adults < 1) {
          newErrors.occupancy = "Each room must have at least 1 adult";
        }
        if (room.children > 0 && (!room.paxes || room.paxes.length !== room.children)) {
          newErrors.occupancy = "Please specify ages for all children";
        }
      });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateForm();
  };

  const valid = destination.trim() && from && to && Object.keys(errors).length === 0;

  const submit = (e) => {
    e?.preventDefault();
    if (validateForm()) {
      const searchData = {
        destination: destination.trim(),
        destinationId: selectedDestination?.id || selectedDestination?.destinationId || null,
        from, 
        to, 
        occ 
      };
      
      onSubmit?.(searchData);
    }
  };

  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getMinCheckoutDate = () => {
    return from || getMinDate();
  };

  const handleDestinationSelect = (dest) => {
    const destName = dest.name || dest.city || dest.destination || dest.label || JSON.stringify(dest);
    setDestination(destName);
    dispatch(setSelectedDestination(dest));
    setOpenSuggest(false);
    if (errors.destination) {
      setErrors(prev => ({ ...prev, destination: undefined }));
    }
  };

  const handleDestinationChange = (e) => {
    const value = e.target.value;
    setDestination(value);
    setOpenSuggest(true);
    setAnchorEl(e.currentTarget);
    
    if (selectedDestination && value !== (selectedDestination.name || selectedDestination.city || selectedDestination.destination || selectedDestination.label)) {
      dispatch(setSelectedDestination(null));
    }
    
    if (errors.destination) {
      setErrors(prev => ({ ...prev, destination: undefined }));
    }
  };

  return (
    <Paper elevation={4} sx={{ p: 2, borderRadius: 3 }}>
      <Box
        component="form"
        onSubmit={submit}
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 1,
          border: "2px solid",
          borderColor: Object.keys(errors).length > 0 ? "error.main" : "warning.main",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {/* Destination */}
        <Box sx={{ flex: 1, position: "relative", display: "flex", alignItems: "center", p: 1 }}>
          <Hotel size={18} style={{ marginRight: 8, color: "#666" }} />
          <TextField
            variant="standard"
            placeholder="Search city / area"
            value={destination}
            fullWidth
            error={touched.destination && !!errors.destination}
            onChange={handleDestinationChange}
            onFocus={(e) => {
              setOpenSuggest(true);
              setAnchorEl(e.currentTarget);
            }}
            onBlur={() => handleBlur('destination')}
            InputProps={{
              disableUnderline: true,
            }}
          />
          {touched.destination && errors.destination && (
            <FormHelperText error sx={{ position: 'absolute', bottom: -20, left: 0 }}>
              {errors.destination}
            </FormHelperText>
          )}
          <Popper open={openSuggest && destState.items?.length > 0} anchorEl={anchorEl}>
            <Paper sx={{ width: anchorEl?.offsetWidth || 300, maxHeight: 250, overflow: "auto" }}>
              <List>
                {destState.items.map((d, i) => {
                  const name =
                    d?.name || d?.city || d?.destination || d?.label || JSON.stringify(d);
                  return (
                    <ListItemButton
                      key={i}
                      onClick={() => handleDestinationSelect(d)}
                    >
                      <ListItemText primary={name} />
                    </ListItemButton>
                  );
                })}
              </List>
            </Paper>
          </Popper>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" } }} />

        {/* Dates */}
        <Box sx={{ display: "flex", alignItems: "center", p: 1 }}>
          <Calendar size={18} style={{ marginRight: 8, color: "#666" }} />
          <TextField
            type="date"
            variant="standard"
            value={from}
            error={touched.from && !!errors.from}
            onChange={(e) => {
              setFrom(e.target.value);
              if (errors.from) {
                setErrors(prev => ({ ...prev, from: undefined }));
              }
              if (errors.to && to && new Date(e.target.value) < new Date(to)) {
                setErrors(prev => ({ ...prev, to: undefined }));
              }
            }}
            onBlur={() => handleBlur('from')}
            inputProps={{ 
              min: getMinDate(),
              max: to || undefined 
            }}
            InputProps={{ disableUnderline: true }}
            sx={{ width: 140 }}
          />
          <Box mx={1}>—</Box>
          <TextField
            type="date"
            variant="standard"
            value={to}
            error={touched.to && !!errors.to}
            onChange={(e) => {
              setTo(e.target.value);
              if (errors.to) {
                setErrors(prev => ({ ...prev, to: undefined }));
              }
            }}
            onBlur={() => handleBlur('to')}
            inputProps={{ 
              min: getMinCheckoutDate() 
            }}
            InputProps={{ disableUnderline: true }}
            sx={{ width: 140 }}
          />
        </Box>

        <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" } }} />

        {/* Occupancy */}
        <Box sx={{ display: "flex", alignItems: "center", p: 1 }}>
          <Users size={18} style={{ marginRight: 8, color: "#666" }} />
          <details>
            <summary style={{ cursor: "pointer", userSelect: "none" }}>
              {occ[0].adults} adults · {occ[0].children} children · {occ.length} rooms
            </summary>
            <Box mt={1}>
              <OccupancyEditor value={occ} onChange={setOcc} />
              {touched.occupancy && errors.occupancy && (
                <FormHelperText error sx={{ mt: 1 }}>
                  {errors.occupancy}
                </FormHelperText>
              )}
            </Box>
          </details>
        </Box>

        {/* Submit */}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={!valid}
          startIcon={<Search size={16} />}
          sx={{
            borderRadius: { xs: 0, md: "0 8px 8px 0" },
            px: 3,
            py: 1.5,
          }}
        >
          Search
        </Button>
      </Box>
      
      {/* Show validation errors summary */}
      {Object.keys(errors).length > 0 && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <AlertCircle size={16} />
          Please fix the errors above to continue
        </Alert>
      )}
    </Paper>
  );
}
