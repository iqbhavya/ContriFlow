import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getProject } from "../../services/project.service";
import type { ProjectDetails } from "../../types/project";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/card";

import { Badge } from "../../components/ui/badge";



function ProjectDetailsPage() {
  const { projectId } = useParams();

  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (!projectId) return;

        const data = await getProject(projectId);

        setProject(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load project.");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  if (loading) {
    return <h2>Loading project...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  if (!project) {
    return <h2>Project not found.</h2>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 py-10">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription>{project.description}</CardDescription>
            </div>

            <Badge variant={project.role === "LEAD" ? "default" : "secondary"}>
              {project.role}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {project.inviteCode && (
            <div>
              <h3 className="font-semibold">Invite Code</h3>
              <p className="font-mono">{project.inviteCode}</p>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-2">
              Members ({project.members.length})
            </h3>

            <div className="space-y-2">
              {project.members.map((member) => (
                <div
                  key={member.id}
                  className="flex justify-between border rounded-lg p-3"
                >
                  <div>
                    <p>{member.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.email}
                    </p>
                  </div>

                  <Badge
                    variant={member.role === "LEAD" ? "default" : "secondary"}
                  >
                    {member.role}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProjectDetailsPage;
