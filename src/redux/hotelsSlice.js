import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE, postJSON } from "../utils/api";

export const fetchHotels = createAsyncThunk(
  "hotels/fetch",
  async ({ stay, occupancies, filters }) => {
    const body = { stay, occupancies, ...filters };
    return postJSON(`${API_BASE}`, body);
  }
);

const hotelsSlice = createSlice({
  name: "hotels",
  initialState: {
    list: [],
    status: "idle",
    error: null,
    selected: null,
    sort: "",
    nameQuery: "",
    filters: {
      extrafilter: { minRate: 0, maxRate: 100000, minCategory: 1, maxCategory: 5 },
      reviews: [],
      boards: { board: [], included: true },
    },
  },
  reducers: {
    setSelected: (state, action) => { state.selected = action.payload; },
    setSort: (state, action) => { state.sort = action.payload; },
    setNameQuery: (state, action) => { state.nameQuery = action.payload; },
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHotels.pending, (state) => { state.status = "loading"; })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.status = "succeeded";
        const hotels = action.payload?.hotels || action.payload?.data || [];
        state.list = Array.isArray(hotels) ? hotels : [];
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { setSelected, setSort, setNameQuery, setFilters } = hotelsSlice.actions;
export default hotelsSlice.reducer;
