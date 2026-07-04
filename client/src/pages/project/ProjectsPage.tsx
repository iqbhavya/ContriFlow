import { useEffect,useState } from "react";
import { getMyProjects } from "../../services/project.service";

type Project = {
  id: number;
  name: string;
  description: string | null;
  role: "LEAD" | "MEMBER";
};

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
  <div>
    <h1>My Projects</h1>

    {projects.map((project) => (
      <div key={project.id}>
        <h2>{project.name}</h2>
        <p>{project.description}</p>
        <p>{project.role}</p>
      </div>
    ))}
  </div>
  );
};

export default ProjectsPage;