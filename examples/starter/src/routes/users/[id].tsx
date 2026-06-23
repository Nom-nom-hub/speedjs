export default function User({ id }: { id: string }) {
  return (
    <div>
      <h1>User {id}</h1>
      <p>This is a dynamic user page.</p>
    </div>
  );
}
