import { Cashfree, CFEnvironment } from "cashfree-pg";
import dotenv from "dotenv";

dotenv.config();

const createCashfreeClient = () => {
  const client = new Cashfree(
    process.env.CASHFREE_ENV === "PRODUCTION" ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX,
    process.env.CASHFREE_APP_ID || "",
    process.env.CASHFREE_SECRET_KEY || ""
  );

  return client;
};

const cashfreeClient = createCashfreeClient();

export { createCashfreeClient };
export default cashfreeClient;
