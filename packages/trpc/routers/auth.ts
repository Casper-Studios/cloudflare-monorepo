import { publicProcedure, createTRPCRouter } from "../lib";

export const authRouter = createTRPCRouter({
  getUser: publicProcedure.query(async ({ ctx }) => {
    return {
      id: "1",
      name: "John Doe",
    };
  }),
});
