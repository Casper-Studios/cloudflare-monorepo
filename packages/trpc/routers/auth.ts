import { baseProcedure, createTRPCRouter } from "../lib";

export const authRouter = createTRPCRouter({
  getUser: baseProcedure.query(async ({ ctx }) => {
    return {
      id: "1",
      name: "John Doe",
    };
  }),
});
