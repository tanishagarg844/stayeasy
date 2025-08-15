import { configureStore } from "@reduxjs/toolkit";
import destinationsReducer from "./destinationSlice";
import hotelsReducer from "./hotelsSlice";

export const store = configureStore({
  reducer: {
    destinations: destinationsReducer,
    hotels: hotelsReducer,
  },
});
