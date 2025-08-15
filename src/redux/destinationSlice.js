import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE, postJSON } from "../utils/api";

export const fetchDestinations = createAsyncThunk(
  "destinations/fetch",
  async ({ query }) => {
    const body = query
      ? {
          paginationFilterRequest: { paginationAction: "INITIAL_PAGE", maxLimit: 10, sortingOrder: "ASC" },
          search: query,
          fetchStaticDestination: false,
        }
      : {
          paginationFilterRequest: { paginationAction: "INITIAL_PAGE", maxLimit: 10, sortingOrder: "ASC" },
          search: null,
          fetchStaticDestination: true,
        };
    return postJSON(`${API_BASE}/places`, body);
  }
);

const destinationsSlice = createSlice({
  name: "destinations",
  initialState: { 
    items: [], 
    status: "idle", 
    error: null,
    selected: null 
  },
  reducers: {
    setSelectedDestination: (state, action) => {
      state.selected = action.payload;
    },
    clearSelectedDestination: (state) => {
      state.selected = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDestinations.pending, (state) => { state.status = "loading"; })
      .addCase(fetchDestinations.fulfilled, (state, action) => {
        state.status = "succeeded";
        const raw = action.payload;
        state.items = Array.isArray(raw?.data) ? raw.data : raw?.destinations || raw || [];
      })
      .addCase(fetchDestinations.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { setSelectedDestination, clearSelectedDestination } = destinationsSlice.actions;
export default destinationsSlice.reducer;
