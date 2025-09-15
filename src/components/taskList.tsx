import { api } from "../trpc/react";

const TaskList = () => {
  const { data, isLoading, error } = api.adminTask.getAll.useQuery();

  if (isLoading) return <div>Loading tasks...</div>;
  if (error)
    return (
      <div>
        Error loading tasks:{" "}
        {error instanceof Error ? error.message : "Unknown error"}
      </div>
    );

  return (
    <div>
      <h2>All Tasks for All Users</h2>
      <ul>
        {Array.isArray(data) && data.length > 0 ? (
          data.map((task) => (
            <li key={task.id}>
              <strong>Task ID:</strong> {task.id}
              <br />
              <strong>Description:</strong> {task.description}
              <br />
              <strong>Assigned To:</strong>{" "}
              {task.assignedTo?.name ?? task.assignedTo?.id ?? "Unknown"}
              <br />
              <strong>Created By:</strong>{" "}
              {task.createdBy?.name ?? task.createdBy?.id ?? "Unknown"}
            </li>
          ))
        ) : (
          <li>No tasks found.</li>
        )}
      </ul>
    </div>
  );
};

export default TaskList;
