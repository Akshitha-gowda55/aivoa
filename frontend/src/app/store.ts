import { configureStore } from "@reduxjs/toolkit";
import deviationWorkflowReducer from "@/features/deviations/deviationSlice";

export const store = configureStore({
  reducer: {
    deviationWorkflow: deviationWorkflowReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
