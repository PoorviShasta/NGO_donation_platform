const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();


const requireLogin = require("./middleware/auth");

const app = express();
const cookieParser = require("cookie-parser");
const User = require("./models/user");
app.use("/uploads", express.static("public/uploads"));

// Middleware
app.use(express.urlencoded({ extended: true })); // for form data
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use("/campaigns", require("./routes/campaignRoutes"));
app.use("/uploads", express.static("uploads"));
// EJS Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));

// Page Routes
app.get("/", (req, res) => res.render("login"));
app.get("/register", (req, res) => res.render("register"));
const Campaign = require("./models/Campaign");

app.get("/dashboard", requireLogin, async (req, res) => {
  try {
    await Campaign.updateMany(
      {
        isCompleted: false,
        $expr: { $gte: ["$raisedAmount", "$goalAmount"] }
      },
      {
        $set: { isCompleted: true }
      }
    );

    const query = req.user.role === "ngo" ? { createdBy: req.user.id } : {};
    const campaigns = await Campaign.find(query).sort({ createdAt: -1 });

    const activeCampaigns = campaigns.filter((campaign) => !campaign.isCompleted);
    const completedCampaigns = campaigns.filter((campaign) => campaign.isCompleted);

    const user = await User.findById(req.user.id);

    res.render("dashboard", { user, activeCampaigns, completedCampaigns });

  } catch (err) {
    res.send(err.message);
  }
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

app.get("/organization/:id", async (req, res) => {
  try {
    const organization = await User.findById(req.params.id);
    res.render("organizationProfile", { organization });
  } catch (err) {
    res.send(err.message);
  }
});

app.get("/organization/:id/work", async (req, res) => {
  try {
    const organization = await User.findById(req.params.id);
    // pull all campaigns for this org and categorize by completion state
    const campaigns = await Campaign.find({ createdBy: req.params.id });
    const activeCampaigns = campaigns.filter(c => !c.isCompleted);
    const completedCampaigns = campaigns.filter(c => c.isCompleted);

    res.render("organizationWork", {
      organization,
      activeCampaigns,
      completedCampaigns
    });

  } catch (err) {
    res.send(err.message);
  }
});

const PORT = 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
