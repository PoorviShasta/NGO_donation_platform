const express = require("express");
const router = express.Router();
const Campaign = require("../models/Campaign");
const Donation = require("../models/Donation");
const User = require("../models/user");
const requireLogin = require("../middleware/auth");
const upload = require("../middleware/upload");
const ensureNgo = (req, res) => {
  if (req.user.role !== "ngo") {
    res.status(403).send("Only NGOs can do this action.");
    return false;
  }
  return true;
};

const updateCompletionStatus = (campaign) => {
  const raisedAmount = Number(campaign.raisedAmount || 0);
  const goalAmount = Number(campaign.goalAmount || 0);
  campaign.isCompleted = goalAmount > 0 && raisedAmount >= goalAmount;
};

const isOwner = (campaign, userId) => {
  if (!campaign || !campaign.createdBy) return false;
  return campaign.createdBy.toString() === userId;
};

// Keep legacy path but use dashboard form as the source of truth.
router.get("/create", requireLogin, (req, res) => {
  res.redirect("/dashboard");
});

// Create campaign
router.post("/create", requireLogin, upload.single("image"), async (req, res) => {
  try {
    if (!ensureNgo(req, res)) return;

    const { title, description, goalAmount, deadline, category } = req.body;
    const parsedGoalAmount = Number(goalAmount);

    if (!Number.isFinite(parsedGoalAmount) || parsedGoalAmount <= 0) {
      return res.status(400).send("Goal amount must be greater than 0.");
    }

    const campaignData = {
      title,
      description,
      goalAmount: parsedGoalAmount,
      deadline,
      category,
      createdBy: req.user.id
    };

    if (req.file) {
      campaignData.image = `/uploads/${req.file.filename}`;
    }

    await Campaign.create(campaignData);
    res.redirect("/dashboard");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Keep legacy list path but route users to dashboard.
router.get("/", requireLogin, (req, res) => {
  res.redirect("/dashboard");
});

// Show edit form
router.get("/:id/edit", requireLogin, async (req, res) => {
  try {
    if (!ensureNgo(req, res)) return;

    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).send("Campaign not found.");
    if (!isOwner(campaign, req.user.id)) return res.status(403).send("Forbidden");

    res.render("editCampaign", { campaign });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Campaign Details
router.get("/:id", requireLogin, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate("createdBy");
    if (!campaign) return res.status(404).send("Campaign not found.");

    if (!campaign.isCompleted && Number(campaign.raisedAmount) >= Number(campaign.goalAmount)) {
      campaign.isCompleted = true;
      await campaign.save();
    }

    const user = await User.findById(req.user.id);
    res.render("campaignDetails", { campaign, user });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Show Donate Page
router.get("/:id/donate", requireLogin, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).send("Campaign not found.");

    if (!campaign.isCompleted && Number(campaign.raisedAmount) >= Number(campaign.goalAmount)) {
      campaign.isCompleted = true;
      await campaign.save();
    }

    if (campaign.isCompleted) return res.redirect(`/campaigns/${campaign._id}`);
    res.render("donate", { campaign });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Handle Donation
router.post("/:id/donate", requireLogin, async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).send("Donation amount must be greater than 0.");
    }

    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).send("Campaign not found.");

    if (campaign.isCompleted) return res.redirect(`/campaigns/${campaign._id}`);

    await Donation.create({
      donor: req.user.id,
      campaign: campaign._id,
      amount
    });

    campaign.raisedAmount = Number(campaign.raisedAmount || 0) + amount;
    updateCompletionStatus(campaign);
    await campaign.save();

    res.redirect(`/campaigns/${campaign._id}`);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Update campaign (edit)
router.post("/:id/edit", requireLogin, upload.single("image"), async (req, res) => {
  try {
    if (!ensureNgo(req, res)) return;

    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).send("Campaign not found.");
    if (!isOwner(campaign, req.user.id)) return res.status(403).send("Forbidden");

    const { title, description, goalAmount, deadline, category } = req.body;
    const parsedGoalAmount = Number(goalAmount);

    if (!Number.isFinite(parsedGoalAmount) || parsedGoalAmount <= 0) {
      return res.status(400).send("Goal amount must be greater than 0.");
    }

    campaign.title = title;
    campaign.description = description;
    campaign.goalAmount = parsedGoalAmount;
    campaign.deadline = deadline;
    campaign.category = category;

    if (req.file) {
      campaign.image = `/uploads/${req.file.filename}`;
    }

    updateCompletionStatus(campaign);
    await campaign.save();

    res.redirect(`/campaigns/${campaign._id}`);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Delete campaign
router.post("/:id/delete", requireLogin, async (req, res) => {
  try {
    if (!ensureNgo(req, res)) return;

    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.redirect("/dashboard");
    if (!isOwner(campaign, req.user.id)) return res.status(403).send("Forbidden");

    await Donation.deleteMany({ campaign: campaign._id });
    await Campaign.deleteOne({ _id: campaign._id });

    res.redirect("/dashboard");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post("/organization/update", requireLogin, async (req, res) => {
  try {
    const { about, workHistory, website, contactNumber } = req.body;

    await User.findByIdAndUpdate(req.user.id, {
      about,
      workHistory,
      website,
      contactNumber
    });

    res.redirect("/organization/" + req.user.id);

  } catch (err) {
    res.send(err.message);
  }
});

router.post("/organization/upload", requireLogin, upload.single("image"), async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      $push: { workImages: req.file.filename }
    });

    res.redirect("/organization/" + req.user.id);

  } catch (err) {
    res.send(err.message);
  }
});

module.exports = router;
