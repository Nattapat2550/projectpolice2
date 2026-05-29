import AllTaskItem from "../TaskContent/AllTaskItem";
import styles from "./TaskDisplayer.module.css";

type Task = {
    id: string;
    name: string;
    personInCharge: string;
    date: string;
    status: string;
};


type Props = {
    tasks: Task[];
    onStatusChange: (
        id: string,
        status: TaskStatus
    ) => void;
};

type TaskStatus = "following" | "problem" | "completed";


export default function TaskDisplayer({
    tasks,
    onStatusChange
}: Props) {

    console.log(tasks);

    // Sort by date 
    const sortedTasks = [...tasks].sort(
        (a, b) =>
            new Date(a.date).getTime() -
            new Date(b.date).getTime()
    );

    

    return (
        <div className={styles.ContentContent}>
            <div className={styles.ContentContentScrollable}>
                {sortedTasks.map((task) => (
                    <AllTaskItem
                        key={task.id}
                        id={task.id}
                        name={task.name}
                        personInCharge={task.personInCharge}
                        date={task.date}
                        status={task.status}
                        onStatusChange={onStatusChange}
                    />
                ))}
            </div>
        </div>
    );
}