import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getUserProfile } from "../../services/user.service";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Mail, Calendar, ArrowLeft } from "lucide-react";

interface UserProfile {
  user: {
    id: number;
    name: string;
    email: string;
    createdAt: string;
  };
  projects: Array<{
    id: number;
    name: string;
    role: string;
    joinedAt: string;
  }>;
  contributions: Array<{
    id: number;
    title: string;
    status: string;
    createdAt: string;
    task: {
      title: string;
      project: {
        name: string;
      };
    };
  }>;
  tasks: Array<{
    id: number;
    title: string;
    status: string;
    project: {
      name: string;
    };
    assignedAt: string;
  }>;
}

function ProfilePage() {
  const { userId } = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      try {
        const data = await getUserProfile(Number(userId));
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) {
    return <div className="py-12 text-center text-muted-foreground text-sm">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="py-12 text-center text-muted-foreground text-sm">User profile not found.</div>;
  }

  return (
    <div className="space-y-6">
      <Link
        to="/projects"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </Link>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-3xl font-bold font-mono">
                  {profile.user.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold leading-none">{profile.user.name}</h3>
                  <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground pt-2">
                    <Mail className="w-4 h-4" />
                    <span>{profile.user.email}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/80 pt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Member since {new Date(profile.user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border/50">
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold text-foreground">{profile.projects.length}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">Projects</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold text-foreground">{profile.tasks.length}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">Tasks</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold text-foreground">{profile.contributions.length}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">Contribs</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Projects</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.projects.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Not assigned to any projects.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {profile.projects.map((proj) => (
                    <div key={proj.id} className="p-4 border rounded-xl flex items-center justify-between bg-card hover:border-primary/20 transition-all">
                      <div className="space-y-1">
                        <span className="font-semibold text-foreground">{proj.name}</span>
                        <span className="block text-xs text-muted-foreground">
                          Joined {new Date(proj.joinedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <Badge variant={proj.role === "LEAD" ? "default" : "secondary"}>
                        {proj.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Task Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No tasks assigned.</p>
              ) : (
                <div className="space-y-3">
                  {profile.tasks.map((task) => (
                    <div key={task.id} className="flex justify-between items-center p-3 border rounded-xl hover:border-primary/20 transition-all bg-card">
                      <div className="space-y-1">
                        <span className="font-semibold text-sm text-foreground">{task.title}</span>
                        <span className="block text-xs text-muted-foreground">{task.project.name}</span>
                      </div>
                      <Badge variant={task.status === "DONE" ? "default" : task.status === "IN_PROGRESS" ? "secondary" : "outline"}>
                        {task.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Contributions</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.contributions.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No contributions submitted yet.</p>
              ) : (
                <div className="space-y-3">
                  {profile.contributions.map((cont) => (
                    <div key={cont.id} className="flex justify-between items-center p-3 border rounded-xl hover:border-primary/20 transition-all bg-card">
                      <div className="space-y-1">
                        <span className="font-semibold text-sm text-foreground">{cont.title}</span>
                        <span className="block text-xs text-muted-foreground">
                          {cont.task.title} • {cont.task.project.name}
                        </span>
                      </div>
                      <Badge variant={cont.status === "APPROVED" ? "default" : cont.status === "REJECTED" ? "destructive" : "outline"}>
                        {cont.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
