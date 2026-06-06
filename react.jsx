import { useState } from "react";

const card = {
  background: "var(--color-background-secondary)",
  borderRadius: 12,
  padding: "24px",
  marginBottom: 20,
};

const btn = {
  padding: "8px 20px",
  borderRadius: 8,
  border: "1px solid var(--color-border-secondary)",
  background: "var(--color-background-primary)",
  color: "var(--color-text-primary)",
  fontSize: 15,
  cursor: "pointer",
};

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div style={card}>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Counter</h2>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 48, fontWeight: 700, marginBottom: 16 }}>{count}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={() => setCount(c => c - 1)} style={btn}>−</button>
          <button onClick={() => setCount(0)} style={{ ...btn, color: "var(--color-text-secondary)", fontSize: 13 }}>Reset</button>
          <button onClick={() => setCount(c => c + 1)} style={btn}>+</button>
        </div>
      </div>
    </div>
  );
}

function TodoList() {
  const [items, setItems] = useState(["Buy groceries", "Read a book"]);
  const [input, setInput] = useState("");

  const add = () => {
    if (!input.trim()) return;
    setItems(prev => [...prev, input.trim()]);
    setInput("");
  };

  return (
    <div style={card}>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>To-do list</h2>
      <ul style={{ listStyle: "none", padding: 0, marginBottom: 14 }}>
        {items.map((item, i) => (
          <li key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--color-border-tertiary)", fontSize: 14, color: "var(--color-text-primary)" }}>
            {item}
            <button onClick={() => setItems(prev => prev.filter((_, j) => j !== i))} style={{ ...btn, padding: "2px 10px", fontSize: 12, color: "var(--color-text-secondary)" }}>✕</button>
          </li>
        ))}
      </ul>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && add()}
          placeholder="Add a task..."
          style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--color-border-secondary)", background: "var(--color-background-primary)", color: "var(--color-text-primary)", fontSize: 14, outline: "none" }}
        />
        <button onClick={add} style={btn}>Add</button>
      </div>
    </div>
  );
}

function UserCard() {
  return (
    <div style={card}>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>User card</h2>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#CECBF6", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, color: "#3C3489", flexShrink: 0 }}>JD</div>
        <div>
          <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>Jane Doe</p>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Frontend Developer</p>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>jane@example.com</p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div style={{ maxWidth: 480, margin: "60px auto", padding: "0 24px", fontFamily: "sans-serif", color: "var(--color-text-primary)" }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Simple React Page</h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: 28, fontSize: 14 }}>Three basic components below.</p>
      <Counter />
      <TodoList />
      <UserCard />
    </div>
  );
}
