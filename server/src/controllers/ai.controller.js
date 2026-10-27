const { requireProjectLead } = require("../utils/projectAuth");

const generateTaskSuggestions = async (req, res) => {
    try {
        const { prompt, projectId } = req.body;

        if (
            typeof prompt !== "string" ||
            !prompt.trim() ||
            prompt.length > 5000
        ) {
            return res.status(400).json({
                message: "Prompt must be between 1 and 5000 characters",
            });
        }

        const parsedProjectId = Number(projectId);

        if (
            !Number.isSafeInteger(parsedProjectId) ||
            parsedProjectId <= 0
        ) {
            return res.status(400).json({
                message: "Invalid project ID",
            });
        }

        const membership = await requireProjectLead(
            req.user.userId,
            parsedProjectId
        );

        if (membership === null) {
            return res.status(403).json({
                message: "You are not a member of this project",
            });
        }

        if (membership === false) {
            return res.status(403).json({
                message: "Only project leads can generate tasks",
            });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                message: "Gemini API key is not configured",
            });
        }
        const startTime = Date.now();

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": process.env.GEMINI_API_KEY,
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: `
Generate exactly 5 practical tasks for this project:

${prompt.trim()}

Return only JSON:
{
  "tasks": [
    {
      "title": "Short actionable title",
      "description": "Brief description"
    }
  ]
}

Keep descriptions concise, avoid duplicates,
and do not include markdown or deadlines.
`,
                                },
                            ],
                        },
                    ],
                    generationConfig: {
                        responseMimeType: "application/json",
                        temperature: 0.4,
                        maxOutputTokens: 1000,
                    },
                }),
            }
        );

        console.log(
        `Gemini response time: ${Date.now() - startTime}ms`
        );

        if (!response.ok) {
            const details = await response.text();
            console.error("Gemini API error:", details);

            return res.status(502).json({
                message: "AI task generation failed. Try again later.",
            });
        }

        const data = await response.json();
        const generatedText =
            data.candidates?.[0]?.content?.parts
                ?.map((part) => part.text || "")
                .join("") || "";

        const result = JSON.parse(generatedText);

        if (
            !Array.isArray(result.tasks) ||
            result.tasks.length === 0 ||
            result.tasks.length > 10 ||
            !result.tasks.every(
                (task) =>
                    typeof task.title === "string" &&
                    task.title.trim() &&
                    typeof task.description === "string"
            )
        ) {
            throw new Error("Invalid task suggestions returned by AI");
        }

        return res.status(200).json({
            tasks: result.tasks.map((task) => ({
                title: task.title.trim().slice(0, 150),
                description: task.description.trim().slice(0, 2000),
            })),
        });
    } catch (error) {
        console.error("Task suggestion error:", error.message);

        return res.status(500).json({
            message: "Could not generate task suggestions",
        });
    }
};

module.exports = { generateTaskSuggestions };