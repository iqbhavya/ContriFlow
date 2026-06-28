const { createContributionService, 
        reviewContributionService,
        getTaskContributionsService,
} = require("../services/contribution.service");

const createContribution = async (req, res) => {
  try {

    let {
      taskId,
      title,
      description,
      proofUrl,
      contributors,
    } = req.body;

    taskId = Number(taskId);

    if (Number.isNaN(taskId)) {
      return res.status(400).json({
        message: "Invalid task ID",
      });
    }

    if (!title) {
      return res.status(400).json({
        message: "Contribution title is required",
      });
    }

    if (!Array.isArray(contributors)) {
      return res.status(400).json({
        message: "Contributors must be an array",
      });
    }

    contributors = [...new Set(contributors)];

    if (contributors.length === 0) {
      return res.status(400).json({
        message: "At least one contributor is required",
      });
    }

    const contribution = await createContributionService({
      submittedById: req.user.userId,
      taskId,
      title,
      description,
      proofUrl,
      contributors,
    });

    return res.status(201).json({
      message: "Contribution submitted successfully",
      contribution,
    });

  } catch (error) {
    console.error(error);

    const response = {
      message: error.message || "Internal Server Error",
    };

    if (error.invalidContributors) {
      response.invalidContributors = error.invalidContributors;
    }

    return res.status(error.status || 500).json(response);
  }
};



const reviewContribution = async (req, res) => {
  try {
    const contributionId = Number(req.params.contributionId);

    if (Number.isNaN(contributionId)) {
      return res.status(400).json({
        message: "Invalid contribution ID",
      });
    }

    const { status, feedback } = req.body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({
        message: "Status must be APPROVED or REJECTED",
      });
    }

    const contribution = await reviewContributionService({
      reviewerId: req.user.userId,
      contributionId,
      status,
      feedback,
    });

    return res.status(200).json({
      message: `Contribution ${status.toLowerCase()} successfully`,
      contribution,
    });

  } catch (error) {
    console.error(error);

    return res.status(error.status || 500).json({
      message: error.message || "Internal Server Error",
    });
  }
};

const getTaskContributions = async (req, res) => {
  try {
    const taskId = Number(req.params.taskId);

    if (Number.isNaN(taskId)) {
      return res.status(400).json({
        message: "Invalid task ID",
      });
    }

    const result = await getTaskContributionsService({
      userId: req.user.userId,
      taskId,
    });

    return res.status(200).json(result);

  } catch (error) {
    console.error(error);

    return res.status(error.status || 500).json({
      message: error.message || "Internal Server Error",
    });
  }
};

module.exports = {
  createContribution,
  reviewContribution,
  getTaskContributions,
};