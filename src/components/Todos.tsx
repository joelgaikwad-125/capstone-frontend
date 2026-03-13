import { useEffect, useState, createContext, useContext } from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  Input,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  Stack,
  Text,
  DialogActionTrigger,
} from "@chakra-ui/react";

/* API URL (works locally + Kubernetes) */
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/* Todo type */
interface Todo {
  id: string;
  item: string;
}

interface TodosContextType {
  todos: Todo[];
  fetchTodos: () => void;
}

interface UpdateTodoProps {
  item: string;
  id: string;
  fetchTodos: () => void;
}

interface TodoHelperProps {
  item: string;
  id: string;
  fetchTodos: () => void;
}

interface DeleteTodoProps {
  id: string;
  fetchTodos: () => void;
}

/* Context */
const TodosContext = createContext<TodosContextType>({
  todos: [],
  fetchTodos: () => {}
});

/* Add Todo */
function AddTodo() {
  const [item, setItem] = useState("");
  const { todos, fetchTodos } = useContext(TodosContext);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newTodo = {
      id: String(todos.length + 1),
      item: item
    };

    fetch(`${API_URL}/todo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTodo)
    }).then(fetchTodos);

    setItem("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        type="text"
        placeholder="Add a todo item"
        value={item}
        onChange={(e) => setItem(e.target.value)}
      />
    </form>
  );
}

/* Update Todo */
const UpdateTodo = ({ item, id, fetchTodos }: UpdateTodoProps) => {
  const [todo, setTodo] = useState(item);

  const updateTodo = async () => {
    await fetch(`${API_URL}/todo/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item: todo }),
    });

    fetchTodos();
  };

  return (
    <DialogRoot>
      <DialogTrigger asChild>
        <Button h="1.5rem" size="sm">Update</Button>
      </DialogTrigger>

      <DialogContent
        position="fixed"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        bg="white"
        p={6}
        rounded="md"
        shadow="xl"
        maxW="md"
        w="90%"
        zIndex={1000}
      >
        <DialogHeader>
          <DialogTitle>Update Todo</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <Input
            value={todo}
            onChange={(e) => setTodo(e.target.value)}
          />
        </DialogBody>

        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button variant="outline" size="sm">Cancel</Button>
          </DialogActionTrigger>

          <Button size="sm" onClick={updateTodo}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

/* Delete Todo */
const DeleteTodo = ({ id, fetchTodos }: DeleteTodoProps) => {

  const deleteTodo = async () => {
    await fetch(`${API_URL}/todo/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" }
    });

    fetchTodos();
  };

  return (
    <Button h="1.5rem" size="sm" ml={2} onClick={deleteTodo}>
      Delete
    </Button>
  );
};

/* Todo Item */
function TodoHelper({ item, id, fetchTodos }: TodoHelperProps) {
  return (
    <Box p={2} shadow="sm">
      <Flex justify="space-between" align="center">
        <Text>{item}</Text>

        <Flex>
          <UpdateTodo item={item} id={id} fetchTodos={fetchTodos}/>
          <DeleteTodo id={id} fetchTodos={fetchTodos}/>
        </Flex>
      </Flex>
    </Box>
  );
}

/* Main Component */
export default function Todos() {

  const [todos, setTodos] = useState<Todo[]>([]);

  const fetchTodos = async () => {
    const response = await fetch(`${API_URL}/todo`);
    const data = await response.json();
    setTodos(data.data);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <TodosContext.Provider value={{ todos, fetchTodos }}>
      <Container maxW="container.xl" pt="100px">

        <AddTodo />

        <Stack gap={4} mt={6}>
          {
            todos.map((todo) => (
              <TodoHelper
                key={todo.id}
                item={todo.item}
                id={todo.id}
                fetchTodos={fetchTodos}
              />
            ))
          }
        </Stack>

      </Container>
    </TodosContext.Provider>
  );
}
