const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middlewares/authMiddleware");
const {
  sendFollowRequest,
  getPendingRequests,
  respondToRequest,
  getFollowers,
  getFollowing,
  toggleFollow,
} = require("./follow.controller");

router.use(authenticate);

router.post("/request", sendFollowRequest);
router.post("/toggle", toggleFollow);
router.get("/requests/pending", getPendingRequests);
router.put("/request/:id", respondToRequest);
router.get("/followers", getFollowers);
router.get("/following", getFollowing);

module.exports = router;
