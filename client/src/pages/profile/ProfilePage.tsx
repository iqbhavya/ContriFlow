import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getUserProfile, updateUserProfile } from "../../services/user.service";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Mail, Calendar, ArrowLeft, Pencil, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

const getUserIdFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.userId as number;
  } catch {
    return null;
  }
};


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
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const currentUserId = getUserIdFromToken();

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

  const handleSave = async () => {
    if (!profile || !userId) return;
    const trimmedName = editedName.trim();
    if (trimmedName.length < 2) {
      toast.error("Name must be at least 2 characters long");
      return;
    }
    try {
      setIsSaving(true);
      const res = await updateUserProfile(Number(userId), { name: trimmedName });
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              user: {
                ...prev.user,
                name: res.user.name,
              },
            }
          : null
      );
      toast.success("Username updated successfully!");
      setIsEditing(false);
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || "Failed to update username";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

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
                <div className="space-y-1 w-full flex flex-col items-center">
                  {isEditing ? (
                    <div className="flex items-center gap-2 max-w-[240px] w-full justify-center mt-1">
                      <Input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="h-8 text-center font-semibold text-base py-0 text-foreground border-primary/30 focus-visible:ring-primary"
                        placeholder="Enter name"
                        disabled={isSaving}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSave();
                          if (e.key === "Escape") setIsEditing(false);
                        }}
                        autoFocus
                      />
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="p-1.5 bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50 disabled:bg-transparent rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                        title="Save Name"
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        disabled={isSaving}
                        className="p-1.5 bg-muted/60 text-muted-foreground hover:bg-muted/80 disabled:opacity-50 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 group">
                      <h3 className="text-xl font-bold leading-none">{profile.user.name}</h3>
                      {currentUserId === profile.user.id && (
                        <button
                          onClick={() => {
                            setEditedName(profile.user.name);
                            setIsEditing(true);
                          }}
                          className="p-1 text-muted-foreground hover:text-primary rounded-full hover:bg-primary/5 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all cursor-pointer duration-200"
                          title="Edit Username"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
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
