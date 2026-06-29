const {
  getProjectDashboardService,
  getMemberStatisticsService,
} = require("../services/dashboard.service");

const getProjectDashboard = async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);

    if (Number.isNaN(projectId)) {
      return res.status(400).json({
        message: "Invalid project ID",
      });
    }

    const dashboard = await getProjectDashboardService({
      userId: req.user.userId,
      projectId,
    });

    return res.status(200).json(dashboard);

  } catch (error) {
    console.error(error);

    return res.status(error.status || 500).json({
      message: error.message || "Internal Server Error",
    });
  }
};

const getMemberStatistics = async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);

    if (Number.isNaN(projectId)) {
      return res.status(400).json({
        message: "Invalid project ID",
      });
    }

    const members = await getMemberStatisticsService({
      userId: req.user.userId,
      projectId,
    });

    return res.status(200).json({
      members,
    });

  } catch (error) {
    console.error(error);

    return res.status(error.status || 500).json({
      message: error.message || "Internal Server Error",
    });
  }
};

module.exports = {
  getProjectDashboard,
  getMemberStatistics,
};