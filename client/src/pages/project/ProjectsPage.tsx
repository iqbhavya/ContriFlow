import { useEffect, useState } from "react";
import { getMyProjects } from "../../services/project.service";
import CreateProjectDialog from "../../components/project/CreateProjectDialog";
import JoinProjectDialog from "../../components/project/JoinProjectDialog";

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

import { useNavigate } from "react-router-dom";

// eslint-disable-next-line react-hooks/rules-of-hooks


function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const data = await getMyProjects();

      setProjects(data);
    } catch (error) {
      console.log(error);
      setError("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      <div className="min-h-[85vh] flex items-center justify-center p-6">
        <Card className="w-full max-w-lg border border-border/80 shadow-md">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-xl mb-4 border border-primary/10">
              📁
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">No Projects Yet</CardTitle>
            <CardDescription className="text-base mt-2 text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Create a new project or join an existing one using an invite code to start tracking contributions.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row justify-center gap-3 pt-6 border-t border-border/50">
            <CreateProjectDialog onProjectCreated={fetchProjects} />
            <JoinProjectDialog onProjectJoined={fetchProjects} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Projects</h1>

        <div className="flex gap-3">
          <CreateProjectDialog onProjectCreated={fetchProjects} />
          <JoinProjectDialog onProjectJoined={fetchProjects} />
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

              <Button
                variant="outline"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                Open Project
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default ProjectsPage;
