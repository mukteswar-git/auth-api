import app from "./app.js";
import redis from "./redis.js";

await redis.connect();

app.listen(3000, () => {
  console.log("Server running");
});
