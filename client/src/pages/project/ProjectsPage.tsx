import { useEffect, useState } from "react";
import { getMyProjects } from "../../services/project.service";
import CreateProjectDialog from "../../components/project/CreateProjectDialog";


import { Button } from "../../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

import type { Project } from "../../types/project";

function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getMyProjects();

        setProjects(data);
      } catch {
        setError("Failed to fetch projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return <h2>Loading projects...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  if (projects.length === 0) {
    return (
      <div>
        <h2>No projects yet</h2>
        <p>Create a project or join one using an invite code.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Projects</h1>

        <div className="flex gap-3">
          <CreateProjectDialog />
          <Button variant="outline">Join Project</Button>
        </div>
      </div>

      {projects.map((project) => (
        <Card key={project.id} className="mb-4">
          <CardHeader>
            <CardTitle>{project.name}</CardTitle>

            <CardDescription>{project.description}</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex items-center justify-between">
              <Badge
                variant={project.role === "LEAD" ? "default" : "secondary"}
              >
                {project.role}
              </Badge>

              <Button variant="outline">Open Project</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default ProjectsPage;
