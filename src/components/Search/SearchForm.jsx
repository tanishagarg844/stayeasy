import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Hotel, Search, Calendar, Users } from "lucide-react";
import {
  Box,
  Paper,
  TextField,
  Button,
  IconButton,
  MenuItem,
  Popper,
  List,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material";
import { OccupancyEditor } from "../common/OccupancyEditor";
import useDebounced from "../../utils/hooks";
import { fetchDestinations } from "../../redux/destinationSlice";

export function SearchForm({ compact = false, initial, onSubmit }) {
console.log('initial :', initial);
  const dispatch = useDispatch();
  const destState = useSelector((s) => s.destinations);
  console.log('destState :', destState);

  const [destination, setDestination] = useState(initial?.destination || "");
  const [from, setFrom] = useState(initial?.from || "");
  const [to, setTo] = useState(initial?.to || "");
  const [occ, setOcc] = useState(
    initial?.occ || [{ rooms: 1, adults: 2, children: 0, paxes: [] }]
  );
  const [openSuggest, setOpenSuggest] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const debouncedDest = useDebounced(destination);

  useEffect(() => {
    dispatch(fetchDestinations({ query: debouncedDest || null }));
  }, [debouncedDest, dispatch]);

  const valid = destination && from && to;

  const submit = (e) => {
    e?.preventDefault();
    if (!valid) return;
    onSubmit?.({ destination, from, to, occ });
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
          borderColor: "warning.main",
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
            onChange={(e) => {
              setDestination(e.target.value);
              setOpenSuggest(true);
              setAnchorEl(e.currentTarget);
            }}
            onFocus={(e) => {
              setOpenSuggest(true);
              setAnchorEl(e.currentTarget);
            }}
            InputProps={{
              disableUnderline: true,
            }}
          />
          <Popper open={openSuggest && destState.items?.length > 0} anchorEl={anchorEl}>
            <Paper sx={{ width: anchorEl?.offsetWidth || 300, maxHeight: 250, overflow: "auto" }}>
              <List>
                {destState.items.map((d, i) => {
                  const name =
                    d?.name || d?.city || d?.destination || d?.label || JSON.stringify(d);
                  return (
                    <ListItemButton
                      key={i}
                      onClick={() => {
                        setDestination(name);
                        setOpenSuggest(false);
                      }}
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
            onChange={(e) => setFrom(e.target.value)}
            InputProps={{ disableUnderline: true }}
            sx={{ width: 140 }}
          />
          <Box mx={1}>—</Box>
          <TextField
            type="date"
            variant="standard"
            value={to}
            onChange={(e) => setTo(e.target.value)}
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
              {occ[0].adults} adults · {occ[0].children} children · {occ[0].rooms} rooms
            </summary>
            <Box mt={1}>
              <OccupancyEditor value={occ} onChange={setOcc} />
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
    </Paper>
  );
}
