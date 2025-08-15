import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { postJSON } from "../utils/api";

const API_BASE = "https://staging.travelyatra.com/api/unsecure/dummy/hotels";

export const fetchHotels = createAsyncThunk(
  "hotels/fetchHotels",
  async ({ stay, occupancies, filters, destinationId }) => {
    const transformedOccupancies = occupancies.map(occ => {
      const transformed = {
        rooms: 1,
        adults: occ.adults || 2,
        children: occ.children || 0
      };
      
      if (occ.children > 0) {
        const childCount = Math.min(occ.children, 2);
        transformed.paxes = Array.from({ length: childCount }, (_, i) => ({
          type: "CH",
          age: occ.childAges?.[i] || 8
        }));
      }
      
      return transformed;
    });

    const body = {
      stay,
      occupancies: transformedOccupancies,
      extrafilter: {
        minRate: filters?.minPrice || 0,
        maxRate: filters?.maxPrice || 100000,
        minCategory: 1,
        maxCategory: 5
      },
      reviews: [],
      boards: {
        board: [],
        included: true
      }
    };

    if (filters?.rating) {
      const starCount = parseInt(filters.rating);
      body.extrafilter.minCategory = starCount;
      body.extrafilter.maxCategory = starCount;
    }

    if (filters?.segment) {
      body.segment = filters.segment;
    }

    if (filters?.accommodationType) {
      body.accommodationType = filters.accommodationType;
    }

    if (filters?.facilities?.length > 0) {
      body.facilities = filters.facilities;
    }

    return postJSON(`${API_BASE}`, body, destinationId);
  }
);

const initialState = {
  list: [],
  status: "idle",
  error: null,
  filters: {
    rating: null,
    segment: null,
    accommodationType: null,
    facilities: [],
    minPrice: 0,
    maxPrice: 100000
  },
  sort: null,
  nameQuery: "",
};

const hotelsSlice = createSlice({
  name: "hotels",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSort: (state, action) => {
      state.sort = action.payload;
    },
    setNameQuery: (state, action) => {
      state.nameQuery = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.sort = null;
      state.nameQuery = "";
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHotels.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (action.payload && action.payload.data && Array.isArray(action.payload.data)) {
          state.list = action.payload.data;
        } else if (Array.isArray(action.payload)) {
          state.list = action.payload;
        } else if (action.payload && typeof action.payload === 'object') {
          state.list = [action.payload];
        } else {
          state.list = [];
        }
        state.error = null;
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error?.message || "Failed to fetch hotels";
        state.list = [];
      });
  },
});

export const { setFilters, setSort, setNameQuery, clearError, resetFilters } = hotelsSlice.actions;
export default hotelsSlice.reducer;
