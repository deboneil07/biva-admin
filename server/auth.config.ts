import { user, session, account, verification } from "./db/auth-schema";
import { auth } from "./lib/auth";
console.log("Auth config loaded, provider =", { provider: "pg" });

console.log("Schema:", { user, session, account, verification }); // or wherever your BetterAuth config lives
export default auth;
