import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getProject } from "../../services/project.service";
import type { ProjectDetails } from "../../types/project";

import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";

import {
  ArrowLeft,
  Users,
  ClipboardList,
  FolderKanban,
  UserPlus,
  Plus,
} from "lucide-react";

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
        console.log(data);
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
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      <Link
        to="/projects"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </Link>

      <Card>
        <CardHeader className="space-y-5">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-5">
            <div>
              <CardTitle className="text-3xl">{project.name}</CardTitle>

              <CardDescription className="mt-2 text-base">
                {project.description}
              </CardDescription>
            </div>

            <Badge variant={project.role === "LEAD" ? "default" : "secondary"}>
              {project.role}
            </Badge>
          </div>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="flex items-center gap-3 p-5">
                <Users className="w-6 h-6" />

                <div>
                  <p className="text-sm text-muted-foreground">Members</p>

                  <p className="text-2xl font-bold">{project.stats.members}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-3 p-5">
                <ClipboardList className="w-6 h-6" />

                <div>
                  <p className="text-sm text-muted-foreground">Tasks</p>

                  <p className="text-2xl font-bold">{project.stats.tasks}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-3 p-5">
                <FolderKanban className="w-6 h-6" />

                <div>
                  <p className="text-sm text-muted-foreground">Your Role</p>

                  <p className="font-semibold">{project.role}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {project.inviteCode && (
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">Invite Code</p>

                <p className="font-mono text-lg mt-2">{project.inviteCode}</p>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-wrap gap-3">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Task
            </Button>

            <Button variant="outline">
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Member
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tasks</CardTitle>

            <CardDescription>Tasks assigned in this project</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="border rounded-xl py-12 text-center">
              <ClipboardList className="mx-auto w-10 h-10 mb-3 text-muted-foreground" />

              <h3 className="font-semibold text-lg">No tasks yet</h3>

              <p className="text-muted-foreground mt-2">
                Create your first task to start collaborating.
              </p>

              <Button className="mt-6">Create Task</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Members ({project.members.length})</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {project.members.map((member) => (
              <div
                key={member.id}
                className="flex justify-between items-center border rounded-lg p-3"
              >
                <span>{member.name}</span>

                <Badge
                  variant={member.role === "LEAD" ? "default" : "secondary"}
                >
                  {member.role}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ProjectDetailsPage;
