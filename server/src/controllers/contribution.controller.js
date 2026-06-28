const { createContributionService } = require("../services/contribution.service");

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

module.exports = {
  createContribution,
};