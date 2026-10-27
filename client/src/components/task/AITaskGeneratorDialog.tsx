import { useState } from "react";
import { Input } from "../ui/input";
import { generateTaskSuggestions } from "../../services/task.service";
import { createTask } from "../../services/task.service";
import type { SuggestedTask } from "../../services/task.service";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Sparkles } from "lucide-react";

type Props = {
    projectId: number;
    onTasksCreated: () => void;
};

export default function AITaskGeneratorDialog({ projectId, onTasksCreated }: Props) {
    const [open, setOpen] = useState(false);
    const [prompt, setPrompt] = useState("");

    const [suggestions, setSuggestions] = useState<
        (SuggestedTask & { selected: boolean })[]
    >([]);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleGenerate = async () => {
        setLoading(true);
        setError("");
        setSuggestions([]);

        try {
            const tasks = await generateTaskSuggestions(prompt, projectId);

            setSuggestions(
                tasks.map((task) => ({
                    ...task,
                    selected: true,
                }))
            );
        } catch (err) {
            console.error(err);
            setError("Could not generate tasks. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSelected = async () => {
        const selectedTasks = suggestions.filter(
            (task) => task.selected && task.title.trim()
        );

        if (selectedTasks.length === 0) {
            setError("Select at least one task with a title.");
            return;
        }

        setSaving(true);
        setError("");

        let createdCount = 0;

        try {
            for (const task of selectedTasks) {
                await createTask({
                    title: task.title.trim(),
                    description: task.description.trim(),
                    projectId,
                });

                createdCount++;
            }

            onTasksCreated();
            setSuggestions([]);
            setPrompt("");
            setOpen(false);
        } catch (err) {
            console.error(err);

            // Remove tasks already created from the pending suggestions.
            setSuggestions((current) =>
                current.filter(
                    (task) =>
                        !selectedTasks
                            .slice(0, createdCount)
                            .some(
                                (created) =>
                                    created.title === task.title &&
                                    created.description === task.description
                            )
                )
            );

            onTasksCreated();

            setError(
                `${createdCount} task(s) created successfully. ` +
                `The remaining tasks were not all created. Review the list before retrying.`
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>

            <DialogTrigger asChild>
                <Button variant="outline">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Tasks with AI
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        AI Task Generator
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Describe your project or goal. AI will suggest tasks
                        that your team can review and edit.
                    </p>

                    <Textarea
                        placeholder="Example: Build a college event management website with authentication, event registration, and an admin dashboard..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={5}
                    />

                    <p className="text-xs text-muted-foreground">
                        Review the generated tasks before adding them to your project.
                    </p>

                    <Button
                        className="w-full"
                        disabled={!prompt.trim() || loading}
                        onClick={handleGenerate}
                    >
                        <Sparkles className="mr-2 h-4 w-4" />
                        {loading ? "Generating..." : "Generate Tasks"}
                    </Button>

                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}

                    {suggestions.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="font-medium">
                                Review suggestions ({suggestions.length})
                            </h3>

                            <div className="max-h-80 space-y-4 overflow-y-auto pr-2">
                                {suggestions.map((task, index) => (
                                    <div
                                        key={index}
                                        className="space-y-2 rounded-lg border p-3"
                                    >
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={task.selected}
                                                onChange={(e) => {
                                                    setSuggestions((current) =>
                                                        current.map((item, i) =>
                                                            i === index
                                                                ? { ...item, selected: e.target.checked }
                                                                : item
                                                        )
                                                    );
                                                }}
                                            />

                                            <span className="text-sm font-medium">
                                                Include this task
                                            </span>

                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                className="ml-auto"
                                                onClick={() =>
                                                    setSuggestions((current) =>
                                                        current.filter((_, i) => i !== index)
                                                    )
                                                }
                                            >
                                                Remove
                                            </Button>
                                        </div>

                                        <Input
                                            value={task.title}
                                            maxLength={150}
                                            placeholder="Task title"
                                            onChange={(e) =>
                                                setSuggestions((current) =>
                                                    current.map((item, i) =>
                                                        i === index
                                                            ? { ...item, title: e.target.value }
                                                            : item
                                                    )
                                                )
                                            }
                                        />

                                        <Textarea
                                            value={task.description}
                                            maxLength={2000}
                                            placeholder="Task description"
                                            rows={3}
                                            onChange={(e) =>
                                                setSuggestions((current) =>
                                                    current.map((item, i) =>
                                                        i === index
                                                            ? { ...item, description: e.target.value }
                                                            : item
                                                    )
                                                )
                                            }
                                        />
                                    </div>
                                ))}
                            </div>

                            <Button
                                className="w-full"
                                disabled={
                                    saving ||
                                    !suggestions.some(
                                        (task) => task.selected && task.title.trim()
                                    )
                                }
                                onClick={handleCreateSelected}
                            >
                                {saving ? "Creating Tasks..." : "Create Selected Tasks"}
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>

        </Dialog>
    );
}


