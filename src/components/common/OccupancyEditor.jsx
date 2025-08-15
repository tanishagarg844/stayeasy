import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Button,
  Divider,
  Popover,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

export function OccupancyEditor({ value, onChange }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  const updateRoom = (roomIndex, field, newValue) => {
    const updated = [...value];
    updated[roomIndex] = { ...updated[roomIndex], [field]: Number(newValue) };
    
    if (field === 'adults' && newValue < 1) {
      updated[roomIndex].adults = 1;
    }
    
    if (field === 'children' && newValue === 0) {
      updated[roomIndex].children = 0;
      updated[roomIndex].paxes = [];
    }
    
    onChange(updated);
  };

  const updateChildAge = (roomIndex, childIndex, age) => {
    const updated = [...value];
    if (!updated[roomIndex].paxes) {
      updated[roomIndex].paxes = [];
    }
    updated[roomIndex].paxes[childIndex] = { type: "CH", age: Number(age) };
    onChange(updated);
  };

  const addRoom = () => {
    const newRoom = { rooms: 1, adults: 2, children: 0, paxes: [] };
    onChange([...value, newRoom]);
  };

  const removeRoom = (roomIndex) => {
    if (value.length > 1) {
      const updated = value.filter((_, index) => index !== roomIndex);
      onChange(updated);
    }
  };

  const totalAdults = value.reduce((sum, room) => sum + (room.adults || 0), 0);
  const totalChildren = value.reduce((sum, room) => sum + (room.children || 0), 0);
  const totalRooms = value.length;

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
        {`${totalAdults} adults · ${totalChildren} children · ${totalRooms} room${totalRooms > 1 ? "s" : ""}`}
      </Button>

      {/* Popover for editing */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          sx: { p: 2, borderRadius: 2, minWidth: 350, maxHeight: 500, overflow: 'auto' },
        }}
      >
        <Box display="flex" flexDirection="column" gap={2}>
          <Typography variant="h6" sx={{ mb: 1 }}>Room Configuration</Typography>
          
          {value.map((room, roomIndex) => (
            <Box key={roomIndex} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="subtitle1" fontWeight="medium">
                  Room {roomIndex + 1}
                </Typography>
                {value.length > 1 && (
                  <IconButton 
                    size="small" 
                    onClick={() => removeRoom(roomIndex)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
              
              <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography sx={{ minWidth: 70 }}>Adults:</Typography>
                  <TextField
                    type="number"
                    size="small"
                    value={room.adults || 1}
                    onChange={(e) => updateRoom(roomIndex, "adults", e.target.value)}
                    inputProps={{ min: 1, max: 4 }}
                    sx={{ width: 80 }}
                  />
                </Box>
                
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography sx={{ minWidth: 70 }}>Children:</Typography>
                  <TextField
                    type="number"
                    size="small"
                    value={room.children || 0}
                    onChange={(e) => updateRoom(roomIndex, "children", e.target.value)}
                    inputProps={{ min: 0, max: 4 }}
                    sx={{ width: 80 }}
                  />
                </Box>
                
                {/* Child age inputs */}
                {room.children > 0 && (
                  <Box>
                    <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block' }}>
                      Child Ages:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {Array.from({ length: room.children }).map((_, childIndex) => (
                        <TextField
                          key={childIndex}
                          type="number"
                          size="small"
                          placeholder="Age"
                          value={room.paxes?.[childIndex]?.age || ""}
                          onChange={(e) => updateChildAge(roomIndex, childIndex, e.target.value)}
                          inputProps={{ min: 0, max: 17 }}
                          sx={{ width: 60 }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
              
              {roomIndex < value.length - 1 && <Divider sx={{ mt: 2 }} />}
            </Box>
          ))}
          
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addRoom}
            sx={{ mt: 1 }}
          >
            Add Room
          </Button>

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
