import { rotateSalt } from "../salt";

rotateSalt()
  .then(() => {
    console.log("Salt rotated successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error rotating salt:", err);
    process.exit(1);
  });