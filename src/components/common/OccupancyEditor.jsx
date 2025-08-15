import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Popover,
  Button,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";

export function OccupancyEditor({ value, onChange }) {
  const occ = value[0] || { rooms: 1, adults: 2, children: 0 };
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const updateField = (field, newValue) => {
    const updated = [{ ...occ, [field]: Number(newValue) }];
    onChange(updated);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      {/* Trigger Button */}
      <Button
        variant="text"
        onClick={handleClick}
        startIcon={<PeopleIcon />}
        sx={{
          textTransform: "none",
          color: "inherit",
          fontWeight: 500,
        }}
      >
        {`${occ.adults} adults · ${occ.children} children · ${occ.rooms} room${occ.rooms > 1 ? "s" : ""}`}
      </Button>

      {/* Popover for editing */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          sx: { p: 2, borderRadius: 2, minWidth: 250 },
        }}
      >
        <Box display="flex" flexDirection="column" gap={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography sx={{ minWidth: 70 }}>Rooms:</Typography>
            <TextField
              type="number"
              size="small"
              value={occ.rooms}
              onChange={(e) => updateField("rooms", e.target.value)}
              inputProps={{ min: 1 }}
              sx={{ width: 80 }}
            />
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography sx={{ minWidth: 70 }}>Adults:</Typography>
            <TextField
              type="number"
              size="small"
              value={occ.adults}
              onChange={(e) => updateField("adults", e.target.value)}
              inputProps={{ min: 1 }}
              sx={{ width: 80 }}
            />
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography sx={{ minWidth: 70 }}>Children:</Typography>
            <TextField
              type="number"
              size="small"
              value={occ.children}
              onChange={(e) => updateField("children", e.target.value)}
              inputProps={{ min: 0 }}
              sx={{ width: 80 }}
            />
          </Box>

          <Button
            variant="contained"
            color="primary"
            onClick={handleClose}
            sx={{ mt: 1 }}
          >
            Done
          </Button>
        </Box>
      </Popover>
    </>
  );
}
